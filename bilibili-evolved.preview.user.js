// ==UserScript==
// @name         Bilibili Evolved (Preview)
// @version      1.1.0
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
        removeAds: true,
        hideTopSearch: false,
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
    function downloadText(url, done)
    {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", () => done(xhr.responseText));
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
        hexToRgb(hex)
        {
            const regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            const color = regex ? {
                r: parseInt(regex[1], 16),
                g: parseInt(regex[2], 16),
                b: parseInt(regex[3], 16)
            } : undefined;
            return color;
        }
        rgbToHsb(rgb)
        {
            const { r, g, b } = rgb;
            let h, s, v;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
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
            s = Math.round((max === 0 ? 0 : delta / max) * 100);
            v = Math.round(max / 255 * 100);

            return { h: h, s: s, b: v };
        }
        get hsb()
        {
            return this.rgbToHsb(this.rgb);
        }
        get foreground()
        {
            const color = this.rgb;
            if (color)
            {
                const grey = 1 - (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
                if (grey < 0.35)
                {
                    return "#000";
                }
                else
                {
                    return "#fff";
                }
            }
            else
            {
                return "#fff";
            }
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
    class ExternalResource
    {
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
                hideTopSearch: "utils/hide-top-search.min.js"
            };
            for (const key in urls)
            {
                urls[key] = root + urls[key];
            }
            return urls;
        }
        constructor()
        {
            this.data = {};
            this.ajaxReload = [
                "touchVideoPlayer",
                "watchLaterRedirect",
                "expandDanmakuList"
            ];
            this.color = new ColorProcessor(settings.customStyleColor);
            settings.foreground = this.color.foreground;
            settings.blueImageFilter = this.color.blueImageFilter;
            settings.pinkImageFilter = this.color.pinkImageFilter;
            settings.brightness = this.color.brightness;
            settings.filterInvert = this.color.filterInvert;
        }
        ajax(url, done)
        {
            downloadText(url, done);
        }
        fetch(callback)
        {
            this.callback = callback;
            const replaceCustomColor = (style) =>
            {
                for (const key of Object.keys(settings))
                {
                    style = style.replace(new RegExp("\\$" + key, "g"), settings[key]);
                }
                return style;
            };
            const urls = ExternalResource.resourceUrls;
            const resourceCount = Object.keys(urls).length;
            let downloadedCount = 0;
            for (const key in urls)
            {
                const url = urls[key];
                this.ajax(url, data =>
                {
                    if (url.indexOf(".scss") !== -1)
                    {
                        this.data[key] = replaceCustomColor(data);
                    }
                    else
                    {
                        this.data[key] = data;
                    }
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
                $("html").prepend(this.getStyle(key, id));
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
                        func(settings, this);
                        if (this.ajaxReload.indexOf(key) !== -1)
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
    const resources = new ExternalResource();
    resources.fetch();
})(window.jQuery.noConflict(true));
