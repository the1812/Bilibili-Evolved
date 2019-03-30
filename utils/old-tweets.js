const selectors = [
    `a.read-more[href*='t.bilibili.com']`,
    `.link-navbar a[href*='t.bilibili.com']`,
];
const oldUrl = `https://www.bilibili.com/account/dynamic`;
const newUrl = `https://t.bilibili.com/`;
for (const selector of selectors)
{
    // document.querySelectorAll(selector).forEach(it => it.setAttribute("href", oldUrl));
    SpinQuery.any(() => document.querySelectorAll(selector), links => links.forEach(it => it.setAttribute("href", oldUrl)));
}
const isNewTweets = location.host === "t.bilibili.com";
export default {
    widget: {
        condition: () =>
        {
            return document.URL.startsWith(newUrl) || document.URL.startsWith(oldUrl);
        },
        content: /*html*/`
            <button class="gui-settings-flat-button" id="old-tweets">
                <i class="mdi mdi-24px mdi-swap-horizontal-variant"></i>
                <span>${isNewTweets ? "回到旧版" : "转到新版"}</span>
            </button>`,
        success: () =>
        {
            const button = document.querySelector("#old-tweets");
            button.addEventListener("click", () =>
            {
                location.replace(isNewTweets ? oldUrl : newUrl);
            });
        },
    }
};