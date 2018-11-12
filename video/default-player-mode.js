(() =>
{
    return (settings, resources) =>
    {
        const playerModes = [
            {
                name: "常规",
            },
            {
                name: "宽屏",
            },
            {
                name: "网页全屏",
            },
            {
                name: "全屏",
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
                    $(`<li>${value.name}</li>`).prependTo(list)
                        .on("click", () =>
                        {
                            input.val(value.name).trigger("input").change();
                        });
                });
            }
        );
    };
})();