(() =>
{
    return () =>
    {
        const selectors = [
            ".nav-search-keyword",
            ".search-keyword"
        ];
        for (const selector of selectors)
        {
            new SpinQuery(
                () => $(selector),
                it => it.length > 0 && it.attr("placeholder").length > 0,
                textBox => textBox.attr("placeholder", "搜索")
            ).start();
        }
        return {
            ajaxReload: false
        };
    };
})();
