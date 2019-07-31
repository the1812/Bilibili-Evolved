if (typeof isEmbeddedPlayer !== "undefined" && isEmbeddedPlayer())
{
    return;
}
SpinQuery.condition(
    () => document.querySelector(".bilibili-player-video video"),
    it => it && it.paused === true,
    it => it.play(),
);