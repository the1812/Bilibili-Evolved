// ==UserScript==
// @name         Bilibili Evolved (Preview)
// @version      1.6.21
// @description  增强哔哩哔哩Web端体验(预览版分支): 修复界面瑕疵, 删除广告, 使用夜间模式浏览; 下载视频,封面,弹幕, 以及增加对触屏设备的支持等.
// @author       Grant Howard, Coulomb-G
// @copyright    2018, Grant Howrad (https://github.com/the1812)
// @license      MIT
// @match        *://*.bilibili.com/*
// @match        *://*.bilibili.com
// @run-at       document-end
// @updateURL    https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview.user.js
// @downloadURL  https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview.user.js
// @supportURL   https://github.com/the1812/Bilibili-Evolved/issues
// @homepage     https://github.com/the1812/Bilibili-Evolved
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_setClipboard
// @grant        GM_info
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @require      https://cdn.bootcss.com/jszip/3.1.5/jszip.min.js
// @icon         https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/images/logo.png
// ==/UserScript==
(self$ =>
{
    const $ = unsafeWindow.$ || self$;
    const settings = {
        useDarkStyle: false,
        useNewStyle: true,
        showBanner: true,
        overrideNavBar: true,
        expandDanmakuList: true,
        expandDescription: true,
        watchLaterRedirect: true,
        touchNavBar: false,
        touchVideoPlayer: false,
        customControlBackgroundOpacity: 0.64,
        customControlBackground: true,
        forceWide: false,
        darkScheduleStart: "18:00",
        darkScheduleEnd: "6:00",
        darkSchedule: false,
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
        customStyleColor: "#00A0D8",
        preserveRank: true,
        blurBackgroundOpacity: 0.382,
        defaultPlayerMode: "常规",
        useDefaultVideoQuality: false,
        defaultVideoQuality: "自动",
        useDefaultDanmakuSettings: false,
        enableDanmaku: true,
        rememberDanmakuBlock: false,
        danmakuBlockSettings: {
            scroll: false,
            top: false,
            bottom: false,
            color: false,
            special: false,
        },
        autoLightOff: false,
        useCache: true,
        autoContinue: false,
        toastInternalError: false,
        cache: {},
    };
    const fixedSettings = {
        guiSettings: true,
        comboLike: false,
        doubleCoins: false,
        viewCover: true,
        notifyNewVersion: true,
        clearCache: true,
        fixFullscreen: false,
        downloadVideo: true,
        downloadDanmaku: true,
        useDefaultPlayerMode: true,
        about: false,
        blurSettingsPanel: false,
        latestVersionLink: "https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview.user.js",
        currentVersion: GM_info.script.version,
    };
    function logError(message)
    {
        if (settings.toastInternalError)
        {
            Toast.error("stack" in message
                ? message.stack
                : message, "错误");
        }
        console.error(message);
    }
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
        if (typeof GM_addValueChangeListener === "undefined")
        {
            return;
        }
        for (const key in settings)
        {
            GM_addValueChangeListener(key, change);
        }
    }
    function loadResources()
    {
        const resourceManifest = {
            style: {
                path: "min/style.min.css",
                order: 10,
            },
            oldStyle: {
                path: "min/old.min.css",
                order: 10,
            },
            scrollbarStyle: {
                path: "min/scrollbar.min.css",
                order: 10,
            },
            darkStyle: {
                path: "min/dark.min.css",
                order: 11,
            },
            darkStyleImportant: {
                path: "min/dark-important.min.css",
            },
            darkStyleNavBar: {
                path: "min/dark-navbar.min.css",
            },
            touchPlayerStyle: {
                path: "min/touch-player.min.css",
                order: 13,
            },
            navbarOverrideStyle: {
                path: "min/override-navbar.min.css",
                order: 14,
            },
            noBannerStyle: {
                path: "min/no-banner.min.css",
                order: 15,
            },
            removeAdsStyle: {
                path: "min/remove-promotions.min.css",
                order: 16,
            },
            guiSettingsStyle: {
                path: "min/gui-settings.min.css",
                order: 12,
            },
            fullTweetsTitleStyle: {
                path: "min/full-tweets-title.min.css",
                order: 17,
            },
            imageViewerStyle: {
                path: "min/image-viewer.min.css",
                order: 18,
            },
            toastStyle: {
                path: "min/toast.min.css",
                order: 19,
            },
            blurVideoControlStyle: {
                path: "min/blur-video-control.min.css",
                order: 20,
            },
            forceWideStyle: {
                path: "min/force-wide.min.css",
            },
            downloadVideoStyle: {
                path: "min/download-video.min.css",
            },
            guiSettingsDom: {
                path: "min/gui-settings.min.html",
            },
            imageViewerDom: {
                path: "min/image-viewer.min.html",
            },
            downloadVideoDom: {
                path: "min/download-video.min.html",
            },
            latestVersion: {
                path: "version.txt",
            },
            iconsStyle: {
                path: "min/icons.min.css",
            },
            settingsSideBar: {
                path: "min/settings-side-bar.min.js",
            },
            textValidate: {
                path: "min/text-validate.min.js",
            },
            themeColors: {
                path: "min/theme-colors.min.js",
            },
            settingsTooltipStyle: {
                path: "min/settings-tooltip.min.css",
            },
            settingsTooltip: {
                path: "min/settings-tooltip.min.js",
                styles: [
                    "settingsTooltipStyle"
                ],
            },
            guiSettings: {
                path: "min/gui-settings.min.js",
                dependencies: [
                    "guiSettingsDom",
                    "textValidate",
                    "settingsSideBar",
                    "themeColors",
                    "settingsTooltip",
                ],
                styles: [
                    "guiSettingsStyle",
                    "iconsStyle",
                ],
                displayNames: {
                    guiSettings: "设置",
                    blurSettingsPanel: "模糊设置面板背景",
                    clearCache: "清除缓存",
                },
            },
            useDarkStyle: {
                path: "min/dark-styles.min.js",
                styles: [
                    "darkStyle",
                    "scrollbarStyle",
                    {
                        key: "darkStyleNavBar",
                        important: true,
                        condition()
                        {
                            return $("#banner_link").length === 0 ||
                                $("#banner_link").length > 0 &&
                                settings.overrideNavBar &&
                                !settings.showBanner;
                        }
                    },
                    {
                        key: "darkStyleImportant",
                        important: true,
                        condition: () => true,
                    },
                ],
                displayNames: {
                    useDarkStyle: "夜间模式",
                },
            },
            useNewStyle: {
                path: "min/new-styles.min.js",
                dependencies: [
                    "style",
                    "oldStyle",
                ],
                styles: [
                    {
                        key: "scrollbarStyle",
                        condition: () => document.URL !== `https://h.bilibili.com/`,
                    }
                ],
                displayNames: {
                    useNewStyle: "样式调整",
                    blurBackgroundOpacity: "顶栏(对横幅)透明度",
                },
            },
            overrideNavBar: {
                path: "min/override-navbar.min.js",
                styles: [
                    "navbarOverrideStyle",
                    {
                        key: "noBannerStyle",
                        condition: () => !settings.showBanner
                    }
                ],
                displayNames: {
                    overrideNavBar: "搜索栏置顶",
                    showBanner: "显示顶部横幅",
                    preserveRank: "显示排行榜图标",
                },
            },
            touchNavBar: {
                path: "min/touch-navbar.min.js",
                displayNames: {
                    touchNavBar: "顶栏触摸优化",
                },
            },
            touchVideoPlayer: {
                path: "min/touch-player.min.js",
                styles: [
                    "touchPlayerStyle",
                ],
                displayNames: {
                    touchVideoPlayer: "播放器触摸支持",
                    touchVideoPlayerAnimation: "启用实验性动画效果",
                    touchVideoPlayerDoubleTapControl: "启用双击控制",
                },
            },
            expandDanmakuList: {
                path: "min/expand-danmaku.min.js",
                displayNames: {
                    expandDanmakuList: "自动展开弹幕列表",
                },
            },
            removeAds: {
                path: "min/remove-promotions.min.js",
                styles: [
                    "removeAdsStyle",
                ],
                displayNames: {
                    removeAds: "删除广告",
                },
            },
            watchLaterRedirect: {
                path: "min/watchlater.min.js",
                displayNames: {
                    watchLaterRedirect: "稍后再看重定向",
                },
            },
            hideTopSearch: {
                path: "min/hide-top-search.min.js",
                displayNames: {
                    hideTopSearch: "隐藏搜索推荐",
                },
            },
            harunaScale: {
                path: "min/haruna-scale.min.js",
                displayNames: {
                    harunaScale: "缩放直播看板娘",
                },
            },
            removeLiveWatermark: {
                path: "min/remove-watermark.min.js",
                displayNames: {
                    removeLiveWatermark: "删除直播水印",
                },
            },
            fullTweetsTitle: {
                path: "min/full-tweets-title.min.js",
                styles: [
                    "fullTweetsTitleStyle",
                ],
                displayNames: {
                    fullTweetsTitle: "展开动态标题",
                },
            },
            viewCover: {
                path: "min/view-cover.min.js",
                dependencies: [
                    "imageViewerDom",
                    "videoInfo",
                ],
                styles: [
                    "imageViewerStyle",
                ],
                displayNames: {
                    viewCover: "查看封面",
                },
            },
            notifyNewVersion: {
                path: "min/notify-new-version.min.js",
                dependencies: [
                    "latestVersion",
                ],
                displayNames: {
                    notifyNewVersion: "检查更新",
                },
            },
            toast: {
                path: "min/toast.min.js",
                styles: [
                    "toastStyle",
                ],
                displayNames: {
                    toast: "显示消息",
                    toastInternalError: "显示内部错误消息",
                },
            },
            removeVideoTopMask: {
                path: "min/remove-top-mask.min.js",
                displayNames: {
                    removeVideoTopMask: "删除视频标题层",
                },
            },
            blurVideoControl: {
                path: "min/blur-video-control.min.js",
                styles: [
                    "blurVideoControlStyle",
                ],
                displayNames: {
                    blurVideoControl: "模糊视频控制栏背景",
                },
            },
            darkSchedule: {
                path: "min/dark-schedule.min.js",
                displayNames: {
                    darkSchedule: "夜间模式计划时段",
                    darkScheduleStart: "起始时间",
                    darkScheduleEnd: "结束时间",
                },
            },
            forceWide: {
                path: "min/force-wide.min.js",
                styles: [
                    {
                        key: "forceWideStyle",
                        important: true,
                        condition: () => true,
                    },
                ],
                displayNames: {
                    forceWide: "强制宽屏",
                    forceWideMinWidth: "触发宽度",
                },
            },
            clearCache: {
                path: "min/clear-cache.min.js",
                displayNames: {
                    useCache: "启用缓存",
                },
            },
            downloadVideo: {
                path: "min/download-video.min.js",
                dependencies: [
                    "downloadVideoDom",
                    "downloadVideoStyle",
                    "videoInfo",
                ],
                displayNames: {
                    "downloadVideo": "下载视频",
                },
            },
            downloadDanmaku: {
                path: "min/download-danmaku.min.js",
                dependencies: [
                    "videoInfo",
                ],
                displayNames: {
                    "downloadDanmaku": "下载弹幕",
                },
            },
            videoInfo: {
                path: "min/video-info.min.js",
            },
            aboutDom: {
                path: "min/about.min.html",
            },
            aboutStyle: {
                path: "min/about.min.css",
            },
            about: {
                path: "min/about.min.js",
                dependencies: [
                    "aboutDom",
                ],
                styles: [
                    "aboutStyle",
                ],
                displayNames: {
                    "about": "关于",
                }
            },
            customControlBackgroundStyle: {
                path: "min/custom-control-background.min.css",
                order: 21
            },
            customControlBackground: {
                path: "min/custom-control-background.min.js",
                styles: [
                    {
                        key: "customControlBackgroundStyle",
                        condition: () => settings.customControlBackgroundOpacity > 0
                    },
                ],
                displayNames: {
                    customControlBackground: "控制栏着色",
                    customControlBackgroundOpacity: "不透明度",
                },
            },
            useDefaultPlayerMode: {
                path: "min/default-player-mode.min.js",
                displayNames: {
                    useDefaultPlayerMode: "默认播放器模式",
                    defaultPlayerMode: "默认播放器模式",
                    autoLightOff: "播放时自动关灯",
                },
                dropdown: {
                    key: "defaultPlayerMode",
                    items: ["常规", "宽屏", "网页全屏"],
                },
            },
            useDefaultVideoQuality: {
                path: "min/default-video-quality.min.js",
                displayNames: {
                    useDefaultVideoQuality: "使用默认视频画质",
                    defaultVideoQuality: "画质设定",
                },
                dropdown: {
                    key: "defaultVideoQuality",
                    items: ["1080P60", "1080P+", "1080P", "720P60", "720P", "480P", "360P", "自动"],
                },
            },
            comboLikeStyle: {
                path: "min/combo-like.min.css",
            },
            comboLike: {
                path: "min/combo-like.min.js",
                styles: [
                    "comboLikeStyle",
                ],
                displayNames: {
                    comboLike: "启用素质三连",
                    doubleCoins: "为原创视频投2个币"
                },
            },
            autoContinue: {
                path: "min/auto-continue.min.js",
                displayNames: {
                    autoContinue: "自动从历史记录点播放",
                },
            },
            expandDescriptionStyle: {
                path: "min/expand-description.min.css"
            },
            expandDescription: {
                path: "min/expand-description.min.js",
                styles: [
                    "expandDescriptionStyle"
                ],
                displayNames: {
                    expandDescription: "自动展开视频简介"
                }
            },
            useDefaultDanmakuSettings: {
                path: "min/default-danmaku-settings.min.js",
                displayNames: {
                    useDefaultDanmakuSettings: "使用默认弹幕设置",
                    enableDanmaku: "开启弹幕",
                    rememberDanmakuBlock: "记住弹幕屏蔽类型",
                },
            },
        };
        Resource.root = "https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/";
        Resource.all = {};
        Resource.displayNames = {};
        Resource.reloadables = {
            useDarkStyle: "useDarkStyle",
            showBanner: "overrideNavBar",
        };
        Resource.manifest = resourceManifest;
        for (const [key, data] of Object.entries(resourceManifest))
        {
            const resource = new Resource(data.path, data.order, data.styles);
            resource.key = key;
            if (data.displayNames)
            {
                resource.displayName = data.displayNames[key];
                Object.assign(Resource.displayNames, data.displayNames);
            }
            Resource.all[key] = resource;
        }
        for (const [key, data] of Object.entries(resourceManifest))
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

        if (load !== undefined) // callback
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
    function raiseEvent(element, eventName)
    {
        const event = document.createEvent("HTMLEvents");
        event.initEvent(eventName, true, true);
        element.dispatchEvent(event);
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
    class DoubleClickEvent
    {
        constructor(handler, singleClickHandler = null)
        {
            this.handler = handler;
            this.singleClickHandler = singleClickHandler;
            this.elements = [];
            this.clickedOnce = false;
            this.doubleClickHandler = e =>
            {
                if (!this.clickedOnce)
                {
                    this.clickedOnce = true;
                    setTimeout(() =>
                    {
                        if (this.clickedOnce)
                        {
                            this.clickedOnce = false;
                            this.singleClickHandler && this.singleClickHandler(e);
                        }
                    }, 200);
                }
                else
                {
                    this.clickedOnce = false;
                    this.handler && this.handler(e);
                }
            };
        }
        bind(element)
        {
            if (this.elements.indexOf(element) === -1)
            {
                this.elements.push(element);
                element.addEventListener("click", this.doubleClickHandler);
            }
        }
        unbind(element)
        {
            const index = this.elements.indexOf(element);
            if (index === -1)
            {
                return;
            }
            this.elements.splice(index, 1);
            element.removeEventListener("click", this.doubleClickHandler);
        }
    }
    class Observer
    {
        constructor(element, callback)
        {
            this.element = element;
            this.callback = callback;
            this.observer = null;
            this.options = undefined;
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
        static observe(selector, callback, options)
        {
            callback();
            return [...document.querySelectorAll(selector)].map(
                it =>
                {
                    const observer = new Observer(it, callback);
                    observer.options = options;
                    return observer.start();
                });
        }
        static subtree(selector, callback)
        {
            return Observer.observe(selector, callback, {
                childList: true,
                subtree: false,
                attributes: false,
            });
        }
        static attributes(selector, callback)
        {
            return Observer.observe(selector, callback, {
                childList: false,
                subtree: true,
                attributes: true,
            });
        }
        static all(selector, callback)
        {
            return Observer.observe(selector, callback, {
                childList: true,
                subtree: true,
                attributes: true,
            });
        }
    }
    class SpinQuery
    {
        constructor(query, condition, action, failed)
        {
            this.maxRetry = 30;
            this.retry = 0;
            this.queryInterval = 500;
            this.query = query;
            this.condition = condition;
            this.action = action;
            this.failed = failed;
        }
        start()
        {
            this.tryQuery(this.query, this.condition, this.action, this.failed);
        }
        tryQuery(query, condition, action, failed)
        {
            if (this.retry < this.maxRetry)
            {
                const result = query();
                if (condition(result))
                {
                    action(result);
                }
                else
                {
                    this.retry++;
                    setTimeout(() => this.tryQuery(query, condition, action, failed), this.queryInterval);
                }
            }
            else
            {
                typeof failed === "function" && failed();
            }
        }
        static condition(query, condition, action, failed)
        {
            if (action !== undefined)
            {
                new SpinQuery(query, condition, action, failed).start();
            }
            else
            {
                return new Promise((resolve) =>
                {
                    new SpinQuery(query, condition, it => resolve(it)).start();
                });
            }
        }
        static select(query, action, failed)
        {
            return SpinQuery.condition(query, it => it !== null, action, failed);
        }
        static any(query, action, failed)
        {
            return SpinQuery.condition(query, it => it.length > 0, action, failed);
        }
        static count(query, count, action, failed)
        {
            return SpinQuery.condition(query, it => it.length === count, action, failed);
        }
        static unsafeJquery(action, failed)
        {
            return SpinQuery.condition(() => unsafeWindow.$, jquery => jquery !== undefined, action, failed);
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
        hexToRgbOrRgba(hex, alpha)
        {
            const isShortHand = hex.length < 6;
            if (isShortHand)
            {
                const shorthandRegex = this.getHexRegex(alpha, true);
                hex = hex.replace(shorthandRegex, function (...args)
                {
                    let result = "";
                    let i = 1;
                    while (args[i])
                    {
                        result += args[i].repeat(2);
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
                    b: parseInt(regexResult[3], 16),
                };
                if (regexResult[4])
                {
                    color.a = parseInt(regexResult[4], 16) / 255;
                }
                return color;
            }
            else if (alpha)
            {
                const rgb = this.hexToRgbOrRgba(hex, false);
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
            return this.hexToRgbOrRgba(hex, false);
        }
        hexToRgba(hex)
        {
            return this.hexToRgbOrRgba(hex, true);
        }
        rgbToString(color)
        {
            if (color.a)
            {
                return `rgba(${color.r},${color.g},${color.b},${color.a})`;
            }
            return `rgb(${color.r},${color.g},${color.b})`;
        }
        rgbToHsb(rgb)
        {
            const { r, g, b, } = rgb;
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

            return { h: h, s: s, b: v, };
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
            const { h, s, b, } = this.rgbToHsb(originalRgb);
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
                b: 213,
            };
            return this.makeImageFilter(blueColor);
        }
        get pinkImageFilter()
        {
            const pinkColor = {
                r: 251,
                g: 113,
                b: 152,
            };
            return this.makeImageFilter(pinkColor);
        }
        get brightness()
        {
            return `${this.foreground === "#000" ? "100" : "0"}%`;
        }
        get filterInvert()
        {
            return this.foreground === "#000" ? "invert(0)" : "invert(1)";
        }
    }
    // [Offline build placeholder]
    class ResourceType
    {
        constructor(name, preprocessor)
        {
            this.name = name;
            this.preprocessor = preprocessor || (text => text);
        }
        static fromUrl(url)
        {
            if (url.indexOf(".css") !== -1)
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
            return new ResourceType("style");
        }
        static get html()
        {
            return new ResourceType("html", html =>
            {
                for (const [key, name] of Object.entries(Resource.displayNames))
                {
                    html = html.replace(new RegExp(`(<(.+)\\s*?indent="[\\d]+?"\\s*?key="${key}"\\s*?dependencies=".*?">)[^\\0]*?(</\\2>)`, "g"),
                        `$1${name}$3`);
                }
                return html.replace(/<category\s*?icon="(.+?)">([^\0]*?)<\/category>/g, `
                    <li class="indent-center category">
                        <i class="icon-$1" style="margin-right:8px"></i>
                        <span class="settings-category">$2</span>
                        <i class="icon-arrow" style="margin-left:8px"></i>
                    </li>
                `).replace(/<checkbox\s*?indent="(.+?)"\s*?key="(.+?)"\s*?dependencies="(.*?)">([^\0]*?)<\/checkbox>/g, `
                    <li class="indent-$1">
                        <label class="gui-settings-checkbox-container">
                            <input key="$2" type="checkbox" dependencies="$3" checked/>
                            <div class="gui-settings-checkbox"></div>
                            <span>$4</span>
                        </label>
                    </li>
                `).replace(/<dropdown\s*?indent="(.+?)"\s*?key="(.+?)"\s*?dependencies="(.*?)">([^\0]*?)<\/dropdown>/g,`
                    <li class="indent-$1">
                        <label>
                            <span class="gui-settings-dropdown-span">$4</span>
                            <div class="gui-settings-dropdown popup">
                                <input readonly type="text" spellcheck="false" key="$2" dependencies="$3">
                                <ul></ul>
                                <i class="icon-arrow"></i>
                            </div>
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
        constructor(url, priority, styles = [])
        {
            this.url = Resource.root + url;
            this.dependencies = [];
            this.priority = priority;
            this.styles = styles;
            this.text = null;
            this.key = null;
            this.type = ResourceType.fromUrl(url);
            this.displayName = "";
        }
        flatMapPolyfill()
        {
            if (Array.prototype.flatMap === undefined)
            {
                const flatMap = function (mapFunc)
                {
                    return this
                        .map(mapFunc)
                        .reduce((acc, it) => acc.concat(it), []);
                };
                return flatMap;
            }
            else
            {
                return Array.prototype.flatMap;
            }
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
        async download()
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
                    const flattenStyles = this.flatMapPolyfill()
                        .bind(this.styles)(it => typeof it === "object" ? it.key : it);
                    Promise.all(this.dependencies
                        .concat(flattenStyles.map(it => Resource.all[it]))
                        .map(r => r.download())
                    )
                    .then(() =>
                    {
                        // +#Offline build placeholder
                        if (settings.useCache)
                        {
                            const cache = this.loadCache(key);
                            if (cache !== null)
                            {
                                this.text = cache;
                                resolve(cache);
                            }
                            downloadText(this.url, text =>
                            {
                                this.text = this.type.preprocessor(text);
                                if (text === null)
                                {
                                    reject("download failed");
                                }
                                if (cache !== this.text)
                                {
                                    if (cache === null)
                                    {
                                        resolve(this.text);
                                    }
                                    if (typeof offlineData === "undefined")
                                    {
                                        settings.cache[key] = this.text;
                                        saveSettings(settings);
                                    }
                                }
                            }, error => reject(error));
                        }
                        else
                        {
                            downloadText(this.url,
                                text =>
                                {
                                    this.text = this.type.preprocessor(text);
                                    resolve(this.text);
                                },
                                error => reject(error));
                        }
                        // -#Offline build placeholder
                    });
                }
            });
        }
        getStyle(id)
        {
            const style = this.text;
            if (style === null)
            {
                logError("Attempt to get style which is not downloaded.");
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

            const rgbToString = color =>
            {
                if (color.a)
                {
                    return `rgba(${color.r},${color.g},${color.b},${color.a})`;
                }
                return `rgb(${color.r},${color.g},${color.b})`;
            };
            let styles = [];
            styles.push("--theme-color:" + settings.customStyleColor);
            for (let opacity = 10; opacity <= 90; opacity += 10)
            {
                styles.push(`--theme-color-${opacity}:` +
                    rgbToString(this.color.hexToRgba(settings.customStyleColor + opacity)));
            }
            styles.push("--foreground-color:" + settings.foreground);
            styles.push("--foreground-color-b:" +
                rgbToString(this.color.hexToRgba(settings.foreground + "b")));
            styles.push("--foreground-color-d:" +
                rgbToString(this.color.hexToRgba(settings.foreground + "d")));
            styles.push("--blue-image-filter:" + settings.blueImageFilter);
            styles.push("--pink-image-filter:" + settings.pinkImageFilter);
            styles.push("--brightness:" + settings.brightness);
            styles.push("--invert-filter:" + settings.filterInvert);
            styles.push("--blur-background-opacity:" + settings.blurBackgroundOpacity);
            styles.push("--custom-control-background-opacity:" + settings.customControlBackgroundOpacity);
            this.applyStyleFromText(`<style id="bilibili-evolved-vaiables">html{${styles.join(";")}}</style>`);
        }
        async fetchByKey(key)
        {
            const resource = Resource.all[key];
            if (!resource)
            {
                return null;
            }
            const text = await resource.download().catch(reason =>
            {
                console.error(`Download error, XHR status: ${reason}`);
                let toastMessage = `无法下载组件<span>${Resource.all[key].displayName}</span>`;
                if (settings.toastInternalError && "stack" in reason)
                {
                    toastMessage += "\n" + reason.stack;
                }
                Toast.error(toastMessage, "错误");
            });
            await Promise.all(resource.dependencies
                .filter(it => it.type.name === "script")
                .map(it => this.fetchByKey(it.key)));
            resource.styles
                .filter(it => it.condition !== undefined ? it.condition() : true)
                .forEach(it =>
                {
                    const important = typeof it === "object" ? it.important : false;
                    const key = typeof it === "object" ? it.key : it;
                    if (important)
                    {
                        this.applyImportantStyle(key);
                    }
                    else
                    {
                        this.applyStyle(key);
                    }
                });
            this.applyComponent(key, text);
        }
        async fetch()
        {
            this.validateCache();
            if (settings.toast === true)
            {
                await this.fetchByKey("toast");
                Toast = this.attributes.toast.export;
            }
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
            await Promise.all(promises);
            await this.applyDropdownOptions();
            await this.applyWidgets();
            saveSettings(settings);
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
                    console.error(`Failed to apply feature "${key}": ${error}`);
                    let toastMessage = `加载组件<span>${Resource.all[key].displayName}</span>失败`;
                    if (settings.toastInternalError && "stack" in error)
                    {
                        toastMessage += "\n" + error.stack;
                    }
                    Toast.error(toastMessage, "错误");
                }
            }
        }
        async applyWidgets()
        {
            async function applyWidget(info)
            {
                let condition = true;
                if (typeof info.condition === "function")
                {
                    condition = info.condition();
                    if (condition instanceof Promise)
                    {
                        condition = await condition.catch(() => { return false; });
                    }
                }
                if (condition === true)
                {
                    if (info.content)
                    {
                        $(".widgets-container").append($(info.content));
                    }
                    if (info.success)
                    {
                        info.success();
                    }
                }
            }
            await Promise.all(Object.values(this.attributes)
                .filter(it => it.widget)
                .map(it => applyWidget(it.widget))
            );
        }
        async applyDropdownOptions()
        {
            async function applyDropdownOption(info)
            {
                const dropdown = await SpinQuery.any(
                    () => $(`.gui-settings-dropdown:has(input[key=${info.key}])`));
                const list = dropdown.find("ul");
                const input = dropdown.find("input");
                info.items.forEach(item =>
                {
                    $(`<li>${item}</li>`).appendTo(list)
                        .on("click", () =>
                        {
                            input.val(item).trigger("input").change();
                        });
                });
            }
            await Promise.all(Object.values(Resource.manifest)
                .filter(it  => it.dropdown)
                .map(it => applyDropdownOption(it.dropdown))
            );
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
        removeStyle(key)
        {
            $(`#${this.getDefaultStyleId(key)}`).remove();
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
                saveSettings(settings);
            }
            if (settings.cache.version === undefined)
            {
                settings.cache.version = settings.currentVersion;
                saveSettings(settings);
            }
        }
    }

    try
    {
        loadResources();
        loadSettings();
        unsafeWindow.bilibiliEvolved = { SpinQuery };
        const resources = new ResourceManager();
        resources.fetch().catch(error => logError(error));
    }
    catch (error)
    {
        logError(error);
    }
})(window.jQuery.noConflict(true));
