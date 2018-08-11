(() =>
{
    return (_, resources) =>
    {
        resources.applyStyle("removeAdsStyle", "remove-promotions-style");
        SpinQuery.any(
            () => $(".gg-pic").parent("a"),
            it => it.css("display", "none")
        );
        return {
            ajaxReload: false
        };
    };
})();
