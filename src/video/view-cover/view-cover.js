import { VideoInfo } from "../video-info";
import { getFriendlyTitle } from "../title";
class ImageViewer {
  constructor (url) {
    this.url = url;
    if (document.querySelector(".image-viewer") === null) {
      this.createContainer();
    }
    this.viewer = document.querySelector(".image-viewer-container");
    this.downloadImage();
    addSettingsListener("filenameFormat", () => {
      this.viewer.querySelector(".download")
        .setAttribute("download", this.filename);
    });
  }
  createContainer () {
    document.body.insertAdjacentHTML("beforeend", resources.import("imageViewerHtml"));
    document.querySelector(".image-viewer-container .close").addEventListener("click", () => this.hide());
    resources.applyStyle("imageViewerStyle");
  }
  downloadImage () {
    document.querySelector("#view-cover").style.display = this.url ? "flex" : "none";
    if (this.url === "") {
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open("GET", this.url.replace("http:", "https:"), true);
    xhr.responseType = "blob";
    xhr.onload = () => {
      const data = URL.createObjectURL(xhr.response);
      if (this.imageData) {
        URL.revokeObjectURL(this.imageData);
      }
      this.imageData = data;
      const link = this.viewer.querySelector(".download");
      link.setAttribute("href", data);
      link.setAttribute("download", this.filename);

      this.viewer.querySelector(".copy-link").addEventListener("click", () => GM.setClipboard(this.url));
      this.viewer.querySelector(".new-tab").setAttribute("href", this.url);
      this.viewer.querySelector(".image").src = data;
    };
    xhr.send();
  }
  show () {
    this.viewer.classList.add("opened");
  }
  hide () {
    this.viewer.classList.remove("opened");
  }
  get filename () {
    return getFriendlyTitle(document.URL.includes('/www.bilibili.com/bangumi/')) + this.url.substring(this.url.lastIndexOf("."));
  }
}

export default (() => {
  if (!document.URL.includes('live.bilibili.com')) {
    return {
      widget: {
        content: /*html*/`
          <button
            class="gui-settings-flat-button"
            id="view-cover">
            <i class="icon-view"></i>
            <span>查看封面</span>
          </button>`,
        condition: async () => {
          const aid = await SpinQuery.select(() => (unsafeWindow || window).aid);
          return Boolean(aid);
        },
        success: async () => {
          async function getUrl () {
            const aid = (unsafeWindow || window).aid;
            const videoInfo = new VideoInfo(aid);
            try {
              await videoInfo.fetchInfo();
            }
            catch (error) {
              return "";
            }
            return videoInfo.coverUrl;
          };
          let imageViewer = new ImageViewer(await getUrl());
          document.querySelector("#view-cover").addEventListener("click", () => {
            imageViewer.show();
          });
          const updateImage = async () => {
            imageViewer = new ImageViewer(await getUrl());
          };
          Observer.videoChange(updateImage);
        },
      },
    };
  }
  else {
    return {
      widget: {
        content: /*html*/`
          <button
            class="gui-settings-flat-button"
            id="view-cover">
            <i class="icon-view"></i>
            <span>查看封面</span>
          </button>`,
        condition: async () => {
          const coverLink = await SpinQuery.select(() => document.querySelector(".header-info-ctnr .room-cover"));
          return Boolean(coverLink);
        },
        success: async () => {
          const coverLink = document.querySelector(".header-info-ctnr .room-cover");
          const match = coverLink
            .getAttribute("href")
            .match(/space\.bilibili\.com\/([\d]+)/);
          if (match && match[1]) {
            const uid = match[1];
            const url = `https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${uid}`;
            const json = await Ajax.getJson(url);
            const coverUrl = json.data.cover;
            const imageViewer = new ImageViewer(coverUrl);
            document.querySelector("#view-cover").addEventListener("click", () => {
              imageViewer.show();
            });
          }
        },
      },
    };
  }
})();