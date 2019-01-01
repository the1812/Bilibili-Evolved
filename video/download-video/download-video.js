(() =>
{
    return (_, resources) =>
    {
        // const VideoInfo = resources.attributes.videoInfo.export.VideoInfo;
        // const BangumiInfo = resources.attributes.videoInfo.export.BangumiInfo;
        const pageData = {
            entity: null,
            aid: undefined,
            cid: undefined,
            isBangumi: false,
        };

        const bangumiUrls = [];
        $(document).ajaxSend((event, request, params) =>
        {
            if (params.url.indexOf("https://bangumi.bilibili.com/player/web_api/v2/playurl") !== -1)
            {
                bangumiUrls.unshift(params.url);
            }
        });
        class Video
        {
            constructor()
            {
                this.menuPanel = document.querySelector(".download-video-panel");
                this.menuClasses = ["quality", "action", "progress"];
                this.currentMenuClass = "quality";
            }
            addMenuClass()
            {
                this.menuPanel.classList.remove(...this.menuClasses);
                this.menuPanel.classList.add(this.currentMenuClass);
                return this.currentMenuClass;
            }
            resetMenuClass()
            {
                [this.currentMenuClass] = this.menuClasses;
                this.addMenuClass();
            }
            nextMenuClass()
            {
                const index = this.menuClasses.indexOf(this.currentMenuClass) + 1;
                const next = this.menuClasses[index >= this.menuClasses.length ? 0 : index];
                this.currentMenuClass = next;
                this.addMenuClass();
                return next;
            }
            addError()
            {
                this.menuPanel.classList.add("error");
            }
            removeError()
            {
                this.menuPanel.classList.remove("error");
                this.resetMenuClass();
            }
            async getUrl(quality)
            {
                if (quality)
                {
                    return `https://api.bilibili.com/x/player/playurl?avid=${pageData.aid}&cid=${pageData.cid}&qn=${quality}&otype=json`;
                }
                else
                {
                    return `https://api.bilibili.com/x/player/playurl?avid=${pageData.aid}&cid=${pageData.cid}&otype=json`;
                }
            }
        }
        class Bangumi extends Video
        {
            constructor(menuPanel)
            {
                super(menuPanel);
                this.menuClasses = ["action", "progress"];
                this.currentMenuClass = "action";
            }
            async getUrl()
            {
                const url = await SpinQuery.select(() => bangumiUrls[0])
                    .catch(() => logError("获取番剧下载链接失败."));
                return url;
            }
        }
        class VideoFormat
        {
            constructor(quality, internalName, displayName)
            {
                this.quality = quality;
                this.internalName = internalName;
                this.displayName = displayName;
            }
            async downloadInfo()
            {
                const videoInfo = new VideoDownloader(this);
                await videoInfo.fetchVideoInfo();
                return videoInfo;
            }
            static get availableFormats()
            {
                return new Promise((resolve, reject) =>
                {
                    pageData.entity.getUrl().then(url =>
                    {
                        const xhr = new XMLHttpRequest();
                        xhr.addEventListener("load", () =>
                        {
                            const json = JSON.parse(xhr.responseText);
                            if (json.code !== 0)
                            {
                                reject("获取清晰度信息失败.");
                            }
                            const data = json.data || json;
                            const qualities = data.accept_quality;
                            const internalNames = data.accept_format.split(",");
                            const displayNames = data.accept_description;
                            const formats = [];
                            while (qualities.length > 0)
                            {
                                const format = new VideoFormat(
                                    qualities.pop(),
                                    internalNames.pop(),
                                    displayNames.pop()
                                );
                                formats.push(format);
                            }
                            resolve(formats);
                        });
                        xhr.addEventListener("error", () => reject(`获取清晰度信息失败.`));
                        xhr.withCredentials = true;
                        xhr.open("GET", url);
                        xhr.send();
                    });
                });
            }
        }
        class VideoDownloaderFragment
        {
            constructor(length, size, url, backupUrls)
            {
                this.length = length;
                this.size = size;
                this.url = url;
                this.backupUrls = backupUrls;
            }
        }
        class VideoDownloader
        {
            constructor(format, fragments)
            {
                this.format = format;
                this.fragments = fragments || [];
                this.progress = null;
                this.loaded = 0;
                this.totalSize = null;
                this.workingXhr = null;
                this.fragmentSplitFactor = 6 * 5;
            }
            fetchVideoInfo()
            {
                return new Promise((resolve, reject) =>
                {
                    pageData.entity.getUrl(this.format.quality).then(url =>
                    {
                        const xhr = new XMLHttpRequest();
                        xhr.addEventListener("load", () =>
                        {
                            const json = JSON.parse(xhr.responseText.replace(/http:/g, "https:"));
                            const data = json.data || json;
                            if (!pageData.isBangumi && data.quality !== this.format.quality)
                            {
                                reject("获取下载链接失败, 请确认当前账号有下载权限后重试.");
                            }
                            const urls = data.durl;
                            this.fragments = urls.map(it => new VideoDownloaderFragment(
                                it.length, it.size,
                                it.url,
                                it.backup_url
                            ));
                            resolve(this.fragments);
                        });
                        xhr.withCredentials = true;
                        xhr.open("GET", url);
                        xhr.send();
                    });
                });
            }
            cancelDownload()
            {
                if ("forEach" in this.workingXhr)
                {
                    this.workingXhr.forEach(it => it.abort());
                }
                else
                {
                    logError("Cancel Download Failed: forEach in this.workingXhr not found.");
                }
            }
            downloadFragment(fragment)
            {
                const promises = [];
                this.workingXhr = [];
                const partialLength = Math.round(fragment.size / this.fragmentSplitFactor);
                let startByte = 0;
                while (startByte < fragment.size)
                {
                    const range = `bytes=${startByte}-${Math.min(fragment.size - 1, Math.round(startByte + partialLength))}`;
                    promises.push(new Promise((resolve, reject) =>
                    {
                        let loaded = 0;
                        const xhr = new XMLHttpRequest();
                        xhr.open("GET", fragment.url);
                        xhr.responseType = "arraybuffer";
                        xhr.withCredentials = false;
                        xhr.addEventListener("progress", (e) =>
                        {
                            this.loaded += e.loaded - loaded;
                            loaded = e.loaded;
                            this.progress && this.progress(this.loaded / this.totalSize);
                        });
                        xhr.addEventListener("load", () =>
                        {
                            if (("" + xhr.status)[0] === "2")
                            {
                                resolve(xhr.response);
                            }
                            else
                            {
                                reject(`请求失败.`);
                            }
                        });
                        xhr.addEventListener("abort", () => reject("下载已取消."));
                        xhr.addEventListener("error", () => reject(`下载失败.`));
                        xhr.setRequestHeader("Range", range);
                        xhr.send();
                        this.workingXhr.push(xhr);
                    }));
                    startByte = Math.round(startByte + partialLength);
                }
                return Promise.all(promises);
            }
            copyUrl()
            {
                const urls = this.fragments.map(it => it.url).reduce((acc, it) => acc + "\r\n" + it);
                GM_setClipboard(urls, "text");
            }
            extension(fragment)
            {
                return (fragment || this.fragments[0]).url
                    .indexOf(".flv") !== -1
                    ? ".flv"
                    : ".mp4";
            }
            makeBlob(data, fragment = null)
            {
                return new Blob(Array.isArray(data) ? data : [data], {
                    type: this.extension(fragment) === ".flv" ? "video/x-flv" : "video/mp4"
                });
            }
            cleanUpOldBlobUrl()
            {
                const oldBlobUrl = $("a#video-complete").attr("href");
                if (oldBlobUrl && $(`.link[href=${oldBlobUrl}]`).length === 0)
                {
                    URL.revokeObjectURL(oldBlobUrl);
                }
            }
            downloadSingle(downloadedData)
            {
                const [data] = downloadedData;
                const blob = this.makeBlob(data);
                const filename = document.title
                    .replace("_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili", "")
                    .replace("_番剧_bilibili_哔哩哔哩", "") + this.extension();
                return [blob, filename];
            }
            async downloadMultiple(downloadedData)
            {
                const zip = new JSZip();
                const title = document.title
                    .replace("_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili", "")
                    .replace("_番剧_bilibili_哔哩哔哩", "");
                if (downloadedData.length > 1)
                {
                    downloadedData.forEach((data, index) =>
                    {
                        const fragment = this.fragments[index];
                        zip.file(`${title} - ${index + 1}${this.extension(fragment)}`, this.makeBlob(data, fragment));
                    });
                }
                else
                {
                    const [data] = downloadedData;
                    zip.file(`${title}${this.extension()}`, this.makeBlob(data));
                }
                const blob = await zip.generateAsync({ type: "blob" });
                const filename = title + ".zip";
                return [blob, filename];
            }
            async download()
            {
                const downloadedData = [];
                this.loaded = 0;
                this.totalSize = this.fragments.map(it => it.size).reduce((acc, it) => acc + it);
                for (const fragment of this.fragments)
                {
                    const data = await this.downloadFragment(fragment);
                    downloadedData.push(data);
                }
                if (downloadedData.length < 1)
                {
                    throw new Error("下载失败.");
                }

                let blob = null;
                let filename = null;
                if (downloadedData.length === 1)
                {
                    [blob, filename] = this.downloadSingle(downloadedData);
                }
                else
                {
                    [blob, filename] = await this.downloadMultiple(downloadedData);
                }

                const blobUrl = URL.createObjectURL(blob);
                this.cleanUpOldBlobUrl();
                this.progress && this.progress(0);
                return {
                    url: blobUrl,
                    filename: filename
                };
            }
        }
        async function loadPageData()
        {
            const aid = await SpinQuery.select(() => (unsafeWindow || window).aid);
            const cid = await SpinQuery.select(() => (unsafeWindow || window).cid);
            pageData.aid = aid;
            pageData.cid = cid;
            if (document.URL.indexOf("bangumi") !== -1)
            {
                pageData.isBangumi = true;
                pageData.entity = new Bangumi();
            }
            else
            {
                pageData.entity = new Video();
            }
            return aid !== undefined && cid !== undefined;
        }
        async function loadWidget()
        {
            await loadPageData();
            const formats = await VideoFormat.availableFormats;
            let [selectedFormat] = formats;
            const getVideoInfo = () => selectedFormat.downloadInfo().catch(error =>
            {
                pageData.entity.addError();
                $(".video-error").text(error);
            });
            async function download()
            {
                if (!selectedFormat)
                {
                    return;
                }
                pageData.entity.nextMenuClass();
                const info = await getVideoInfo();
                info.progress = percent =>
                {
                    $(".download-progress-value").text(`${fixed(percent * 100)}`);
                    $(".download-progress-foreground").css("transform", `scaleX(${percent})`);
                };
                document.querySelector(".download-progress-cancel>span").onclick = () => info.cancelDownload();
                const result = await info.download()
                    .catch(error =>
                    {
                        pageData.entity.addError();
                        $(".video-error").text(error);
                    });
                if (!result) // canceled or other errors
                {
                    return;
                }
                const completeLink = document.getElementById("video-complete");
                completeLink.setAttribute("href", result.url);
                completeLink.setAttribute("download", result.filename);
                completeLink.click();

                const message = `下载完成. <a class="link" href="${result.url}" download="${result.filename.replace(/"/g, "&quot;")}">再次保存</a>`;
                Toast.success(message, "下载视频");
                pageData.entity.resetMenuClass();
            }
            async function copyLink()
            {
                if (!selectedFormat)
                {
                    return;
                }
                const info = await getVideoInfo();
                info.copyUrl();
                Toast.success("已复制链接到剪贴板.", "复制链接", 3000);
                pageData.entity.resetMenuClass();
            }
            $(".video-action>#video-action-download").on("click", download);
            $(".video-action>#video-action-copy").on("click", copyLink);
            formats.forEach(format =>
            {
                $(`<li>${format.displayName}</li>`)
                    .on("click", () =>
                    {
                        selectedFormat = format;
                        pageData.entity.nextMenuClass();
                    })
                    .prependTo("ol.video-quality");
            });
            resources.applyStyle("downloadVideoStyle");
            const downloadPanel = document.querySelector(".download-video-panel");
            const togglePopup = () => $(".download-video-panel").toggleClass("opened");
            $("#download-video").on("click", e =>
            {
                if (!downloadPanel.contains(e.target))
                {
                    togglePopup();
                }
            });
            $(".video-error").on("click", () =>
            {
                $(".video-error").text("");
                pageData.entity.removeError();
            });

            pageData.entity.addMenuClass();
        }
        return {
            widget:
            {
                content: resources.data.downloadVideoDom.text,
                condition: loadPageData,
                success: loadWidget,
            },
        };
    };
})();