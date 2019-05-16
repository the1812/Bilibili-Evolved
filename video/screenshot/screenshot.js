let canvas = null;
let context = null;
export const takeScreenshot = (video) => {
    if (canvas === null || context === null) {
        canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context = canvas.getContext("2d");
    }
    return new Promise((resolve, reject) => {
        if (canvas === null || context === null) {
            reject("视频截图失败: canvas 未创建或创建失败.");
            return;
        }
        context.drawImage(video, 0, 0);
        canvas.toBlob(blob => {
            if (blob === null) {
                reject("视频截图失败: 创建 blob 失败.");
                return;
            }
            resolve(blob);
        }, "image/png");
    });
};
resources.applyStyle("videoScreenshotStyle");
document.body.insertAdjacentHTML("beforeend", /*html*/ `
    <div class="video-screenshot-list">
        <video-screenshot v-for="screenshot of screenshots" v-bind:blob="screenshot"></video-screenshot>
    </div>
`);
Vue.component("video-screenshot", {
    data() {
        return {
            objectUrl: "",
        };
    },
    props: {
        blob: Blob
    },
    methods: {
        created() {
            this.objectUrl = URL.createObjectURL(this.blob);
        },
    },
    template: /*html*/ `<div class="video-screenshot-thumbnail">
        <img v-bind:src="objectUrl">
    </div>`,
});
const screenShotsList = new Vue({
    el: ".video-screenshot-list",
    data: {
        screenshots: [],
    },
});
Observer.videoChange(async () => {
    const video = await SpinQuery.select("#bofqi video");
    const time = await SpinQuery.select(".bilibili-player-video-time");
    if (video === null || time === null || document.querySelector(".video-take-screenshot")) {
        return;
    }
    time.insertAdjacentHTML("afterend", /*html*/ `
    <div class="video-take-screenshot" title="截图">
        <span><i class="mdi mdi-camera"></i></span>
    </div>`);
    const screenshotButton = document.querySelector(".video-take-screenshot");
    if (screenshotButton === null) {
        return;
    }
    screenshotButton.addEventListener("click", async () => {
        const blob = await takeScreenshot(video);
        screenShotsList.screenshots.push(blob);
    });
});
export default {
    export: {
        takeScreenshot,
        screenShotsList,
    },
};
