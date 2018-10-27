// ==UserScript==
// @name         Bilibili Evolved (Preview Offline)
// @version      102.85
// @description  增强哔哩哔哩Web端体验.(预览离线版)
// @author       Grant Howard, Coulomb-G
// @copyright    2018, Grant Howrad (https://github.com/the1812)
// @license      MIT
// @match        *://*.bilibili.com/*
// @match        *://*.bilibili.com
// @run-at       document-end
// @updateURL    https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview-offline.user.js
// @downloadURL  https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview-offline.user.js
// @supportURL   https://github.com/the1812/Bilibili-Evolved/issues
// @homepage     https://github.com/the1812/Bilibili-Evolved
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_setClipboard
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @require      https://cdn.bootcss.com/jszip/3.1.5/jszip.min.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAACXBIWXMAAAsTAAALEwEAmpwYAAAH0mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOC0wMi0yNVQxNDo1NzozOCswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wMi0yNVQxNDo1NzozOCswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTgtMDItMjVUMTQ6NTc6MzgrMDg6MDAiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODY3MDMzY2UtZjdlMy0wYTRiLWE5YWItODE3ZTI2ZmNlYTMyIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YWFhN2UzZTQtM2MzOS0yOTQ4LWI1OTgtYTEzM2ZjMTMxNDMyIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YjRjNGFjZWUtZjQyYS0yMTQwLTlmMzgtY2NlZTc3YmY2ZTM1IiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkhpc3Rvcnk9IjIwMTgtMDItMjVUMTQ6NTc6MTArMDg6MDAmI3g5O+aWh+S7tiDmnKrmoIfpopgtMiDlt7LmiZPlvIAmI3hBO+W7uueriyYjeDk75paw5bu6OiDmlofmoaMmI3hBO0ZBTFNFJiN4QTvmqKHlvI86IFJHQiDpopzoibLmqKHlvI8mI3hBO+WuveW6pjogMi41IOiLseWvuCYjeEE76auY5bqmOiAyLjUg6Iux5a+4JiN4QTvmr4/oi7Hlr7gg5YiG6L6o546HOiA3MiYjeEE75YOP57Sg6ZW/5a695q+UOiAxJiN4QTvloavlhYU6IOmAj+aYjiYjeEE75rex5bqmOiA4JiN4QTvphY3nva7mlofku7Y6IOKAnG5vbmXigJ0mI3hBO+WPguiAg+e6vzog5pegJiN4QTsyMTcmI3hBOyYjeEE757KY6LS0JiN4QTvnspjotLQmI3g5O+a2iOmZpOmUr+m9vzog5pegJiN4QTvkuLo6IOWDj+e0oCYjeEE7JiN4QTsyMDE4LTAyLTI1VDE0OjU3OjM4KzA4OjAwJiN4OTvmlofku7YgQzpcVXNlcnNcVGhlMThcUGljdHVyZXNcR3JhcGhpY3NcYmlsaWJpbGkgbG9nbyBzbWFsbC5wbmcg5bey5a2Y5YKoJiN4QTvlrZjlgqgmI3g5OyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YjRjNGFjZWUtZjQyYS0yMTQwLTlmMzgtY2NlZTc3YmY2ZTM1IiBzdEV2dDp3aGVuPSIyMDE4LTAyLTI1VDE0OjU3OjM4KzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIg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
// ==/UserScript==
(self$ =>
{
    const $ = unsafeWindow.$ || self$;
    const settings = {
        forceWideMinWidth: "1368px",
        forceWide: false,
        darkScheduleStart: "18:00",
        darkScheduleEnd: "6:00",
        darkSchedule: false,
        blurSettingsPanel: false,
        blurVideoControl: false,
        toast: true,
        fullTweetsTitle: true,
        removeVideoTopMask: false,
        removeLiveWatermark: true,
        harunaScale: true,
        removeAds: true,
        hideTopSearch: false,
        touchVideoPlayerDoubleTapControl: false,
        touchVideoPlayerAnimation: false,
        touchNavBar: false,
        touchVideoPlayer: false,
        watchLaterRedirect: true,
        expandDanmakuList: true,
        customStyleColor: "#00A0D8",
        blurBackgroundOpacity: 0.382,
        overrideNavBar: true,
        showBanner: true,
        useDarkStyle: false,
        useNewStyle: true,
        useCache: true,
        cache: {}
    };
    const fixedSettings = {
        guiSettings: true,
        viewCover: true,
        notifyNewVersion: true,
        clearCache: true,
        fixFullscreen: false,
        downloadVideo: true,
        latestVersionLink: "https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview-offline.user.js",
        currentVersion: "1.5.19"
    };
    function loadSettings()
    {
        for (const key in settings)
        {
            settings[key] = GM_getValue(key, settings[key]);
        }
        for (const key in fixedSettings)
        {
            settings[key] = fixedSettings[key];
        }
    }
    function saveSettings(newSettings)
    {
        for (const key in settings)
        {
            GM_setValue(key, newSettings[key]);
        }
    }
    function onSettingsChange(change)
    {
        for (const key in settings)
        {
            GM_addValueChangeListener(key, change);
        }
    }
    function loadResources()
    {
        const resouceData = {
            style: {
                path: "min/style.min.scss",
                order: 1
            },
            oldStyle: {
                path: "min/old.min.scss",
                order: 1
            },
            scrollbarStyle: {
                path: "min/scrollbar.min.css",
                order: 1
            },
            darkStyle: {
                path: "min/dark.min.scss",
                order: 2
            },
            darkStyleImportant: {
                path: "min/dark-important.min.scss"
            },
            darkStyleNavBar: {
                path: "min/dark-navbar.min.scss"
            },
            touchPlayerStyle: {
                path: "min/touch-player.min.scss",
                order: 3
            },
            navbarOverrideStyle: {
                path: "min/override-navbar.min.css",
                order: 4
            },
            noBannerStyle: {
                path: "min/no-banner.min.css",
                order: 5
            },
            removeAdsStyle: {
                path: "min/remove-promotions.min.css",
                order: 6
            },
            guiSettingsStyle: {
                path: "min/gui-settings.min.scss",
                order: 0
            },
            fullTweetsTitleStyle: {
                path: "min/full-tweets-title.min.css",
                order: 7
            },
            imageViewerStyle: {
                path: "min/image-viewer.min.scss",
                order: 8
            },
            toastStyle: {
                path: "min/toast.min.scss",
                order: 9
            },
            blurVideoControlStyle: {
                path: "min/blur-video-control.min.css",
                order: 10
            },
            forceWideStyle: {
                path: "min/force-wide.min.scss"
            },
            downloadVideoStyle: {
                path: "min/download-video.min.scss"
            },
            guiSettingsDom: {
                path: "min/gui-settings.min.html"
            },
            imageViewerDom: {
                path: "min/image-viewer.min.html"
            },
            downloadVideoDom: {
                path: "min/download-video.min.html"
            },
            latestVersion: {
                path: "version.txt"
            },
            guiSettings: {
                path: "min/gui-settings.min.js",
                dependencies: [
                    "guiSettingsDom",
                    "guiSettingsStyle"
                ],
                displayNames: {
                    guiSettings: "设置",
                    blurSettingsPanel: "模糊设置面板背景"
                }
            },
            useDarkStyle: {
                path: "min/dark-styles.min.js",
                dependencies: [
                    "darkStyle",
                    "darkStyleImportant",
                    "darkStyleNavBar",
                    "scrollbarStyle"
                ],
                displayNames: {
                    useDarkStyle: "夜间模式"
                }
            },
            useNewStyle: {
                path: "min/new-styles.min.js",
                dependencies: [
                    "style",
                    "oldStyle",
                    "scrollbarStyle"
                ],
                displayNames: {
                    useNewStyle: "样式调整",
                    blurBackgroundOpacity: "顶栏(对横幅)不透明度"
                }
            },
            overrideNavBar: {
                path: "min/override-navbar.min.js",
                dependencies: [
                    "navbarOverrideStyle",
                    "noBannerStyle"
                ],
                displayNames: {
                    overrideNavBar: "搜索栏置顶",
                    showBanner: "显示顶部横幅"
                }
            },
            touchNavBar: {
                path: "min/touch-navbar.min.js",
                displayNames: {
                    touchNavBar: "顶栏触摸优化"
                }
            },
            touchVideoPlayer: {
                path: "min/touch-player.min.js",
                dependencies: [
                    "touchPlayerStyle"
                ],
                displayNames: {
                    overrideNavBar: "播放器触摸支持",
                    touchVideoPlayerAnimation: "启用实验性动画效果",
                    touchVideoPlayerDoubleTapControl: "启用双击控制"
                }
            },
            expandDanmakuList: {
                path: "min/expand-danmaku.min.js",
                displayNames: {
                    expandDanmakuList: "自动展开弹幕列表"
                }
            },
            removeAds: {
                path: "min/remove-promotions.min.js",
                dependencies: [
                    "removeAdsStyle"
                ],
                displayNames: {
                    removeAds: "删除广告"
                }
            },
            watchLaterRedirect: {
                path: "min/watchlater.min.js",
                displayNames: {
                    watchLaterRedirect: "稍后再看重定向"
                }
            },
            hideTopSearch: {
                path: "min/hide-top-search.min.js",
                displayNames: {
                    hideTopSearch: "隐藏搜索推荐"
                }
            },
            harunaScale: {
                path: "min/haruna-scale.min.js",
                displayNames: {
                    harunaScale: "缩放看板娘"
                }
            },
            removeLiveWatermark: {
                path: "min/remove-watermark.min.js",
                displayNames: {
                    removeLiveWatermark: "删除直播水印"
                }
            },
            fullTweetsTitle: {
                path: "min/full-tweets-title.min.js",
                dependencies: [
                    "fullTweetsTitleStyle"
                ],
                displayNames: {
                    fullTweetsTitle: "展开动态标题"
                }
            },
            viewCover: {
                path: "min/view-cover.min.js",
                dependencies: [
                    "imageViewerDom",
                    "imageViewerStyle"
                ],
                displayNames: {
                    viewCover: "查看封面"
                }
            },
            notifyNewVersion: {
                path: "min/notify-new-version.min.js",
                dependencies: [
                    "latestVersion"
                ],
                displayNames: {
                    notifyNewVersion: "检查更新"
                }
            },
            toast: {
                path: "min/toast.min.js",
                dependencies: [
                    "toastStyle"
                ],
                displayNames: {
                    toast: "显示消息"
                }
            },
            removeVideoTopMask: {
                path: "min/remove-top-mask.min.js",
                displayNames: {
                    removeVideoTopMask: "删除视频标题层"
                }
            },
            blurVideoControl: {
                path: "min/blur-video-control.min.js",
                dependencies: [
                    "blurVideoControlStyle"
                ],
                displayNames: {
                    blurVideoControl: "模糊视频控制栏背景"
                }
            },
            darkSchedule: {
                path: "min/dark-schedule.min.js",
                displayNames: {
                    darkSchedule: "夜间模式计划时段",
                    darkScheduleStart: "起始时间",
                    darkScheduleEnd: "结束时间"
                }
            },
            forceWide: {
                path: "min/force-wide.min.js",
                dependencies: [
                    "forceWideStyle"
                ],
                displayNames: {
                    forceWide: "强制宽屏",
                    forceWideMinWidth: "触发宽度"
                }
            },
            clearCache: {
                path: "min/clear-cache.min.js",
                displayNames: {
                    useCache: "启用缓存"
                }
            },
            downloadVideo: {
                path: "min/download-video.min.js",
                dependencies: [
                    "downloadVideoDom",
                    "downloadVideoStyle",
                    "videoInfo"
                ]
            },
            videoInfo: {
                path: "min/video-info.min.js"
            }
        };
        Resource.root = "https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/";
        Resource.all = {};
        Resource.displayNames = {};
        for (const [key, data] of Object.entries(resouceData))
        {
            const resource = new Resource(data.path, data.order);
            resource.key = key;
            if (data.displayNames)
            {
                resource.displayName = data.displayNames[key];
                Object.assign(Resource.all, data.displayNames);
            }
            Resource.all[key] = resource;
        }
        for (const [key, data] of Object.entries(resouceData))
        {
            if (data.dependencies)
            {
                Resource.all[key].dependencies = data.dependencies.map(name => Resource.all[name]);
            }
        }
    }
    function downloadText(url, load, error)
    {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);

        if (load) // callback
        {
            xhr.addEventListener("load", () => load && load(xhr.responseText));
            xhr.addEventListener("error", () => error && error(xhr.responseText));
            xhr.send();
        }
        else
        {
            return new Promise((resolve, reject) =>
            {
                xhr.addEventListener("load", () => resolve(xhr.responseText));
                xhr.addEventListener("error", () => reject(xhr.responseText));
                xhr.send();
            });
        }
    }
    function fixed(number, precision = 1)
    {
        const str = number.toString();
        const index = str.indexOf(".");
        if (index !== -1)
        {
            if (str.length - index > precision + 1)
            {
                return str.substring(0, index + precision + 1);
            }
            else
            {
                return str;
            }
        }
        else
        {
            return str + ".0";
        }
    }
    // Placeholder class for Toast
    class Toast
    {
        constructor() { }
        show() { }
        dismiss() { }
        static show() { }
        static info() { }
        static success() { }
        static error() { }
    }
    class Observer
    {
        constructor(element, callback)
        {
            this.element = element;
            this.callback = callback;
            this.observer = null;
            this.options = { childList: true, subtree: true };
        }
        start()
        {
            if (this.element)
            {
                this.observer = new MutationObserver(this.callback);
                this.observer.observe(this.element, this.options);
            }
            return this;
        }
        stop()
        {
            this.observer && this.observer.disconnect();
            return this;
        }
        static subtree(selector, callback)
        {
            callback();
            return new Array(...document.querySelectorAll(selector))
                .map(it =>
                {
                    return new Observer(it, callback).start();
                });
        }
        static attributes(selector, callback)
        {
            callback();
            return new Array(...document.querySelectorAll(selector))
                .map(it =>
                {
                    const observer = new Observer(it, callback);
                    observer.options = {
                        childList: false,
                        subtree: false,
                        attributes: true
                    };
                    return observer.start();
                });
        }
        static all(selector, callback)
        {
            callback();
            return new Array(...document.querySelectorAll(selector))
                .map(it =>
                {
                    const observer = new Observer(it, callback);
                    observer.options = {
                        childList: true,
                        subtree: true,
                        attributes: true
                    };
                    return observer.start();
                });
        }
    }
    class SpinQuery
    {
        constructor(query, condition, action, onFailed)
        {
            this.maxRetry = 30;
            this.retry = 0;
            this.queryInterval = 500;
            this.query = query;
            this.condition = condition;
            this.action = action;
            this.onFailed = onFailed;
        }
        start()
        {
            this.tryQuery(this.query, this.condition, this.action, this.onFailed);
        }
        tryQuery(query, condition, action, onFailed)
        {
            if (this.retry >= this.maxRetry)
            {
                if (onFailed)
                {
                    onFailed();
                }
            }
            else
            {
                const result = query();
                if (condition(result))
                {
                    action(result);
                }
                else
                {
                    this.retry++;
                    setTimeout(() => this.tryQuery(query, condition, action, onFailed), this.queryInterval);
                }
            }
        }
        static any(query, action)
        {
            new SpinQuery(query, it => it.length > 0, action).start();
        }
        static count(query, count, action)
        {
            new SpinQuery(query, it => it.length === count, action).start();
        }
    }
    class ColorProcessor
    {
        constructor(hex)
        {
            this.hex = hex;
        }
        get rgb()
        {
            return this.hexToRgb(this.hex);
        }
        getHexRegex(alpha, shorthand)
        {
            const repeat = shorthand ? "" : "{2}";
            const part = `([a-f\\d]${repeat})`;
            const count = alpha ? 4 : 3;
            const pattern = `#?${part.repeat(count)}`;
            return new RegExp(pattern, "ig");
        }
        _hexToRgb(hex, alpha)
        {
            const isShortHand = hex.length < 6;
            if (isShortHand)
            {
                const shorthandRegex = this.getHexRegex(alpha, true);
                hex = hex.replace(shorthandRegex, function ()
                {
                    let result = "";
                    let i = 1;
                    while (arguments[i])
                    {
                        result += arguments[i].repeat(2);
                        i++;
                    }
                    return result;
                });
            }

            const regex = this.getHexRegex(alpha, false);
            const regexResult = regex.exec(hex);
            if (regexResult)
            {
                const color = {
                    r: parseInt(regexResult[1], 16),
                    g: parseInt(regexResult[2], 16),
                    b: parseInt(regexResult[3], 16)
                };
                if (regexResult[4])
                {
                    color.a = parseInt(regexResult[4], 16) / 255;
                }
                return color;
            }
            else if (alpha)
            {
                const rgb = this._hexToRgb(hex, false);
                if (rgb)
                {
                    rgb.a = 1;
                    return rgb;
                }
            }
            return null;
        }
        hexToRgb(hex)
        {
            return this._hexToRgb(hex, false);
        }
        hexToRgba(hex)
        {
            return this._hexToRgb(hex, true);
        }
        rgbToHsb(rgb)
        {
            const { r, g, b } = rgb;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            const s = Math.round((max === 0 ? 0 : delta / max) * 100);
            const v = Math.round(max / 255 * 100);

            let h;
            if (delta === 0)
            {
                h = 0;
            }
            else if (r === max)
            {
                h = (g - b) / delta % 6;
            }
            else if (g === max)
            {
                h = (b - r) / delta + 2;
            }
            else if (b === max)
            {
                h = (r - g) / delta + 4;
            }
            h = Math.round(h * 60);
            if (h < 0)
            {
                h += 360;
            }

            return { h: h, s: s, b: v };
        }
        get hsb()
        {
            return this.rgbToHsb(this.rgb);
        }
        get grey()
        {
            const color = this.rgb;
            return 1 - (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
        }
        get foreground()
        {
            const color = this.rgb;
            if (color && this.grey < 0.35)
            {
                return "#000";
            }
            return "#fff";
        }
        makeImageFilter(originalRgb)
        {
            const { h, s, b } = this.rgbToHsb(originalRgb);
            const targetColor = this.hsb;

            const hue = targetColor.h - h;
            const saturate = (s - targetColor.s) / 100 + 100;
            const brightness = (b - targetColor.b) / 100 + 100;
            const filter = `hue-rotate(${hue}deg) saturate(${saturate}%) brightness(${brightness}%)`;
            return filter;
        }
        get blueImageFilter()
        {
            const blueColor = {
                r: 0,
                g: 160,
                b: 213
            };
            return this.makeImageFilter(blueColor);
        }
        get pinkImageFilter()
        {
            const pinkColor = {
                r: 251,
                g: 113,
                b: 152
            };
            return this.makeImageFilter(pinkColor);
        }
        get brightness()
        {
            return `${this.foreground === "#000" ? "100" : "0"}%`;
        }
        get filterInvert()
        {
            return this.foreground === "#000" ? "" : "invert(1)";
        }
    }
    const offlineData = {};

    class ResourceType
    {
        constructor(name, preprocessor)
        {
            this.name = name;
            this.preprocessor = preprocessor || (text => text);
        }
        static fromUrl(url)
        {
            if (url.indexOf(".scss") !== -1 || url.indexOf(".css") !== -1)
            {
                return this.style;
            }
            else if (url.indexOf(".html") !== -1 || url.indexOf(".htm") !== -1)
            {
                return this.html;
            }
            else if (url.indexOf(".js") !== -1)
            {
                return this.script;
            }
            else if (url.indexOf(".txt") !== -1)
            {
                return this.text;
            }
            else
            {
                return this.unknown;
            }
        }
        static get style()
        {
            return new ResourceType("style", style =>
            {
                const color = new ColorProcessor();
                const hexToRgba = text =>
                {
                    const replaceColor = (text, shorthand) =>
                    {
                        const part = `([a-f\\d]${shorthand ? "" : "{2}"})`.repeat(4);
                        return text.replace(new RegExp(`(#${part})[^a-f\\d]`, "ig"), (original, it) =>
                        {
                            const rgba = color.hexToRgba(it);
                            if (rgba)
                            {
                                return `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})${original.slice(-1)}`;
                            }
                            else
                            {
                                return original;
                            }
                        });
                    };
                    return replaceColor(replaceColor(text, false), true);
                };
                for (const key of Object.keys(settings))
                {
                    style = style
                        .replace(new RegExp("\\$" + key, "g"), settings[key]);
                }
                return hexToRgba(style);
            });
        }
        static get html()
        {
            return new ResourceType("html", html =>
            {
                return html
                    .replace(new RegExp(`(<checkbox\\s*?indent=".+?"\\s*?key="${key}"\\s*?dependencies=".*?">)[^\\0]*?(</checkbox>)`, "g"),
                    `$1${Resource.displayNames[key]}$2
                `).replace(/<category>([^\0]*?)<\/category>/g, `
                    <li class="indent-center category">
                        <span class="settings-category">$1</span>
                    </li>
                    <li class="indent-center widgets-container" category-name="$1">
                    </li>
                `).replace(/<checkbox\s*?indent="(.+?)"\s*?key="(.+?)"\s*?dependencies="(.*?)">([^\0]*?)<\/checkbox>/g, `
                    <li class="indent-$1">
                        <label class="gui-settings-checkbox-container">
                            <input key="$2" type="checkbox" dependencies="$3" checked/>
                            <svg class="gui-settings-ok" viewBox="0 0 24 24">
                                <path />
                            </svg>
                            <span>$4</span>
                        </label>
                    </li>
                `).replace(/<textbox\s*?indent="(.+?)"\s*key="(.+?)"\s*?dependencies="(.*?)">([^\0]*?)<\/textbox>/g, `
                    <li class="indent-$1">
                        <label class="gui-settings-textbox-container">
                            <span>$4</span>
                            <input key="$2" dependencies="$3" spellcheck="false" type="text" />
                        </label>
                    </li>
                `);
            });
        }
        static get script()
        {
            return new ResourceType("script");
        }
        static get text()
        {
            return new ResourceType("text");
        }
        static get unknown()
        {
            return new ResourceType("unknown");
        }
    }
    class Resource
    {
        get downloaded()
        {
            return this.text !== null;
        }
        constructor(url, priority)
        {
            this.url = Resource.root + url;
            this.dependencies = [];
            this.priority = priority;
            this.text = null;
            this.key = null;
            this.type = ResourceType.fromUrl(url);
            this.displayName = "";
        }
        loadCache()
        {
            const key = this.key;
            if (!settings.cache || !settings.cache[key])
            {
                return null;
            }
            else
            {
                return settings.cache[key];
            }
        }
        download()
        {
            const key = this.key;
            return new Promise((resolve, reject) =>
            {
                if (this.downloaded)
                {
                    resolve(this.text);
                }
                else
                {
                    Promise.all(this.dependencies.map(r => r.download())).then(() =>
                    {
                        this.text=this.type.preprocessor(offlineData[this.url]);resolve(this.text);
                    });
                }
            });
        }
        getStyle(id)
        {
            const style = this.text;
            if (style === null)
            {
                console.error("Attempt to get style which is not downloaded.");
            }
            let attributes = `id='${id}'`;
            if (this.priority !== undefined)
            {
                attributes += ` priority='${this.priority}'`;
            }
            return `<style ${attributes}>${style}</style>`;
        }
        getPriorStyle(root)
        {
            if (this.priority !== undefined)
            {
                let insertPosition = this.priority - 1;
                let formerStyle = root.find(`style[priority='${insertPosition}']`);
                while (insertPosition >= 0 && formerStyle.length === 0)
                {
                    formerStyle = root.find(`style[priority='${insertPosition}']`);
                    insertPosition--;
                }
                if (insertPosition < 0)
                {
                    return null;
                }
                else
                {
                    return formerStyle;
                }
            }
            else
            {
                return null;
            }
        }
        applyStyle(id, important)
        {
            if ($(`#${id}`).length === 0)
            {
                const element = this.getStyle(id);
                const root = important ? $("body") : $("head");
                const priorStyle = this.getPriorStyle(root);
                if (priorStyle === null)
                {
                    if (important)
                    {
                        root.after(element);
                    }
                    else
                    {
                        root.prepend(element);
                    }
                }
                else
                {
                    priorStyle.after(element);
                }
            }
        }
    }
    class ResourceManager
    {
        constructor()
        {
            this.data = Resource.all;
            this.attributes = {};
            this.setupColors();
        }
        setupColors()
        {
            this.color = new ColorProcessor(settings.customStyleColor);
            settings.foreground = this.color.foreground;
            settings.blueImageFilter = this.color.blueImageFilter;
            settings.pinkImageFilter = this.color.pinkImageFilter;
            settings.brightness = this.color.brightness;
            settings.filterInvert = this.color.filterInvert;
        }
        fetchByKey(key)
        {
            const resource = Resource.all[key];
            if (!resource)
            {
                return null;
            }
            const promise = resource.download();
            resource.dependencies
                .filter(it => it.type.name === "script")
                .forEach(it => this.fetchByKey(it.key));
            return new Promise(resolve =>
            {
                promise.then(text =>
                {
                    this.applyComponent(key, text);
                    resolve();
                }).catch(reason =>
                {
                    // download error
                    console.error(`Download error, XHR status: ${reason}`);
                    Toast.error(`无法下载组件<span>${Resource.all[key].displayName}</span>`, "错误");
                });
            });
        }
        fetch()
        {
            return new Promise(resolve =>
            {
                const promises = [];
                for (const key in settings)
                {
                    if (settings[key] === true && key !== "toast")
                    {
                        const promise = this.fetchByKey(key);
                        if (promise)
                        {
                            promises.push(promise);
                        }
                    }
                }
                this.validateCache();
                Promise.all(promises).then(() =>
                {
                    this.applySettingsWidgets();
                    resolve();
                });
            });
        }
        applyComponent(key, text)
        {
            const func = eval(text);
            if (func)
            {
                try
                {
                    const attribute = func(settings, this) || {};
                    this.attributes[key] = attribute;
                }
                catch (error)
                {
                    // execution error
                    console.error(`Failed to apply feature "${key}": ${error}`);
                    Toast.error(`加载组件<span>${Resource.all[key].displayName}</span>失败`, "错误");
                }
            }
        }
        applySettingsWidgets()
        {
            const panel = $(".gui-settings-panel");
            if (panel.length === 0)
            {
                return;
            }
            for (const info of Object.values(this.attributes)
                .filter(it => it.settingsWidget)
                .map(it => it.settingsWidget))
            {
                if (info.after)
                {
                    panel.find(info.after()).after(info.content);
                }
                else if (info.before)
                {
                    panel.find(info.before()).before(info.content);
                }
                else if (info.category)
                {
                    panel.find(`.widgets-container[category-name=${info.category}]`).append(info.content);
                }

                if (info.success)
                {
                    info.success();
                }
            }
        }
        getDefaultStyleId(key)
        {
            return key.replace(/([a-z][A-Z])/g,
                g => `${g[0]}-${g[1].toLowerCase()}`);
        }
        applyStyle(key, id)
        {
            if (id === undefined)
            {
                id = this.getDefaultStyleId(key);
            }
            Resource.all[key].applyStyle(id, false);
        }
        applyImportantStyle(key, id)
        {
            if (id === undefined)
            {
                id = this.getDefaultStyleId(key);
            }
            Resource.all[key].applyStyle(id, true);
        }
        applyStyleFromText(text)
        {
            $("head").prepend(text);
        }
        applyImportantStyleFromText(text)
        {
            $("body").after(text);
        }
        getStyle(key, id)
        {
            return Resource.all[key].getStyle(id);
        }
        validateCache()
        {
            if (settings.cache.version !== settings.currentVersion)
            {
                settings.cache = {};
            }
            if (settings.cache.version === undefined)
            {
                settings.cache.version = settings.currentVersion;
            }
            saveSettings(settings);
        }
    }

    loadResources();
    loadSettings();
    const resources = new ResourceManager();
    if (settings.toast)
    {
        resources.fetchByKey("toast").then(() =>
        {
            Toast = resources.attributes.toast.export;
            resources.fetch();
        });
    }
    else
    {
        resources.fetch();
    }

})(window.jQuery.noConflict(true));
