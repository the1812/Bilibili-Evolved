(() =>
{
    return (settings, resources) =>
    {
        const DanmakuInfo = resources.attributes.videoInfo.export.DanmakuInfo;
        async function downloadDanmaku()
        {
            const title = document.title.replace("_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili", "");
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
                    let aid = (unsafeWindow || window).aid;
                    let cid = (unsafeWindow || window).cid;
                    if (aid === undefined || cid === undefined)
                    {
                        const aidMatch = document.URL.match(/\/av(\d+)/);
                        if (aidMatch && aidMatch[1])
                        {
                            const info = await new VideoInfo(aidMatch[1]).fetchInfo();
                            aid = info.aid;
                            cid = info.cid;
                        }
                    }
                    return cid !== undefined;
                },
                success: () =>
                {
                    const link = document.querySelector("#danmaku-link");
                    $("#download-danmaku").on("click", e =>
                    {
                        if (e.target !== link)
                        {
                            downloadDanmaku();
                        }
                    });
                },
            }
        };
    };
})();