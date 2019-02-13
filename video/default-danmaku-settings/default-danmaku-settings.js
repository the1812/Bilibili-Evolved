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
        const selectors = {
            enableDanmaku: ".bilibili-player-video-danmaku-switch>input",
            settingsIcon: ".bilibili-player-video-danmaku-setting",
        };
        if (!settings.enableDanmaku)
        {
            setCheckState(selectors.enableDanmaku, false);
        }
        if (settings.rememberDanmakuBlock)
        {
            for (const type in settings.danmakuBlockSettings)
            {
                selectors[type] = `.bilibili-player-block-filter-type[ftype=${type}]`;
            }
            async function applyBlockSettings()
            {
                await SpinQuery.unsafeJquery();
                const settingsIcon = await SpinQuery.any(() => unsafeWindow.$(selectors.settingsIcon));
                if (!settingsIcon)
                {
                    return;
                }
                settingsIcon.mouseover().mouseout();
                // bilibili will hides the panel after 200ms delay
                setTimeout(() => resources.removeStyle("defaultDanmakuSettingsStyle"), 300);

                for (const [type, value] of Object.entries(settings.danmakuBlockSettings))
                {
                    if (value === true)
                    {
                        const element = await SpinQuery.select(() => document.querySelector(selectors[type]));
                        element.click();
                    }
                }
            }
            async function listenBlockSettingsChange()
            {
                for (const type in settings.danmakuBlockSettings)
                {
                    const element = await SpinQuery.select(() => document.querySelector(selectors[type]));
                    if (!element)
                    {
                        return;
                    }
                    element.addEventListener("click", () =>
                    {
                        settings.danmakuBlockSettings[type] = element.classList.contains("disabled");
                        saveSettings(settings);
                    });
                }
            }
            applyBlockSettings();
            listenBlockSettingsChange();
        }
    };
})();