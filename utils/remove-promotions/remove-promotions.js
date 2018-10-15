(() =>
{
    return (_, resources) =>
    {
        resources.applyStyle("removeAdsStyle", "remove-promotions-style");
        SpinQuery.any(
            () => $(".gg-pic").parent("a"),
            it =>
            {
                it.css("display", "none");
                it.each((_, element) =>
                {
                    const index = $(element).index() + 1;
                    const selector = $(element).parent().parent().find(`.pic li:nth-child(${index})`);
                    $(selector).css("visibility", "hidden");
                });
            }
        );
        return {
            ajaxReload: false
        };
    };
})();
