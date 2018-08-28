(() =>
{
    return (_, resources) =>
    {
        resources.applyStyle("fullTweetsTitleStyle", "full-tweets-title-style");
        return {
            ajaxReload: false
        };
    };
})();
