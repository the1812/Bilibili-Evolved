(() =>
{
    return (settings, resources) =>
    {
        function skipChargeList()
        {
            const jumpButton = document.querySelector(".bilibili-player-electric-panel-jump");
            jumpButton && jumpButton.click();
        }
        Observer.subtree("#bofqi", () => skipChargeList());
    };
})();