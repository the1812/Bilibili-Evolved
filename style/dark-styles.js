(() =>
{
    return (settings, resources) =>
    {
        if (settings.useNewStyle)
        {
            resources.applyStyle("darkStyle", "bilibili-new-style-dark");
        }
    };
})();
