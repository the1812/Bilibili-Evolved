if (typeof isEmbeddedPlayer !== "undefined" && isEmbeddedPlayer())
{
    return;
}
Observer.videoChange(async () =>
{
    const danmakuBox = await SpinQuery.select(".bui-collapse-wrap");
    if (danmakuBox.classList.contains("bui-collapse-wrap-folded"))
    {
        const button = await SpinQuery.select(".bui-collapse-header");
        button.click();
    }
});