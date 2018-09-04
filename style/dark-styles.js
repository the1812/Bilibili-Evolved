(() =>
{
    return (settings, resources) =>
    {
        if (settings.useNewStyle)
        {
            const sliceCount = Object.keys(resources.data)
                .filter(k => k.indexOf("darkStyleSlice") !== -1).length;
            for (let i = sliceCount; i > 0; i--)
            {
                resources.applyStyle(`darkStyleSlice${i}`, `bilibili-new-style-dark-slice-${i}`);
            }
            resources.applyImportantStyle("darkStyleImportant", "bilibili-new-style-dark-important");
        }
        return {
            ajaxReload: false
        };
    };
})();
