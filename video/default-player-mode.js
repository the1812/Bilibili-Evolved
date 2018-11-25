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
        SpinQuery.any(
            () => $(".gui-settings-dropdown:has(input[key=defaultPlayerMode])"),
            dropdown =>
            {
                const list = dropdown.find("ul");
                const input = dropdown.find("input");
                Object.values(playerModes).forEach(value =>
                {
                    $(`<li>${value.name}</li>`).appendTo(list)
                        .on("click", () =>
                        {
                            input.val(value.name).trigger("input").change();
                        });
                });
            }
        );
        let lightOff = () => { };
        function initLightOff()
        {
            if (settings.autoLightOff)
            {
                new SpinQuery(
                    () => $(""),
                    () => unsafeWindow.$ && unsafeWindow.$(".bilibili-player-video-btn-setting"),
                    () => unsafeWindow.$(".bilibili-player-video-btn-setting").mouseover().mouseout(),
                ).start();
                lightOff = () =>
                {
                    SpinQuery.any(
                        () => $(".bilibili-player-video-btn-setting-panel-others-content-lightoff .bui-checkbox-input"),
                        checkbox =>
                        {
                            const lightOffCheckBox = checkbox[0];
                            const event = document.createEvent("HTMLEvents");
                            event.initEvent("change", true, true);
                            lightOffCheckBox.checked = true;
                            lightOffCheckBox.dispatchEvent(event);
                        }
                    );
                };
            }
        }
        function main()
        {
            initLightOff();
            new SpinQuery(
                () => $(".bilibili-player-video,.bilibili-player-video-btn-start,.bilibili-player-area"),
                it => it.length === 3 && $("video").length > 0 && $("video").prop("duration"),
                () =>
                {
                    const video = document.querySelector("video");
                    const info = playerModes.find(it => it.name === settings.defaultPlayerMode);
                    if (info.name === "全屏")
                    {
                        const playButton = document.querySelector(".bilibili-player-video-btn-start");

                        const playerButtonClick = () =>
                        {
                            $(".bilibili-player-video-btn-fullscreen").click();
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
            ).start();
        }
        Observer.subtree("#bofqi", () => main());
    };
})();