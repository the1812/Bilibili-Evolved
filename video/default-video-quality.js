(() =>
{
    return (settings, resources) =>
    {
        (async () =>
        {
            const dropdown = await SpinQuery.any(
                () => $(".gui-settings-dropdown:has(input[key=defaultVideoQuality])"));
            const list = dropdown.find("ul");
            const input = dropdown.find("input");
            [
                "1080P60",
                "720P60",
                "1080P+",
                "720P+",
                "1080P",
                "720P",
                "480P",
                "360P",
                "自动",
            ].forEach(value =>
                {
                    $(`<li>${value}</li>`).appendTo(list)
                        .on("click", () =>
                        {
                            input.val(value).trigger("input").change();
                        });
                });

            // const qualityMenu = await SpinQuery.any()
        })();
    };
})();