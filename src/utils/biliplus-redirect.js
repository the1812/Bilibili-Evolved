const host = `hd.biliplus.com`;
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
                    location.assign(document.URL.replace("space.bilibili.com/", `${host}/space/`));
                }
                else if (document.URL.includes("/bangumi/"))
                {
                    const aid = unsafeWindow.aid || document.querySelector(".av-link,.info-sec-av").innerText.replace(/[aAvV]/g, "");
                    location.assign(`https://${host}/video/av${aid}/`);
                }
                else
                {
                    location.host = host;
                }
            });
        },
    }
};