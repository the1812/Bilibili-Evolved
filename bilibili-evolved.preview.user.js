// ==UserScript==
// @name         Bilibili Evolved (Preview)
// @version      1.1.5
// @description  增强哔哩哔哩Web端体验. (预览版分支)
// @author       Grant Howard
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
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @icon         https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/images/logo.png
// ==/UserScript==
(self$ =>
{
    const $ = unsafeWindow.$ || self$;
    const settings = {
        fixFullscreen: false,
        removeLiveWatermark: true,
        harunaScale: true,
        removeAds: true,
        hideTopSearch: false,
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
        useNewStyle: true
    };
    function loadSettings()
    {
        for (const key in settings)
        {
            settings[key] = GM_getValue(key, settings[key]);
        }
        settings.guiSettings = true;
    }
    function saveSettings(newSettings)
    {
        for (const key in settings)
        {
            GM_setValue(key, newSettings[key]);
        }
    }
    function downloadText(url, load, error)
    {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", () => load && load(xhr.responseText));
        xhr.addEventListener("error", () => error && error(xhr.responseText));
        xhr.open("GET", url);
        xhr.send();
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
            else
            {
                return this.unknown;
            }
        }
        static get style()
        {
            return new ResourceType("style", style =>
            {
                const color = new ColorProcessor(settings.customStyleColor);
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
                style = hexToRgba(style);
            });
        }
        static get html()
        {
            return new ResourceType("html");
        }
        static get script()
        {
            return new ResourceType("script");
        }
        static get unknown()
        {
            return new ResourceType("unknown");
        }
    }
    class Resource
    {
        static get root()
        {
            return "https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/";
        }
        get downloaded()
        {
            return this.text !== null;
        }
        constructor(key, url, dependencies)
        {
            this.key = key;
            this.url = this.root + url;
            this.dependencies = dependencies || [];
            this.text = null;
        }
        download()
        {
            return new Promise((resolve, reject) =>
            {
                if (this.download)
                {
                    resolve(this.text);
                }
                else
                {
                    Promise.all(this.dependencies.map(r => r.download())).then(() =>
                    {
                        downloadText(this.url, text =>
                        {
                            this.text = text;
                            resolve(this.text);
                        }, error => reject(error));
                    });
                }
            });
        }
    }
    Resource.all = {
        style: new Resource(style, "style/style.min.scss"),
        oldStyle: new Resource(oldStyle, "style/style-old.min.scss"),
        darkStyle: new Resource(darkStyle, "style/style-dark.min.scss"),
        touchPlayerStyle: new Resource(touchPlayerStyle, "style/style-touch-player.min.scss"),
        navbarOverrideStyle: new Resource(navbarOverrideStyle, "style/style-navbar-override.min.css"),
        noBannerStyle: new Resource(noBannerStyle, "style/style-no-banner.min.css"),
        removeAdsStyle: new Resource(removeAdsStyle, "style/style-remove-promotions.min.css"),
        guiSettingsStyle: new Resource(guiSettingsStyle, "style/style-gui-settings.min.scss"),
        guiSettingsDom: new Resource(guiSettingsDom, "utils/gui-settings.html"),
        guiSettings: new Resource(guiSettings, "utils/gui-settings.min.js"),
        useDarkStyle: new Resource(useDarkStyle, "style/dark-styles.min.js"),
        useNewStyle: new Resource(useNewStyle, "style/new-styles.min.js"),
        touchNavBar: new Resource(touchNavBar, "touch/touch-navbar.min.js"),
        touchVideoPlayer: new Resource(touchVideoPlayer, "touch/touch-player.min.js"),
        expandDanmakuList: new Resource(expandDanmakuList, "utils/expand-danmaku.min.js"),
        removeAds: new Resource(removeAds, "utils/remove-promotions.min.js"),
        watchLaterRedirect: new Resource(watchLaterRedirect, "utils/watchlater.min.js"),
        hideTopSearch: new Resource(hideTopSearch, "utils/hide-top-search.min.js"),
        harunaScale: new Resource(harunaScale, "live/haruna-scale.min.js"),
        removeLiveWatermark: new Resource(removeLiveWatermark, "live/remove-watermark.min.js"),
        fixFullscreen: new Resource(fixFullscreen, "utils/fix-fullscreen.min.js"),
    };
    (() =>
    {
        this.guiSettings.dependencies = [
            this.guiSettingsDom,
            this.guiSettingsStyle
        ];
        this.useDarkStyle.dependencies = [
            this.darkStyle
        ];
        this.useNewStyle.dependencies = [
            this.style,
            this.oldStyle,
            this.navbarOverrideStyle,
            this.noBannerStyle
        ];
        this.touchVideoPlayer.dependencies = [
            this.touchPlayerStyle
        ];
        this.removeAds, dependencies = [
            this.removeAdsStyle
        ];
    }).call(Resource.all);
    class ResourceManager
    {
        constructor()
        {
            // [Offline build placeholder]
            this.data = {};
            this.attributes = {};
            this.color = new ColorProcessor(settings.customStyleColor);
            settings.foreground = this.color.foreground;
            settings.blueImageFilter = this.color.blueImageFilter;
            settings.pinkImageFilter = this.color.pinkImageFilter;
            settings.brightness = this.color.brightness;
            settings.filterInvert = this.color.filterInvert;
        }
        static get resourceUrls()
        {
            const root = "https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/";
            const urls = {
                style: "style/style.min.scss",
                oldStyle: "style/style-old.min.scss",
                darkStyle: "style/style-dark.min.scss",
                touchPlayerStyle: "style/style-touch-player.min.scss",
                navbarOverrideStyle: "style/style-navbar-override.min.css",
                noBannerStyle: "style/style-no-banner.min.css",
                removeAdsStyle: "style/style-remove-promotions.min.css",
                guiSettingsStyle: "style/style-gui-settings.min.scss",
                guiSettingsDom: "utils/gui-settings.html",
                guiSettings: "utils/gui-settings.min.js",
                useDarkStyle: "style/dark-styles.min.js",
                useNewStyle: "style/new-styles.min.js",
                touchNavBar: "touch/touch-navbar.min.js",
                touchVideoPlayer: "touch/touch-player.min.js",
                expandDanmakuList: "utils/expand-danmaku.min.js",
                removeAds: "utils/remove-promotions.min.js",
                watchLaterRedirect: "utils/watchlater.min.js",
                hideTopSearch: "utils/hide-top-search.min.js",
                harunaScale: "live/haruna-scale.min.js",
                removeLiveWatermark: "live/remove-watermark.min.js",
                fixFullscreen: "utils/fix-fullscreen.min.js"
            };
            for (const key in urls)
            {
                urls[key] = root + urls[key];
            }
            return urls;
        }
        ajax(url, done)
        {
            downloadText(url, done);
        }
        fetch(callback)
        {
            this.callback = callback;
            const replaceCustomColor = (url, style) =>
            {
                if (url.indexOf(".scss") !== -1 || url.indexOf(".css") !== -1)
                {
                    const hexToRgba = text =>
                    {
                        const replaceColor = (text, shorthand) =>
                        {
                            const part = `([a-f\\d]${shorthand ? "" : "{2}"})`.repeat(4);
                            return text.replace(new RegExp(`(#${part})[^a-f\\d]`, "ig"), (original, it) =>
                            {
                                const rgba = this.color.hexToRgba(it);
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
                    style = hexToRgba(style);
                }
                return style;
            };
            const urls = ResourceManager.resourceUrls;
            const resourceCount = Object.keys(urls).length;
            let downloadedCount = 0;
            for (const key in urls)
            {
                const url = urls[key];
                this.ajax(url, data =>
                {
                    this.data[key] = replaceCustomColor(url, data);
                    downloadedCount++;
                    if (downloadedCount >= resourceCount)
                    {
                        this.apply();
                        if (this.callback)
                        {
                            this.callback();
                        }
                    }
                });
            }
        }
        getStyle(key, id)
        {
            return `<style id='${id}'>${this.data[key]}</style>`;
        }
        applyStyle(key, id)
        {
            if ($(`#${id}`).length === 0)
            {
                $("head").prepend(this.getStyle(key, id));
            }
        }
        apply()
        {
            for (const key in settings)
            {
                if (settings[key] === true)
                {
                    const func = eval(this.data[key]);
                    if (func)
                    {
                        const attribute = func(settings, this);
                        this.attributes[key] = attribute;
                        if (attribute.ajaxReload)
                        {
                            $(document).ajaxComplete(() =>
                            {
                                func(settings, this);
                            });
                        }
                    }
                }
            }
        }
    }

    loadSettings();
    const resources = new ResourceManager();
    resources.fetch();
})(window.jQuery.noConflict(true));
