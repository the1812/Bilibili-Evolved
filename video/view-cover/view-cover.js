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
                $(".image-viewer-container .close").on("click", () => this.hide());
                resources.applyStyle("imageViewerStyle");
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
                // $("html,body").addClass("image-viewer-opened");
            }
            hide()
            {
                this.viewer.removeClass("opened");
                // $("html,body").removeClass("image-viewer-opened");
            }
        }

        if ($("meta[itemprop='image'],meta[property='og:image']").length > 0)
        {
            return {
                widget: {
                    content: `
                        <button
                            class="gui-settings-flat-button"
                            id="view-cover">
                            <i class="icon-view"></i>
                            <span>查看封面</span>
                        </button>`,
                    condition: async () =>
                    {
                        const metaData = await SpinQuery.condition(
                            () => $("meta[itemprop='image'],meta[property='og:image']"),
                            metaData => metaData.length > 0 && metaData.prop("content"),
                        );
                        return typeof metaData !== "undefined";
                    },
                    success: async () =>
                    {
                        const metaData = $("meta[itemprop='image'],meta[property='og:image']");
                        const imageViewer = new ImageViewer(metaData.prop("content"));
                        $("#view-cover").on("click", () =>
                        {
                            imageViewer.show();
                        });
                    },
                },
            };
        }
        else
        {
            return {
                widget: {
                    content: `
                        <button
                            class="gui-settings-flat-button"
                            id="view-cover">
                            <i class="icon-view"></i>
                            <span>查看封面</span>
                        </button>`,
                    condition: async () =>
                    {
                        const coverLink = await SpinQuery.any(() => $(".header-info-ctnr .room-cover"));
                        return typeof coverLink !== "undefined";
                    },
                    success: async () =>
                    {
                        const coverLink = $(".header-info-ctnr .room-cover");
                        const match = coverLink
                            .attr("href")
                            .match(/space\.bilibili\.com\/([\d]+)/);
                        if (match && match[1])
                        {
                            const uid = match[1];
                            const url = `https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${uid}`;
                            const text = await downloadText(url);
                            const coverUrl = JSON.parse(text).data.cover;
                            const imageViewer = new ImageViewer(coverUrl);
                            $("#view-cover").on("click", () =>
                            {
                                imageViewer.show();
                            });
                        }
                    },
                },
            };
        }
    };
})();
