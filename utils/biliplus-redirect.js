const supportedUrls = [
    "bilibili.com/video/av",
    "bilibili.com/bangumi/play",
    "bilibili.com/bangumi/media",
    "space.bilibili.com"
];
export default {
    widget: {
        condition: () =>
        {
            return supportedUrls.some(url => document.URL.includes(url));
        },
        content: /*html*/`
            <button class="gui-settings-flat-button" id="biliplus-redirect">
                <i class="icon-biliplus"></i>
                <span>转到BiliPlus</span>
            </button>`,
        success: () =>
        {
            const button = document.querySelector("#biliplus-redirect");
            button.addEventListener("click", () =>
            {
                if (location.host === "space.bilibili.com")
                {
                    const uid = location.host.match(/space.bilibili.com\/([\d]+)/)[1];
                    location.replace(`www.biliplus.com/space/${uid}`);
                }
                else
                {
                    location.host = "www.biliplus.com";
                }
            });
        },
    }
};