(() =>
{
    return (settings, resources) =>
    {
        SpinQuery.condition(
            () =>
            {
                if (document.querySelector(".bilibili-player-video"))
                {
                    return document.querySelector("video");
                }
            },
            it => it && it.paused === true,
            it => it.play(),
        );
    };
})();