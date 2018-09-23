(() =>
{
    return (settings, resources) =>
    {
        if (settings.overrideNavBar && !settings.showBanner)
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
