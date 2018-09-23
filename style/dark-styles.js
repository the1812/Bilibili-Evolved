(() =>
{
    return (_, resources) =>
    {
        resources.applyStyle("darkStyle", "bilibili-new-style-dark");
        resources.applyImportantStyle("darkStyleImportant", "bilibili-new-style-dark-important");
        return {
            ajaxReload: false
        };
    };
})();
