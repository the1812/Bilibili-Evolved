function getFriendlyTitle()
{
    if (document.URL.indexOf("/bangumi") !== -1)
    {
        return document.title.replace("_番剧_bilibili_哔哩哔哩", "");
    }
    else
    {
        const pageLink = document.querySelector("#multi_page .cur-list>ul li.on a");
        if (pageLink === null)
        {
            return document.title.replace("_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili", "");
        }
        else
        {
            const pageTitle = pageLink.getAttribute("title");
            return document.title.replace("_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili", "") + " - " + pageTitle;
        }
    }
}
export default {
    export: getFriendlyTitle,
};