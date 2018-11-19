(() =>
{
    return (_, resources) =>
    {
        const VideoInfo = resources.attributes.videoInfo.export.VideoInfo;
        const BangumiInfo = resources.attributes.videoInfo.export.BangumiInfo;
        const DanmakuInfo = resources.attributes.videoInfo.export.DanmakuInfo;
        const pageData = {
            aid: undefined,
            cid: undefined,
            isBangumi: false,
            isMovie: false
        };
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
                const videoInfo = new VideoDownloadInfo(this);
                await videoInfo.fetchVideoInfo();
                return videoInfo;
            }
            static get availableFormats()
            {
                return new Promise((resolve, reject) =>
                {
                    const url = `https://api.bilibili.com/x/player/playurl?avid=${pageData.aid}&cid=${pageData.cid}&otype=json`;
                    const xhr = new XMLHttpRequest();
                    xhr.addEventListener("load", () =>
                    {
                        const json = JSON.parse(xhr.responseText);
                        if (json.code !== 0)
                        {
                            reject("获取清晰度信息失败.");
                        }
                        const data = json.data;
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
            }
        }
        class VideoDownloadInfoFragment
        {
            constructor(length, size, url, backupUrls)
            {
                this.length = length;
                this.size = size;
                this.url = url;
                this.backupUrls = backupUrls;
            }
        }
        class VideoDownloadInfo
        {
            constructor(format, fragments)
            {
                this.format = format;
                this.fragments = fragments || [];
                this.progress = null;
                this.loaded = 0;
                this.totalSize = null;
                this.workingXhr = null;
            }
            fetchVideoInfo()
            {
                return new Promise((resolve, reject) =>
                {
                    const url = `https://api.bilibili.com/x/player/playurl?avid=${pageData.aid}&cid=${pageData.cid}&qn=${this.format.quality}&otype=json`;
                    const xhr = new XMLHttpRequest();
                    xhr.addEventListener("load", () =>
                    {
                        const data = JSON.parse(xhr.responseText.replace(/http:/g, "https:")).data;
                        if (data.quality !== this.format.quality)
                        {
                            reject("获取下载链接失败, 请确认当前账号有下载权限后重试.");
                        }
                        const urls = data.durl;
                        this.fragments = urls.map(it => new VideoDownloadInfoFragment(
                            it.length, it.size,
                            it.url,
                            it.backup_url
                        ));
                        // if (this.fragments.length > 1)
                        // {
                        //     reject("暂不支持分段视频的下载.");
                        // }
                        resolve(this.fragments);
                    });
                    xhr.withCredentials = true;
                    xhr.open("GET", url);
                    xhr.send();
                });
            }
            cancelDownload()
            {
                if (this.workingXhr)
                {
                    this.workingXhr.abort();
                }
            }
            downloadUrl(url)
            {
                return new Promise((resolve, reject) =>
                {
                    const xhr = new XMLHttpRequest();
                    xhr.open("GET", url);
                    xhr.responseType = "arraybuffer";
                    xhr.withCredentials = false;
                    xhr.addEventListener("progress", (e) =>
                    {
                        this.progress && this.progress((this.loaded + e.loaded) / this.totalSize);
                    });
                    xhr.addEventListener("load", () =>
                    {
                        if (xhr.status === 200)
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
                    xhr.send();
                    this.workingXhr = xhr;
                });
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
                const blob = new Blob([data], {
                    type: this.extension() === ".flv" ? "video/x-flv" : "video/mp4"
                });
                const filename = document.title.replace("_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili", "") + this.extension();
                return [blob, filename];
            }
            async downloadMultiple(downloadedData)
            {
                const zip = new JSZip();
                const title = document.title.replace("_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili", "");
                if (downloadedData.length > 1)
                {
                    downloadedData.forEach((data, index) =>
                    {
                        zip.file(`${title} - ${index + 1}${this.extension(this.fragments[index])}`, data);
                    });
                }
                else
                {
                    zip.file(`${title}}${this.extension()}`, data);
                }

                if (settings.downloadDanmaku)
                {
                    const danmaku = new DanmakuInfo(pageData.cid);
                    await danmaku.fetchInfo();
                    zip.file(`${title}.xml`, danmaku.rawXML);
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
                    const data = await this.downloadUrl(fragment.url);
                    this.loaded += fragment.size;
                    downloadedData.push(data);
                }
                if (downloadedData.length < 1)
                {
                    throw new Error("下载失败.");
                }

                let blob = null;
                let filename = null;
                if (downloadedData.length === 1 && !settings.downloadDanmaku)
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
        function loadWidget()
        {
            (async () =>
            {
                let aid = (unsafeWindow || window).aid;
                let cid = (unsafeWindow || window).cid;
                if (aid === undefined || cid === undefined)
                {
                    const aidMatch = document.URL.match(/\/av(\d+)/);
                    const epMatch = document.URL.match(/\/ep(\d+)/);
                    if (aidMatch && aidMatch[1])
                    {
                        const info = await new VideoInfo(aidMatch[1]).fetchInfo();
                        aid = info.aid;
                        cid = info.cid;
                    }
                    // TODO: Download bangumi, the legacy method not work...
                    // else if (epMatch && epMatch[1])
                    // {
                    //     const info = await new BangumiInfo(epMatch[1]).fetchInfo();
                    //     aid = info.aid;
                    //     cid = info.cid;
                    // }
                }
                return [aid, cid];
            })().then(result =>
            {
                const [aid, cid] = result;
                if (aid === undefined || cid === undefined)
                {
                    return;
                }
                pageData.aid = aid;
                pageData.cid = cid;
                VideoFormat.availableFormats.then((formats) =>
                {
                    let [selectedFormat] = formats;
                    const getVideoInfo = () => selectedFormat.downloadInfo().catch(error =>
                    {
                        $(".download-video-panel").addClass("error");
                        $(".video-error").text(error);
                    });
                    async function download()
                    {
                        if (!selectedFormat)
                        {
                            return;
                        }
                        $(".download-video-panel")
                            .removeClass("action")
                            .addClass("progress");
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
                                $(".download-video-panel").addClass("error");
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

                        const message = `下载完成. <a class="link" href="${result.url}" download="${result.filename}">再次保存</a>`;
                        Toast.success(message, "下载视频");

                        $(".download-video-panel")
                            .removeClass("progress")
                            .addClass("quality");
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
                        $(".download-video-panel")
                            .removeClass("action")
                            .addClass("quality");
                    }
                    $(".video-action>#video-action-download").on("click", download);
                    $(".video-action>#video-action-copy").on("click", copyLink);
                    formats.forEach(format =>
                    {
                        $(`<li>${format.displayName}</li>`)
                            .on("click", () =>
                            {
                                selectedFormat = format;
                                $(".download-video-panel")
                                    .removeClass("quality")
                                    .addClass("action");
                            })
                            .prependTo("ol.video-quality");
                    });
                    resources.applyStyle("downloadVideoStyle");
                    $("#download-video").on("click", () =>
                    {
                        $(".download-video-panel").toggleClass("opened");
                    }).parent().removeClass("hidden");
                });
                $(".video-error").on("click", () =>
                {
                    $(".video-error").text("");
                    $(".download-video-panel")
                        .removeClass("error")
                        .removeClass("progress")
                        .addClass("quality");
                });
            });
        }
        return {
            settingsWidget: {
                category: "视频与直播",
                content: resources.data.downloadVideoDom.text,
                success: loadWidget
            }
        };
    };
})();