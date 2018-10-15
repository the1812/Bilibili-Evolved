(() =>
{
    return (_, resources) =>
    {
        resources.applyStyle("fullTweetsTitleStyle");
        return {
            ajaxReload: false
        };
    };
})();
