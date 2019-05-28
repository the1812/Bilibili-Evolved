function oldGetFriendlyTitle(includesPageTitle = true)
{
    const title = document.title
        .replace("_番剧_bilibili_哔哩哔哩", "")
        .replace("_电影_bilibili_哔哩哔哩", "")
        .replace("_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili", "")
        .replace(" - 哔哩哔哩直播，二次元弹幕直播平台", "")
        .replace(/[\/\\:\*\?"<>\|]/g, "")
        .trim();
    if (!includesPageTitle || document.URL.indexOf("/bangumi") !== -1)
    {
        return title;
    }
    else
    {
        const pageLink = document.querySelector("#multi_page .cur-list>ul li.on a");
        if (pageLink === null)
        {
            return title;
        }
        else
        {
            const pageTitle = pageLink.getAttribute("title");
            return title + " - " + pageTitle;
        }
    }
}
export function getFriendlyTitle(includesPageTitle = true)
{
    if (settings.filenameFormat === undefined)
    {
        return oldGetFriendlyTitle(includesPageTitle);
    }
    const now = new Date();
    const data = {
        title: document.title
            .replace("_番剧_bilibili_哔哩哔哩", "")
            .replace("_电影_bilibili_哔哩哔哩", "")
            .replace("_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili", "")
            .replace(/(.*?) - (.*?) - 哔哩哔哩直播，二次元弹幕直播平台/, "$1")
            .trim(),
        ep: (() =>
        {
            if (!includesPageTitle)
            {
                return null;
            }
            const pageLink = document.querySelector("#multi_page .cur-list>ul li.on a");
            if (pageLink === null)
            {
                return null;
            }
            else
            {
                return pageLink.getAttribute("title");
            }
        })(),
        aid: unsafeWindow.aid,
        lid: document.URL.replace(/https:\/\/live\.bilibili\.com\/(\d+).*/, "$1"),
        // 年月日这方法名真够乱的
        y: now.getFullYear().toString(),
        M: (now.getMonth() + 1).toString().padStart(2, "0"),// zero-based
        d: now.getDate().toString().padStart(2, "0"),
        h: now.getHours().toString().padStart(2, "0"),
        m: now.getMinutes().toString().padStart(2, "0"),
        s: now.getSeconds().toString().padStart(2, "0"),
        ms: now.getMilliseconds().toString().substr(0, 3),
    };
    const filename = Object.keys(data).reduce((result, name) =>
    {
        return result.replace(new RegExp(`\\[([^\\[\\]]*?)${name}([^\\[\\]]*?)\\]`, "g"), data[name] ? `$1${data[name]}$2` : "");
    }, settings.filenameFormat);
    return filename.replace(/[\/\\:\*\?"<>\|]/g, "");
}
export default {
    export: { getFriendlyTitle },
};