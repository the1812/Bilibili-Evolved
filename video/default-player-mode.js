(() =>
{
    return (settings, _) =>
    {
        const playerModes = [
            {
                name: "常规",
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
        function main()
        {
            new SpinQuery(
                () => $(".bilibili-player-video,.bilibili-player-video-btn-start,.bilibili-player-area"),
                it => it.length === 3 && $("video").length > 0 && $("video").prop("duration"),
                () =>
                {
                    const video = document.querySelector("video");
                    const info = playerModes.find(it => it.name === settings.defaultPlayerMode);
                    if (info.name === "常规")
                    {
                        return;
                    }

                    if (info.name === "全屏")
                    {
                        const playButton = document.querySelector(".bilibili-player-video-btn-start");
                        const playerArea = document.querySelector(".bilibili-player-area");

                        const playerButtonClick = () =>
                        {
                            $(".bilibili-player-video-btn-fullscreen").click();
                            playButton.removeEventListener("click", playerButtonClick);
                            if (playerAreaClick.unbind)
                            {
                                playerAreaClick.unbind(playerArea);
                            }
                            else
                            {
                                playerArea.removeEventListener("click", playerAreaClick);
                            }
                        };
                        let playerAreaClick = playerButtonClick;

                        playButton.addEventListener("click", playerButtonClick);
                        if (settings.touchVideoPlayerDoubleTapControl)
                        {
                            playerAreaClick = new DoubleClickEvent(playerButtonClick);
                            playerAreaClick.bind(playerArea);
                        }
                        else
                        {
                            playerArea.addEventListener("click", playerAreaClick);
                        }
                    }
                    else
                    {
                        const onplay = () =>
                        {
                            if (info && $("#bilibiliPlayer[class*=mode-]").length === 0)
                            {
                                info.action();
                            }
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