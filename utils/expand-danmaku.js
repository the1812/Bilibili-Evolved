(() =>
{
    return () =>
    {
        waitForQuery()(
            () => $(".bui-collapse-header"),
            it => it.length > 0,
            button =>
            {
                if (parseInt($(".bui-collapse-body").css("height")) === 0 &&
                    $(".bui-collapse-arrow-text").text() === "展开")
                {
                    button.click();
                }
            }
        );
    };
})();
