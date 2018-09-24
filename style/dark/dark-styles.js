(() =>
{
    return (settings, resources) =>
    {
        resources.applyStyle("scrollbarStyle", "bilibili-scrollbar-style");
        SpinQuery.any(
            () => $(".custom-scrollbar"),
            it => it.removeClass("custom-scrollbar")
        );
        if ($("#banner_link").length === 0 ||
            $("#banner_link").length > 0 &&
            settings.overrideNavBar &&
            !settings.showBanner)
        {
            resources.applyImportantStyle("darkStyleNavBar", "bilibili-new-style-dark-nav-bar");
        }
        resources.applyStyle("darkStyle", "bilibili-new-style-dark");
        resources.applyImportantStyle("darkStyleImportant", "bilibili-new-style-dark-important");
        return {
            ajaxReload: false
        };
    };
})();
