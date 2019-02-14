(() =>
{
    return (settings, resources) =>
    {
        async function setCheckState(selector, value)
        {
            const checkbox = await SpinQuery.select(() => document.querySelector(selector));
            if (!checkbox)
            {
                return;
            }
            checkbox.checked = value;
            raiseEvent(checkbox, "change");
        }
        if (!settings.enableDanmaku)
        {
            setCheckState(".bilibili-player-video-danmaku-switch>input", false);
        }
        if (settings.rememberDanmakuSettings)
        {
            // for (const type in settings.danmakuSettings)
            // {
            //     if (selectors[type] === undefined)
            //     {
            //         selectors[type] = `.bilibili-player-block-filter-type[ftype=${type}]`;
            //     }
            // }
            const selectors = {
                subtitlesPreserve: ".bilibili-player-video-danmaku-setting-left-preventshade input",
                smartMask: ".bilibili-player-video-danmaku-setting-left-danmaku-mask input",
            };
            async function applyDanmakuSettings()
            {
                const panel = await SpinQuery.select(() => document.querySelector(".bilibili-player-video-danmaku-setting"));
                if (!panel)
                {
                    reutrn;
                }
                await loadLazyPanel(".bilibili-player-video-danmaku-setting");
                // bilibili will hides the panel after 200ms delay
                setTimeout(() => resources.removeStyle("defaultDanmakuSettingsStyle"), 300);

                for (const [type, value] of Object.entries(settings.danmakuSettings))
                {
                    const element = await SpinQuery.select(() => document.querySelector(selectors[type]));
                    if (element !== null && element.checked !== undefined && element.checked !== value)
                    {
                        element.click();
                    }
                }
            }
            async function listenDanmakuSettingsChange()
            {
                for (const type in settings.danmakuSettings)
                {
                    const element = await SpinQuery.select(() => document.querySelector(selectors[type]));
                    if (!element)
                    {
                        return;
                    }
                    element.addEventListener("click", () =>
                    {
                        settings.danmakuSettings[type] = element.checked;
                        saveSettings(settings);
                    });
                }
            }
            applyDanmakuSettings();
            listenDanmakuSettingsChange();
        }
    };
})();