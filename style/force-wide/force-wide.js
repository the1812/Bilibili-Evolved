(() =>
{
    return (_, resources) =>
    {
        resources.applyImportantStyle("forceWideStyle");
        return {
            ajaxReload: false
        };
    };
})();