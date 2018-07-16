function removeAds()
{
    waitForQuery()(
        () => $("#slide_ad"),
        it => it.length > 0,
        it => it.css("display", "none")
    );
    waitForQuery()(
        () => $("#home_popularize"),
        it => it.length > 0,
        it => it.css("display", "none")
    );
    waitForQuery()(
        () => $(".gg-floor-module"),
        it => it.length > 0,
        it => it.css("display", "none")
    );
}
