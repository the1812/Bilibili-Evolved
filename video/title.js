export function getFriendlyTitle(includesPageTitle = true)
{
    const title = document.title
        .replace("_番剧_bilibili_哔哩哔哩", "")
        .replace("_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili", "");
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
export default {
    export: { getFriendlyTitle },
};