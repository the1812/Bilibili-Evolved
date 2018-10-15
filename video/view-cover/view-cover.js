(() =>
{
    return (_, resources) =>
    {
        class ImageViewer
        {
            constructor(url)
            {
                this.url = url;
                if ($(".image-viewer").length === 0)
                {
                    this.createDom();
                }
                this.viewer = $(".image-viewer-container");
                this.downloadImage();
            }
            createDom()
            {
                $("body").append(resources.data.imageViewerDom.text);
                resources.applyStyle("imageViewerStyle");
                $(".image-viewer-container .close").on("click", () => this.hide());
            }
            downloadImage()
            {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", this.url.replace("http:", "https:"), true);
                xhr.responseType = "blob";
                xhr.onload = () =>
                {
                    const title = document.title.replace("_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili", "");
                    const data = URL.createObjectURL(xhr.response);
                    this.imageData = data;
                    this.viewer.find(".download")
                        .attr("href", data)
                        .attr("download", title);
                    this.viewer.find(".image")
                        .prop("src", data);
                };
                xhr.send();
            }
            show()
            {
                this.viewer.addClass("opened");
                $("html,body").addClass("image-viewer-opened");
            }
            hide()
            {
                this.viewer.removeClass("opened");
                $("html,body").removeClass("image-viewer-opened");
            }
        }

        if ($("meta[itemprop='image']").length > 0)
        {
            return {
                ajaxReload: false,
                settingsWidget: {
                    after: () => $("span.settings-category").filter((_, e) => e.innerHTML === "视频与直播").parent(),
                    content: `<li class="indent-center hidden">
                        <button
                            class="gui-settings-button"
                            title="查看当前视频的封面"
                            id="view-video-cover">
                            查看封面
                        </button>
                        </li>`,
                    success: () =>
                    {
                        new SpinQuery(() => $("meta[itemprop='image']"),
                            metaData => metaData.length > 0 && metaData.prop("content"),
                            metaData =>
                            {
                                const imageViewer = new ImageViewer(metaData.prop("content"));
                                $("#view-video-cover").on("click", () =>
                                {
                                    imageViewer.show();
                                }).parent().removeClass("hidden");
                            }).start();
                    }
                }
            };
        }
        else
        {
            return {
                settingsWidget: {
                    after: () => $("span.settings-category").filter((_, e) => e.innerHTML === "视频与直播").parent(),
                    content: `<li class="indent-center hidden">
                            <button
                                class="gui-settings-button"
                                title="查看当前直播的封面"
                                id="view-live-cover">
                                查看封面
                            </button>
                            </li>`,
                    success: () =>
                    {
                        SpinQuery.any(() => $(".header-info-ctnr .room-cover"), coverLink =>
                        {
                            const match = coverLink
                                .attr("href")
                                .match(/space\.bilibili\.com\/([\d]+)/);
                            if (match && match[1])
                            {
                                const uid = match[1];
                                const url = `https://api.live.bilibili.com/bili/getRoomInfo/${uid}`;
                                downloadText(url, text =>
                                {
                                    // remove the surrounding "(...);"
                                    const jsonText = text.slice(1, -2);
                                    const coverUrl = JSON.parse(jsonText).data.cover;
                                    const imageViewer = new ImageViewer(coverUrl);
                                    $("#view-live-cover").on("click", () =>
                                    {
                                        imageViewer.show();
                                    }).parent().removeClass("hidden");
                                });
                            }
                        });
                    }
                }
            };
        }
    };
})();
