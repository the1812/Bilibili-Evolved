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
            throw new Error("视频截图失败: canvas 未创建或创建失败.");
        }
        context.drawImage(this.video, 0, 0);
        canvas.toBlob(blob =>
        {
            if (blob === null)
            {
                throw new Error("视频截图失败: 创建 blob 失败.");
            }
            this.blob = blob;
            this.url = URL.createObjectURL(blob);
        }, "image/png");
    }
    get filename()
    {
        return `${getFriendlyTitle()} @${this.videoTime.toString()}:${this.timeStamp.toString()}.png`;
    }
    get id()
    {
        return this.videoTime.toString() + this.timeStamp.toString();
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
    // return new Promise<Screenshot>((resolve, reject) =>
    // {
    //     const context = canvas.getContext("2d");
    //     if (canvas === null || context === null)
    //     {
    //         reject("视频截图失败: canvas 未创建或创建失败.");
    //         return;
    //     }
    //     context.drawImage(video, 0, 0);
    //     canvas.toBlob(blob =>
    //     {
    //         if (blob === null)
    //         {
    //             reject("视频截图失败: 创建 blob 失败.");
    //             return;
    //         }
    //         resolve(new Screenshot(blob, time));
    //     }, "image/png");
    // });
}
resources.applyStyle("videoScreenshotStyle");
document.body.insertAdjacentHTML("beforeend", /*html*/`
    <div class="video-screenshot-container">
        <transition-group class="video-screenshot-list" name="video-screenshot-list" tag="div">
            <video-screenshot v-for="screenshot of screenshots" v-bind:filename="screenshot.filename" v-bind:object-url="screenshot.url" v-on:discard="discard(screenshot)" v-bind:key="screenshot.id"></video-screenshot>
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
    },
    template: /*html*/`
        <div class="video-screenshot-thumbnail">
            <img v-if="objectUrl" v-bind:src="objectUrl">
            <div class="mask" v-if="objectUrl">
                <a class="link" style="display:none" v-bind:href="objectUrl" v-bind:download="filename"></a>
                <button v-on:click="save" class="save" title="保存"><i class="mdi mdi-content-save-outline"></i></button>
                <button v-on:click="discard" title="丢弃" class="discard"><i class="mdi mdi-delete-forever-outline"></i></button>
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
Observer.videoChange(async () =>
{
    const video = await SpinQuery.select("#bofqi video") as HTMLVideoElement;
    const time = await SpinQuery.select(".bilibili-player-video-time");
    if (video === null || time === null || document.querySelector(".video-take-screenshot"))
    {
        return;
    }
    time.insertAdjacentHTML("afterend", /*html*/`
    <div class="video-take-screenshot" title="截图">
        <span><i class="mdi mdi-camera"></i></span>
    </div>`);
    const screenshotButton = document.querySelector(".video-take-screenshot");
    if (screenshotButton === null)
    {
        return;
    }
    screenshotButton.addEventListener("click", () =>
    {
        const screenshot = takeScreenshot(video);
        screenShotsList.screenshots.unshift(screenshot);
    });
});
export default {
    export: {
        takeScreenshot,
        screenShotsList,
    },
};