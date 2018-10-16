(() =>
{
    return (settings, resources) =>
    {
        if (settings.useDarkStyle)
        {
            resources.applyStyle("scrollbarStyle");
            SpinQuery.any(
                () => $(".custom-scrollbar"),
                it => it.removeClass("custom-scrollbar")
            );
            if ($("#banner_link").length === 0 ||
                $("#banner_link").length > 0 &&
                settings.overrideNavBar &&
                !settings.showBanner)
            {
                resources.applyImportantStyle("darkStyleNavBar");
            }
            resources.applyStyle("darkStyle");
            resources.applyImportantStyle("darkStyleImportant");
        }
        else
        {
            $("#bilibili-scrollbar-style,#bilibili-new-style-dark-nav-bar,#bilibili-new-style-dark,#bilibili-new-style-dark-important")
                .remove();
        }
    };
})();
