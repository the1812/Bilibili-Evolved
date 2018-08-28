(() =>
{
    return () =>
    {
        SpinQuery.any(() => $("span.settings-category"), settingsCategories =>
        {
            SpinQuery.any(() => $("meta[itemprop='image']"), metaData =>
            {
                if (metaData.length > 0)
                {
                    $(settingsCategories
                        .filter((_, e) => e.innerHTML === "视频"))
                        .parent()
                        .after(`
                    <li class="indent-center">
                    <button
                        class="gui-settings-button"
                        title="查看当前视频的封面"
                        id="view-video-cover">
                        查看封面
                    </button>
                    </li>`);
                    $("#view-video-cover").on("click", () =>
                    {
                        open(metaData.prop("content"));
                    });
                }
            });

            SpinQuery.any(() => $(".header-info-ctnr .room-cover"), coverLink =>
            {
                const match = coverLink
                    .attr("href")
                    .match(/space\.bilibili\.com\/([\d]+)/);
                if (match && match[1])
                {
                    const uid = match[1];
                    const url = `https://api.live.bilibili.com/bili/getRoomInfo/${uid}`;
                    downloadText(url, text =>
                    {
                        // remove the surrounding "(...);"
                        const jsonText = text.slice(1, -2);
                        const coverUrl = JSON.parse(jsonText).data.cover;
                        $(settingsCategories
                            .filter((_, e) => e.innerHTML === "直播间"))
                            .parent()
                            .after(`
                            <li class="indent-center">
                            <button
                                class="gui-settings-button"
                                title="查看当前直播的封面"
                                id="view-live-cover">
                                查看封面
                            </button>
                            </li>`);
                        $("#view-live-cover").on("click", () =>
                        {
                            open(coverUrl);
                        });
                    });
                }
            });
        });

        return {
            ajaxReload: false
        };
    };
})();
