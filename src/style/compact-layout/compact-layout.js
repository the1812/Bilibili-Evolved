const suitableSites = [
    "https://www.bilibili.com/",
    "https://www.bilibili.com/watchlater/#/list",
    "https://www.bilibili.com/ranking",
];
if (suitableSites.includes(location.href.replace(location.search, '')))
{
    document.body.classList.add("compact");
    resources.applyImportantStyle("compactLayoutStyle");
}
export default {
    reload: () =>
    {
        if (suitableSites.includes(location.href.replace(location.search, '')))
        {
            document.body.classList.add("compact");
            resources.applyImportantStyle("compactLayoutStyle");
        }
    },
    unload: () =>
    {
        document.body.classList.remove("compact");
        resources.removeStyle("compactLayoutStyle");
    }
}