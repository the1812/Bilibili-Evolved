import { getFriendlyTitle } from "./title";
import { DanmakuInfo } from "./video-info";
import { DanmakuConverter } from "./danmaku-converter/danmaku-converter";
async function downloadDanmaku(timeout, ass)
{
    const title = getFriendlyTitle();
    const danmaku = new DanmakuInfo((unsafeWindow || window).cid);
    await danmaku.fetchInfo();
    const blob = await (async () =>
    {
        if (ass === true)
        {
            let config = { title };
            try
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
                config.font = document.querySelector(".bilibili-player-video-danmaku-setting-right-font .bui-select-result").innerText;
                config.alpha = parseFloat(document.querySelector(".bilibili-player-setting-opacity .bui-bar").style.transform.replace(/scaleX\(([\d\.]+)\)/, "$1"));
                config.duration = (() =>
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
                config.blockTypes = (() =>
                {
                    let result = [];
                    const blockValues = {
                        ".bilibili-player-block-filter-type[ftype=scroll]": [1, 2, 3],
                        ".bilibili-player-block-filter-type[ftype=top]": [5],
                        ".bilibili-player-block-filter-type[ftype=bottom]": [4],
                        ".bilibili-player-block-filter-type[ftype=color]": ["color"],
                        // ".bilibili-player-block-filter-type[ftype=special]": [7, 8],
                    };

                    for (const [type, value] of Object.entries(blockValues))
                    {
                        if (document.querySelector(type).classList.contains("disabled"))
                        {
                            result = result.concat(value);
                        }
                    }
                    return result.concat(7, 8);
                })();
                const resolutionFactor = [1.4, 1.2, 1, 0.8, 0.6][getSliderIndex(".bilibili-player-setting-fontsize .bui-thumb")]; // 改变分辨率来调整字体大小
                config.resolution = {
                    x: 1920 * resolutionFactor,
                    y: 1080 * resolutionFactor,
                };
                config.bottomMarginPercent = [0.75, 0.5, 0.25, 0.15, 0.15][getSliderIndex(".bilibili-player-setting-area .bui-thumb")];
                config.bold = document.querySelector(".bilibili-player-video-danmaku-setting-right-font-bold input").checked;
            }
            catch (error)
            {
                config = {
                    font: "微软雅黑",
                    alpha: 0.6,
                    duration: danmaku =>
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
                    bold: false,
                };
            }
            const converter = new DanmakuConverter(config);
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
export default {
    widget: {
        content: /*html*/`
            <button
                class="gui-settings-flat-button"
                id="download-danmaku">
                <i class="icon-danmaku"></i>
                <span>下载弹幕</span>
                <a id="danmaku-link" style="display:none"></a>
            </button>`,
        condition: async () =>
        {
            let cid = await SpinQuery.select(() => (unsafeWindow || window).cid);
            return Boolean(cid);
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
                    downloadDanmaku(timeout, e.shiftKey);
                }
            });
        },
    }
};