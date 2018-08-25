(() =>
{
    return (settings, resources) =>
    {
        if (settings.useNewStyle)
        {
            for (const i of Array.from({ length: 2 }, (_, c) => c + 1))
            {
                resources.applyStyle(`darkStyleSlice${i}`, `bilibili-new-style-dark-slice-${i}`);
            }
        }
        $("body").after(resources.getStyle("bilibili-new-style-dark-important"));
        return {
            ajaxReload: false
        };
    };
})();
