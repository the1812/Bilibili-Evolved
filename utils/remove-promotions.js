(() =>
{
    return (_, resources) =>
    {
        resources.applyStyle("removeAdsStyle", "remove-promotions-style");
        return {
            ajaxReload: false
        };
    };
})();
