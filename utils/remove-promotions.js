(() =>
{
    return (settings) =>
    {
        const display = settings.removeAds ? "none" : "block";
        waitForQuery()(
            () => $("#slide_ad"),
            it => it.length > 0,
            it => it.css("display", display)
        );
        waitForQuery()(
            () => $("#home_popularize"),
            it => it.length > 0,
            it => it.css("display", display)
        );
        waitForQuery()(
            () => $(".gg-floor-module"),
            it => it.length > 0,
            it => it.css("display", display)
        );
    };
})();
