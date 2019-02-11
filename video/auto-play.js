(() =>
{
    return (settings, resources) =>
    {
        SpinQuery.condition(
            () => document.querySelector(".bilibili-player-video video"),
            it => it && it.paused === true,
            it => it.play(),
        );
    };
})();