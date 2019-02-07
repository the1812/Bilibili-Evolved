(() =>
{
    return (settings, resources) =>
    {
        async function skipChargeList()
        {
            const video = await SpinQuery.select(() => document.querySelector("video"));
            video.addEventListener("ended", async () =>
            {
                const jumpButton = await SpinQuery.select(() => document.querySelector(".bilibili-player-electric-panel-jump"));
                jumpButton && jumpButton.click();
            });
        }
        if (Observer.videoChange)
        {
            Observer.videoChange(skipChargeList);
        }
        else
        { Observer.childList("#bofqi", skipChargeList); }
    };
})();