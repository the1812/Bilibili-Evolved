(() =>
{
    return (settings, _) =>
    {
        const playerModes = [
            {
                name: "常规",
                action: () => {},
            },
            {
                name: "宽屏",
                action: () =>
                {
                    $(".bilibili-player-video-btn-widescreen").click();
                },
            },
            {
                name: "网页全屏",
                action: () =>
                {
                    $(".bilibili-player-video-web-fullscreen").click();
                },
            },
            // {
            //     name: "全屏",
            // },
        ];
        let lightOff = () => { };
        async function initLightOff()
        {
            if (settings.autoLightOff)
            {
                await SpinQuery.unsafeJquery();
                const settingsButton = await SpinQuery.any(() => unsafeWindow.$(".bilibili-player-video-btn-setting"));
                settingsButton.mouseover().mouseout();
                lightOff = () =>
                {
                    SpinQuery.any(
                        () => $(".bilibili-player-video-btn-setting-panel-others-content-lightoff .bui-checkbox-input"),
                        checkbox =>
                        {
                            const lightOffCheckBox = checkbox[0];
                            lightOffCheckBox.checked = true;
                            raiseEvent(lightOffCheckBox, "change");
                        }
                    );
                };
            }
        }
        async function main()
        {
            await initLightOff();
            await SpinQuery.condition(
                () => $(".bilibili-player-video,.bilibili-player-video-btn-start,.bilibili-player-area"),
                it => it.length === 3 && $("video").length > 0 && $("video").prop("duration"));

            const video = document.querySelector("video");
            if (video.length === 0)
            {
                return;
            }
            const info = playerModes.find(it => it.name === settings.defaultPlayerMode);
            if (info.name === "全屏")
            {
                const unsafe$ = await SpinQuery.unsafeJquery();
                const playButton = document.querySelector(".bilibili-player-video-btn-start");
                const playerButtonClick = () =>
                {
                    const events = unsafe$(".bilibili-player-video-btn-fullscreen").data("events");
                    if (events.click && events.click[0] && events.click[0].handler)
                    {
                        const handler = unsafe$(".bilibili-player-video-btn-fullscreen").data("events").click[0].handler;
                        console.log(handler);
                        handler();
                    }

                    playButton.removeEventListener("click", playerButtonClick);
                };
                playButton.addEventListener("click", playerButtonClick);
            }
            else
            {
                const onplay = () =>
                {
                    if (info && $("#bilibiliPlayer[class*=mode-]").length === 0)
                    {
                        info.action();
                    }
                    lightOff();
                    video.removeEventListener("play", onplay);
                };
                video.addEventListener("play", onplay);
            }
        }
        (Observer.childList || Observer.subtree)("#bofqi", () => main());
    };
})();