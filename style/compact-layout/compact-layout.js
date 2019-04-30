const suitableSites = [
    "https://www.bilibili.com/",
    "https://www.bilibili.com/watchlater/#/list",
];
if (suitableSites.indexOf(location.href.replace(location.search, '')) !== -1)
{
    document.body.classList.add("compact");
}
export default {
    reload: () =>
    {
        document.body.classList.add("compact");
        resources.applyImportantStyle("compactLayoutStyle");
    },
    unload: () =>
    {
        document.body.classList.remove("compact");
        resources.removeStyle("compactLayoutStyle");
    }
}