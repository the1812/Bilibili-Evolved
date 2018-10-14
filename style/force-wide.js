(() =>
{
    return (_, resources) =>
    {
        resources.applyImportantStyle("forceWideStyle", "bilibili-force-wide-style");
        return {
            ajaxReload: false
        };
    };
})();