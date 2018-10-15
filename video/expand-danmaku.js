(() =>
{
    return () =>
    {
        // TODO: put danmaku selector below
        Observer.subtree("", () =>
        {
            SpinQuery.any(
                () => $(".bui-collapse-header"),
                button =>
                {
                    if (parseInt($(".bui-collapse-body").css("height")) === 0 &&
                        $(".bui-collapse-arrow-text").text() === "展开")
                    {
                        button.click();
                    }
                }
            );
        });
        return {
            ajaxReload: true
        };
    };
})();
