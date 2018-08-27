(() =>
{
    return () =>
    {
        SpinQuery.any(() => $("span.settings-category"), it =>
        {
            const metaData = $("meta[itemprop='image']");
            if (metaData.length > 0)
            {
                $(it.filter((_, e) => e.innerHTML === "视频"))
                    .parent()
                    .after(`
                <li class="indent-center">
                <button
                    class="gui-settings-button"
                    title="查看当前视频的封面"
                    id="view-cover">
                    查看封面
                </button>
                </li>`);
                $("#view-cover").on("click", () =>
                {
                    open(metaData.prop("content"));
                });
            }
        });

        return {
            ajaxReload: false
        };
    };
})();
