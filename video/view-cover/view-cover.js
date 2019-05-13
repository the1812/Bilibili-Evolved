import { VideoInfo } from "../video-info";
import { getFriendlyTitle } from "../title";
class ImageViewer
{
    constructor(url)
    {
        this.url = url;
        if ($(".image-viewer").length === 0)
        {
            this.createContainer();
        }
        this.viewer = $(".image-viewer-container");
        this.downloadImage();
    }
    createContainer()
    {
        $("body").append(resources.data.imageViewerHtml.text);
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
            const title = getFriendlyTitle();
            const data = URL.createObjectURL(xhr.response);
            if (this.imageData)
            {
                URL.revokeObjectURL(this.imageData);
            }
            this.imageData = data;
            this.viewer.find(".download")
                .attr("href", data)
                .attr("download", title + this.url.substring(this.url.lastIndexOf(".")));
            this.viewer.find(".copy-link")
                .on("click", () => GM_setClipboard(this.url));
            this.viewer.find(".new-tab")
                .attr("href", this.url);
            this.viewer.find(".image")
                .prop("src", data);
        };
        xhr.send();
    }
    show()
    {
        this.viewer.addClass("opened");
    }
    hide()
    {
        this.viewer.removeClass("opened");
    }
}

export default (() =>
{
    if ($("meta[itemprop='image'],meta[property='og:image']").length > 0)
    {
        return {
            widget: {
                content: /*html*/`
                <button
                    class="gui-settings-flat-button"
                    id="view-cover">
                    <i class="icon-view"></i>
                    <span>查看封面</span>
                </button>`,
                condition: async () =>
                {
                    const aid = await SpinQuery.select(() => (unsafeWindow || window).aid);
                    return Boolean(aid);
                },
                success: async () =>
                {
                    async function getUrl()
                    {
                        const aid = (unsafeWindow || window).aid;
                        const videoInfo = new VideoInfo(aid);
                        await videoInfo.fetchInfo();
                        return videoInfo.coverUrl;
                    }
                    let imageViewer = new ImageViewer(await getUrl());
                    $("#view-cover").on("click", () =>
                    {
                        imageViewer.show();
                    });
                    const updateImage = async () =>
                    {
                        imageViewer = new ImageViewer(await getUrl());
                    };
                    if (Observer.videoChange)
                    {
                        Observer.videoChange(updateImage);
                    }
                    else
                    { Observer.childList("#bofqi", updateImage); }
                },
            },
        };
    }
    else
    {
        return {
            widget: {
                content: /*html*/`
                <button
                    class="gui-settings-flat-button"
                    id="view-cover">
                    <i class="icon-view"></i>
                    <span>查看封面</span>
                </button>`,
                condition: async () =>
                {
                    const coverLink = await SpinQuery.select(() => document.querySelector(".header-info-ctnr .room-cover"));
                    return Boolean(coverLink);
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
                        const text = await Ajax.getText(url);
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
})();