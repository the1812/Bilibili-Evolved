(() =>
{
    return (settings, resources) =>
    {
        function skipChargeList()
        {
            const video = document.querySelector("video");
            video.addEventListener("ended", async () =>
            {
                const jumpButton = await SpinQuery.select(() => document.querySelector(".bilibili-player-electric-panel-jump"));
                jumpButton && jumpButton.click();
            });
        }
        SpinQuery.select(() => document.querySelector("#bofqi")).then(() =>
        {
            Observer.childList("#bofqi", () => skipChargeList());
        });
    };
})();