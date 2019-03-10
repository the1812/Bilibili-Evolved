export class AudioDownloader
{
    constructor()
    {
        this.sid = null;
        this.progress = null;
    }
    async getDownloadUrl()
    {
        const url = `https://www.bilibili.com/audio/music-service-c/web/url?sid=${this.sid}&privilege=2&quality=2`;
        const json = await Ajax.getJsonWithCredentials(url);
        if (json.code === 0)
        {
            return json.data.cdns.shift();
        }
        else
        {
            logError("获取下载链接失败, 请确保当前账号有下载权限.", "下载音频", 10000);
            return null;
        }
    }
    async download()
    {
        const url = await this.getDownloadUrl();
        return new Promise((resolve, reject) =>
        {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.responseType = "blob";
            // xhr.withCredentials = true;
            xhr.addEventListener("load", () => resolve(xhr.response));
            xhr.addEventListener("error", () => reject(xhr.status));
            xhr.addEventListener("progress", e => this.progress && this.progress(100 * e.loaded / e.total));
            xhr.send();
        });
    }
}
const buttonText = "下载音频";
export default {
    export: AudioDownloader,
    widget: {
        content: /*html*/`
            <button
                disabled
                class="gui-settings-flat-button"
                id="download-audio">
                <i class="icon-download"></i>
                <span>${buttonText}</span>
                <a id="download-audio-link" style="display: none"></a>
            </button>`,
        condition: () => document.URL.includes("bilibili.com/audio"),
        success: async () =>
        {
            await SpinQuery.select(() => document.querySelector("#app"));
            const downloadButton = document.querySelector("#download-audio");
            const text = downloadButton.querySelector("span");
            const downloader = new AudioDownloader();
            downloader.progress = progress =>
            {
                text.innerHTML = `${Math.round(progress)}%`;
            };
            const link = document.querySelector("#download-audio-link");
            downloadButton.addEventListener("click", async e =>
            {
                if (downloader.sid === null || e.target === link)
                {
                    return;
                }
                const blob = await downloader.download();
                text.innerHTML = buttonText;
                const oldURL = link.getAttribute("href");
                if (oldURL)
                {
                    URL.revokeObjectURL(oldURL);
                }
                link.setAttribute("href", URL.createObjectURL(blob));
                link.setAttribute("download", document.querySelector(".song-title").getAttribute("title") + ".m4a");
                link.click();
            });
            Observer.childList("#app", () =>
            {
                const match = document.URL.match(/bilibili\.com\/audio\/au([\d]+)/);
                if (match && match[1])
                {
                    downloadButton.disabled = false;
                    downloader.sid = match[1];
                }
                else
                {
                    downloadButton.disabled = true;
                }
            });
        },
    },
};