(() =>
{
    return (settings, _) =>
    {
        const playerModes = [
            {
                name: "常规",
                actionButtonSelector: "",
            },
            {
                name: "宽屏",
                actionButtonSelector: ".bilibili-player-video-btn-widescreen",
            },
            {
                name: "网页全屏",
                actionButtonSelector: ".bilibili-player-video-web-fullscreen",
            },
            {
                name: "全屏",
                actionButtonSelector: ".bilibili-player-video-btn-fullscreen",
            },
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
        new SpinQuery(
            () => $(".bilibili-player-video"),
            it => it.length > 0 && $("video").length > 0 && $("video").prop("duration"),
            () =>
            {
                const video = document.querySelector("video");
                const onplay = () =>
                {
                    const info = playerModes.find(it => it.name === settings.defaultPlayerMode);
                    if (info.name !== "常规")
                    {
                        $(info.actionButtonSelector).click();
                    }
                    video.removeEventListener("play", onplay);
                };
                video.addEventListener("play", onplay);
            }
        ).start();
    };
})();