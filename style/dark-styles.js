(() =>
{
    return (settings, resources) =>
    {
        $("#bilibili-new-style-dark").remove();
        if (settings.useNewStyle && settings.useDarkStyle)
        {
            const styles = resources.getStyle("darkStyle", "bilibili-new-style-dark");
            $("body").after(styles);
        }
    };
})();
