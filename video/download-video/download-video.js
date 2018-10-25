(() =>
{
    return (settings, resources) =>
    {
        const aid = (unsafeWindow || window).aid;
        const cid = (unsafeWindow || window).cid;
        if (aid === undefined || cid === undefined)
        {
            console.error(`unable to get aid or cid. aid=${aid}, cid=${cid}`);
        }
        class VideoFormat
        {
            constructor(quality, internalName, displayName)
            {
                this.quality = quality;
                this.internalName = internalName;
                this.displayName = displayName;
            }
            async download()
            {
                const videoInfo = new VideoInfo(this);
                await videoInfo.fetchVideoInfo();
                videoInfo.progress = percent =>
                {
                    $(".download-progress-value").text(`${fixed(percent * 100)}`);
                    $(".download-progress-foreground").css("transform", `scaleX(${percent})`);
                };
                return videoInfo.download();
            }
            static get availableFormats()
            {
                return new Promise((resolve, reject) =>
                {
                    const url = `https://api.bilibili.com/x/player/playurl?avid=${aid}&cid=${cid}&otype=json`;
                    downloadText(url, json =>
                    {
                        const data = JSON.parse(json).data;

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
                    }, error => reject(`获取清晰度信息失败: ${error}`));
                });
            }
        }
        class VideoInfoFragment
        {
            constructor(length, size, url, backupUrls)
            {
                this.length = length;
                this.size = size;
                this.url = url;
                this.backupUrls = backupUrls;
            }
        }
        class VideoInfo
        {
            constructor(format, fragments)
            {
                this.format = format;
                this.fragments = fragments || [];
                this.progress = null;
            }
            fetchVideoInfo()
            {
                return new Promise((resolve, reject) =>
                {
                    const url = `https://api.bilibili.com/x/player/playurl?avid=${aid}&cid=${cid}&qn=${this.format.quality}&otype=json`;
                    downloadText(url, json =>
                    {
                        const data = JSON.parse(json).data;
                        if (data.quality !== this.format.quality)
                        {
                            reject("获取下载链接失败, 请确认当前账号有下载权限后重试.");
                        }
                        const urls = data.durl;
                        this.fragments = urls.map(it => new VideoInfoFragment(
                            it.length, it.size,
                            it.url.replace("http:", "https:"),
                            it.backup_url.map(it => it.replace("http:", "https:"))
                        ));
                        if (this.fragments.length > 1)
                        {
                            reject("暂不支持分段视频的下载.");
                        }
                        resolve(this.fragments);
                    });
                });
            }
            download()
            {
                return new Promise((resolve, reject) =>
                {
                    const [fragment] = this.fragments;
                    const xhr = new XMLHttpRequest();
                    xhr.open("GET", fragment.url);
                    xhr.responseType = "arraybuffer";
                    xhr.withCredentials = true;
                    xhr.addEventListener("progress", (e) =>
                    {
                        this.progress && this.progress(e.loaded / fragment.size);
                    });
                    xhr.addEventListener("load", () =>
                    {
                        if (xhr.status === 200)
                        {
                            const blob = new Blob([xhr.response], {
                                type: "video/x-flv"
                            });
                            const blobUrl = URL.createObjectURL(blob);
                            open(blobUrl);
                            resolve(blobUrl);
                        }
                        else
                        {
                            reject(`请求失败. ${xhr.status}`);
                        }
                    });
                    xhr.addEventListener("error", e =>
                    {
                        reject(`下载失败. ${e}`);
                    });
                    xhr.send();
                });
            }
        }
        return {
            settingsWidget: {
                after: () => $("span.settings-category").filter((_, e) => e.innerHTML === "视频与直播").parent(),
                content: resources.data.downloadVideoDom.text,
                success: () =>
                {
                    VideoFormat.availableFormats.then((formats) =>
                    {
                        formats.forEach(format =>
                        {
                            async function formatClick()
                            {
                                $(".download-video-panel")
                                    .removeClass("quality")
                                    .addClass("progress");
                                await format.download().catch(error =>
                                {
                                    $(".download-video-panel").addClass("error");
                                    $(".video-error").text(error);
                                });
                                $(".download-video-panel")
                                    .removeClass("progress")
                                    .addClass("quality");
                                // $("a#video-complete").click();
                            }
                            $(`<li>${format.displayName}</li>`)
                                .on("click", formatClick)
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
                }
            }
        };
    };
})();