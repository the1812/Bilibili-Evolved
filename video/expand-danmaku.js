if (isEmbeddedPlayer())
{
    return;
}
const expand = () =>
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
};
if (Observer.videoChange)
{
    Observer.videoChange(expand);
}
else
{ Observer.childList("#bofqi", expand); }