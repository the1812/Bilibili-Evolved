(() =>
{
    return (settings, resources) =>
    {
        SpinQuery.any(
            () => $(".gui-settings-dropdown:has(input[key=defaultVideoQuality])"),
            dropdown =>
            {
                const list = dropdown.find("ul");
                const input = dropdown.find("input");
                [
                    "高清 1080P60",
                    "高清 720P60",
                    "高清 1080P+",
                    "高清 720P+",
                    "高清 1080P",
                    "高清 720P",
                    "清晰 480P",
                    "流畅 360P",
                    "自动",
                ].forEach(value =>
                {
                    $(`<li>${value}</li>`).appendTo(list)
                        .on("click", () =>
                        {
                            input.val(value).trigger("input").change();
                        });
                });
            }
        );
    };
})();