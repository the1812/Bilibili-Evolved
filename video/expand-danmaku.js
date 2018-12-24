(() =>
{
    return () =>
    {
        (Observer.childList || Observer.subtree)("#bofqi", () =>
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
    };
})();
