(() =>
{
    return (settings, resources) =>
    {
        async function setCheckState(selector, value)
        {
            const checkbox = await SpinQuery.condition(
                () => document.querySelector(selector),
                it => it !== null);
            if (!checkbox)
            {
                return;
            }
            checkbox.checked = value;
            raiseEvent(checkbox, "change");
        }
        const selectors = {
            enableDanmaku: ".bilibili-player-video-danmaku-switch>input",
        };
        if (!settings.enableDanmaku)
        {
            setCheckState(selectors.enableDanmaku, false);
        }
    };
})();