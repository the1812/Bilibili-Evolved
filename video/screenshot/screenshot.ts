import { getFriendlyTitle } from '../title';

const canvas = document.createElement("canvas");
class Screenshot
{
    video: HTMLVideoElement;
    url = "";
    videoTime: number;
    blob: Blob;
    timeStamp = new Date().getTime();
    constructor(video: HTMLVideoElement, videoTime: number)
    {
        this.video = video;
        this.videoTime = videoTime;
        // this.url = URL.createObjectURL(this.blob);
        this.createUrl();
    }
    async createUrl()
    {
        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;
        const context = canvas.getContext("2d");
        if (context === null)
        {
            logError("视频截图失败: canvas 未创建或创建失败.");
            return;
        }
        context.drawImage(this.video, 0, 0);
        canvas.toBlob(blob =>
        {
            if (blob === null)
            {
                logError("视频截图失败: 创建 blob 失败.");
                return;
            }
            this.blob = blob;
            this.url = URL.createObjectURL(blob);
        }, "image/png");
    }
    get filename()
    {
        return `${getFriendlyTitle()} @${this.time.replace(/:/g, "-")} ${this.timeStamp.toString()}.png`;
    }
    get id()
    {
        return this.videoTime.toString() + this.timeStamp.toString();
    }
    get time()
    {
        const hour = Math.trunc(this.videoTime / 3600).toString();
        const minute = Math.trunc(this.videoTime / 60).toString();
        const second = (this.videoTime % 60).toFixed(2);
        if (hour === "0")
        {
            return `${minute.padStart(2, "0")}:${second.padStart(5, "0")}`;
        }
        return `${hour}:${minute.padStart(2, "0")}:${second.padStart(5, "0")}`;
    }
    revoke()
    {
        URL.revokeObjectURL(this.url);
    }
}
export const takeScreenshot = (video: HTMLVideoElement) =>
{
    const time = video.currentTime;
    return new Screenshot(video, time);
}
resources.applyStyle("videoScreenshotStyle");
document.body.insertAdjacentHTML("beforeend", /*html*/`
    <div class="video-screenshot-container">
        <transition-group class="video-screenshot-list" name="video-screenshot-list" tag="div">
            <video-screenshot v-for="screenshot of screenshots" v-bind:filename="screenshot.filename" v-bind:object-url="screenshot.url" v-bind:time="screenshot.time" v-on:discard="discard(screenshot)" v-bind:key="screenshot.id"></video-screenshot>
        </transition-group>
        <div v-show="showBatch" class="video-screenshot-batch">
            <a class="batch-link" style="display:none" v-bind:download="batchFilename"></a>
            <button v-on:click="saveAll">
                <i class="mdi mdi-content-save"></i>全部保存
            </button>
            <button v-on:click="discardAll">
                <i class="mdi mdi-delete-forever"></i>全部丢弃
            </button>
        </div>
    </div>
`);
Vue.component("video-screenshot", {
    props: {
        objectUrl: String,
        filename: String,
        time: String,
    },
    template: /*html*/`
        <div class="video-screenshot-thumbnail">
            <img v-if="objectUrl" v-bind:src="objectUrl">
            <div class="mask" v-if="objectUrl">
                <a class="link" style="display:none" v-bind:href="objectUrl" v-bind:download="filename"></a>
                <button v-on:click="save" class="save" title="保存"><i class="mdi mdi-content-save-outline"></i></button>
                <button v-on:click="discard" title="丢弃" class="discard"><i class="mdi mdi-delete-forever-outline"></i></button>
                <span class="time">{{time}}</span>
            </div>
            <div class="loading" v-else>
            </div>
        </div>`,
    methods: {
        discard()
        {
            this.$emit("discard");
        },
        save()
        {
            this.$el.querySelector(".link").click();
            this.discard();
        },
    },
});
const screenShotsList = new Vue({
    el: ".video-screenshot-container",
    data: {
        screenshots: [] as Screenshot[],
        batchFilename: getFriendlyTitle() + ".zip",
    },
    methods: {
        discard(screenshot: Screenshot)
        {
            this.screenshots.splice(this.screenshots.indexOf(screenshot), 1);
            screenshot.revoke();
        },
        async saveAll()
        {
            const zip = new JSZip();
            this.screenshots.forEach((it: Screenshot) =>
            {
                zip.file(it.filename, it.blob, {
                    date: new Date(it.timeStamp),
                });
            });
            const blob = await zip.generateAsync({ type: "blob" });
            const link = this.$el.querySelector(".batch-link");
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
            link.href = "";
            this.discardAll();
        },
        discardAll()
        {
            this.screenshots.forEach((it: Screenshot) => it.revoke());
            this.screenshots = [];
        },
    },
    computed: {
        showBatch()
        {
            return this.screenshots.length >= 2;
        },
    },
});
const buttonHtml = /*html*/`
    <div class="video-take-screenshot" title="截图">
        <span><i class="mdi mdi-camera"></i></span>
    </div>`;
Observer.videoChange(async () =>
{
    const video = await SpinQuery.select("#bofqi video") as HTMLVideoElement;
    if (video === null)
    {
        return;
    }
    // if (settings.framePlayback)
    // {
    //     const frameButton = await SpinQuery.select(".frame-playback.prev-frame");
    //     if (frameButton === null || document.querySelector(".video-take-screenshot"))
    //     {
    //         return;
    //     }
    //     frameButton.insertAdjacentHTML("beforebegin", buttonHtml);
    // }
    // else
    // {
    const time = await SpinQuery.select(".bilibili-player-video-time");
    if (time === null || document.querySelector(".video-take-screenshot"))
    {
        return;
    }
    time.insertAdjacentHTML("afterend", buttonHtml);
    // }
    const screenshotButton = document.querySelector(".video-take-screenshot") as HTMLElement;
    screenshotButton.addEventListener("click", async () =>
    {
        const video = await SpinQuery.select("#bofqi video") as HTMLVideoElement;
        const screenshot = takeScreenshot(video);
        screenShotsList.screenshots.unshift(screenshot);
    });
    document.addEventListener("keydown", e =>
    {
        if (document.activeElement && ["input", "textarea"].includes(document.activeElement.nodeName.toLowerCase()))
        {
            return;
        }
        if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "c")
        {
            e.stopPropagation();
            e.preventDefault();
            screenshotButton.click();
        }
    });
    if (settings.touchVideoPlayer)
    {
        document.querySelectorAll(".video-take-screenshot").forEach(it => it.classList.add("touch"));
    }
});
export default {
    export: {
        takeScreenshot,
        screenShotsList,
    },
    unload: () => document.querySelectorAll(".bilibili-player-video-control-bottom .video-take-screenshot,.video-screenshot-container")
        .forEach(it => (it as HTMLElement).setAttribute("style", "display: none !important")),
    reload: () => document.querySelectorAll(".bilibili-player-video-control-bottom .video-take-screenshot,.video-screenshot-container")
        .forEach(it => (it as HTMLElement).setAttribute("style", "display: flex !important")),
};