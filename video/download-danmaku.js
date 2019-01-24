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
            const blob = await (async () =>
            {
                if (ass === true)
                {
                    await loadLazyPanel(".bilibili-player-video-danmaku-setting");
                    const getSliderIndex = (selector) =>
                    {
                        const transform = parseFloat(document.querySelector(selector).style.transform.replace(/translateX\(([\d\.]+)/, "$1"));
                        const index = {
                            0: 0,
                            44: 1,
                            94: 2,
                            144: 3,
                            188: 4,
                        }[transform];
                        return index;
                    };
                    const font = document.querySelector(".bilibili-player-video-danmaku-setting-right-font .bui-select-result").innerText;
                    const alpha = parseFloat(document.querySelector(".bilibili-player-setting-opacity .bui-bar").style.transform.replace(/scaleX\(([\d\.]+)\)/, "$1"));
                    const duration = (() =>
                    {
                        const scrollDuration = [10, 8, 6, 4, 2][getSliderIndex(".bilibili-player-setting-speedplus .bui-thumb")];
                        return danmaku =>
                        {
                            switch (danmaku.type)
                            {
                                case 4:
                                case 5:
                                    return 4; // stickyDuration
                                default:
                                    return scrollDuration;
                            }
                        };
                    })();
                    const blockTypes = (() =>
                    {
                        let result = [];
                        const blockValues = {
                            ".bilibili-player-block-filter-type[ftype=scroll]": [1, 2, 3],
                            ".bilibili-player-block-filter-type[ftype=top]": [5],
                            ".bilibili-player-block-filter-type[ftype=bottom]": [4],
                            ".bilibili-player-block-filter-type[ftype=color]": ["color"],
                            ".bilibili-player-block-filter-type[ftype=special]": [7, 8],
                        };

                        for (const [type, value] in Object.entries(blockValues))
                        {
                            if (document.querySelector(type).classList.contains("disabled"))
                            {
                                result = result.concat(value);
                            }
                        }
                        return result;
                    })();
                    const resolutionFactor = [2, 1.5, 1, 0.75, 0.5][getSliderIndex(".bilibili-player-setting-fontsize .bui-thumb")]; // 改变分辨率来调整字体大小
                    const bottomMarginPercent = [0.75, 0.5, 0.25, 0.15, 0.15][getSliderIndex(".bilibili-player-setting-area .bui-thumb")];
                    const converter = new DanmakuConverter({
                        title,
                        font,
                        alpha,
                        duration,
                        blockTypes,
                        resolution: {
                            x: 1920 * resolutionFactor,
                            y: 1080 * resolutionFactor,
                        },
                        bottomMarginPercent,
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