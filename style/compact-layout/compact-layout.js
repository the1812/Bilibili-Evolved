(() =>
{
    return (settings, resources) =>
    {
        const suitableSites = [
            "https://www.bilibili.com/",
            "https://www.bilibili.com/watchlater/#/list",
        ];
        if (suitableSites.indexOf(location.href.replace(location.search, '')) !== -1)
        {
            document.documentElement.classList.add("compact");
        }
    };
})();