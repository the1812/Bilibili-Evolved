(() =>
{
    return (_, resources) =>
    {
        if ($("#remove-promotions-style").length === 0)
        {
            const style = resources.getStyle("removeAdsStyle", "remove-promotions-style");
            $("body").after(style);
        }
    };
})();
