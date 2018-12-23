(() =>
{
    return (settings, resources) =>
    {
        function skipChargeList()
        {
            const jumpButton = document.querySelector(".bilibili-player-electric-panel-jump");
            jumpButton && jumpButton.click();
        }
        SpinQuery.select(() => document.querySelector("#bofqi")).then(() =>
        {
            Observer.childListSubtree("#bofqi", () => skipChargeList());
        });
    };
})();