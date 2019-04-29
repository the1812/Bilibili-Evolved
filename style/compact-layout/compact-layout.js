const suitableSites = [
    "https://www.bilibili.com/",
    "https://www.bilibili.com/watchlater/#/list",
];
if (suitableSites.indexOf(location.href.replace(location.search, '')) !== -1)
{
    document.body.classList.add("compact");
    if (!settings.useDarkStyle)
    {
        document.body.classList.add("light");
    }
    addSettingsListener("useDarkStyle", dark => document.body.classList[dark ? "remove" : "add"]("light"));
}