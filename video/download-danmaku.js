(() =>
{
    return (settings, resources) =>
    {
        const { DanmakuInfo } = resources.import("videoInfo");
        const { DanmakuConverter } = resources.import("danmakuConverter");
        async function downloadDanmaku(timeout, ass)
        {
            const title = document.title
                .replace("_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili", "")
                .replace("_番剧_bilibili_哔哩哔哩", "");
            const danmaku = new DanmakuInfo((unsafeWindow || window).cid);
            await danmaku.fetchInfo();
            const blob = (() =>
            {
                if (ass === true)
                {
                    // TODO: 从播放器里获取弹幕偏好
                    const converter = new DanmakuConverter({
                        title,
                        font: "Microsoft YaHei UI",
                        alpha: 0.6,
                        duration(danmaku)
                        {
                            switch (danmaku.type)
                            {
                                case 4:
                                case 5:
                                    return 4;
                                default:
                                    return 6;
                            }
                        },
                        blockTypes: [],
                        resolution: {
                            x: 1920,
                            y: 1080,
                        },
                        bottomMarginPercent: 0.15,
                    });
                    const assDocument = converter.convertToAssDocument(danmaku.rawXML);
                    return new Blob([assDocument.generateAss()], {
                        type: 'text/plain'
                    });
                }
                else
                {
                    return new Blob([danmaku.rawXML], {
                        type: 'text/plain'
                    });
                }
            })();
            const url = URL.createObjectURL(blob);
            const link = $("#danmaku-link");
            const oldUrl = link.attr("href");
            if (oldUrl)
            {
                URL.revokeObjectURL(oldUrl);
            }
            clearTimeout(timeout);
            document.querySelector("#download-danmaku>span").innerHTML = "下载弹幕";
            link.attr("download", `${title}.${(ass ? "ass" : "xml")}`).attr("href", url).get(0).click();
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
                            try
                            {
                                downloadDanmaku(timeout, e.shiftKey);
                            }
                            catch (error)
                            {
                                logError(error);
                            }
                        }
                    });
                },
            }
        };
    };
})();