(() =>
{
    return (settings, resources) =>
    {
        const DanmakuInfo = resources.attributes.videoInfo.export.DanmakuInfo;
        async function downloadDanmaku(timeout)
        {
            const title = document.title
                .replace("_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili", "")
                .replace("_番剧_bilibili_哔哩哔哩", "");
            const danmaku = new DanmakuInfo((unsafeWindow || window).cid);
            await danmaku.fetchInfo();
            const blob = new Blob([danmaku.rawXML], {
                type: 'text/plain'
            });
            const url = URL.createObjectURL(blob);
            const link = $("#danmaku-link");
            const oldUrl = link.attr("href");
            if (oldUrl)
            {
                URL.revokeObjectURL(oldUrl);
            }
            clearTimeout(timeout);
            document.querySelector("#download-danmaku>span").innerHTML = "下载弹幕";
            link.attr("download", `${title}.xml`).attr("href", url).get(0).click();
        }
        return {
            widget: {
                content: `
                    <button
                        class="gui-settings-flat-button"
                        id="download-danmaku">
                        <i class="icon-danmaku"></i>
                        <span>下载弹幕</span>
                        <a id="danmaku-link" style="display:none"></a>
                    </button>`,
                condition: async () =>
                {
                    let cid = await SpinQuery.condition(
                        () => (unsafeWindow || window).cid,
                        it => it !== undefined,
                    );
                    return cid !== undefined;
                },
                success: () =>
                {
                    const link = document.querySelector("#danmaku-link");
                    $("#download-danmaku").on("click", e =>
                    {
                        if (e.target !== link)
                        {
                            const timeout = setTimeout(
                                () => document.querySelector("#download-danmaku>span").innerHTML = "请稍侯...",
                                200);
                            downloadDanmaku(timeout);
                        }
                    });
                },
            }
        };
    };
})();