(() =>
{
    return (settings, resources) =>
    {
        // (async () =>
        // {
        //     const expandButton = await SpinQuery.condition(
        //         () => document.querySelector(".video-desc .btn"),
        //         it => it.innerText.indexOf("展开更多") !== -1,
        //     );
        //     if (!expandButton)
        //     {
        //         return;
        //     }
        //     expandButton.click();
        // })();
        resources.applyStyle("expandDescriptionStyle");
    };
})();