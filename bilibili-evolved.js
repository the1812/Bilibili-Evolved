// ==UserScript==
// @name         Bilibili Evolved
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Powerful tools for bilibili.
// @author       Grant Howard
// @match        *://*.bilibili.com/*
// @match        *://*.bilibili.com
// @grant        unsafeWindow
// @require      https://static.hdslb.com/js/jquery.min.js
// @icon         https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/logo.png
// ==/UserScript==
(self$ =>
{
    const $ = unsafeWindow.$ || self$;
    $(document).ready(() =>
    {
        const colors = {
            red: "#E53935",
            pink: "#F06292",
            purple: "#AB47BC",
            deepPurple: "#7E57C2",
            indigo: "#7986CB",
            blue: "#1E88E5",
            lightBlue: "#00A0D8",
            cyan: "#00ACC1",
            teal: "#26A69A",
            green: "#66BB6A",
            lightGreen: "#8BC34A",
            lime: "#CDDC39",
            yellow: "#FFEB3B",
            amber: "#FFC107",
            orange: "#FF9800",
            deepOrange: "#FF5722",
            brown: "#795548",
            grey: "#757575",
            blueGrey: "#607D8B"
        };
        // User settings will overwrite default settings below
        const userSettings = {
            customStyleColor: colors.pink,
            showBanner: false,
            useDarkMode: true
        };
        const settings = {
            // remove ads
            removeAds: true,
            // max retry count used for query elements
            touchNavBar: true,
            // (Experimental) touch support for video player
            touchVideoPlayer: true,
            // redirect to original sites in watchlater list
            watchLaterRedirect: true,
            // auto expand danmaku list
            expandDanmakuList: true,
            // [New Styles]
            // set theme color (must in #rrggbb format, not compatible with Edge)
            customStyleColor: colors.pink,
            // [New Styles]
            // set background blur opacity of nav bar
            blurBackgroundOpacity: 0.382,
            // [New Styles]
            // (Experimental) use new nav bar in old sites
            overrideNavBar: true,
            // [New Styles -> Override Nav Bar]
            // show top banner
            showBanner: true,
            // [New Styles]
            // (Not Implemented) use dark mode
            useDarkStyle: true,
            // use new styles for nav bar and player
            useNewStyle: true
        };
        for (const key in userSettings)
        {
            settings[key] = userSettings[key];
        }
        const ajaxReload = [
            "touchVideoPlayer",
            "watchLaterRedirect",
            "expandDanmakuList"
        ];
        function waitForQuery()
        {
            const MaxRetry = 30;
            let retry = 0;
            const tryQuery = (query, condition, action, failed) =>
            {
                if (retry >= MaxRetry)
                {
                    if (failed)
                    {
                        failed();
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
                        retry++;
                        setTimeout(() => tryQuery(query, condition, action, failed), 500);
                    }
                }
            };
            return tryQuery;
        }

        class ExternalResource
        {
            static get resourceUrls()
            {
                const root = "https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/";
                const urls = {
                    style: "style/style.scss",
                    oldStyle: "style/style-old.scss",
                    darkStyle: "style/style-dark.scss",
                    touchPlayerStyle: "style/style-touch-player.scss",
                    navbarOverrideStyle: "style/style-navbar-override.css",
                    noBannerStyle: "style/style-no-banner.css",
                    useDarkStyle: "style/dark-styles.min.js",
                    useNewStyle: "style/new-styles.min.js",
                    touchNavBar: "touch/touch-navbar.min.js",
                    touchVideoPlayer: "touch/touch-player.min.js",
                    expandDanmakuList: "utils/expand-danmaku.min.js",
                    removeAds: "utils/remove-promotions.min.js",
                    watchLaterRedirect: "utils/watchlater.min.js"
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
                const foreground = (() =>
                {
                    const regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(settings.customStyleColor);
                    const color = regex ? {
                        r: parseInt(regex[1], 16),
                        g: parseInt(regex[2], 16),
                        b: parseInt(regex[3], 16)
                    } : undefined;
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
                })();
                settings.foreground = foreground;
                settings.brightness = `${foreground === "#000" ? "100" : "0"}%`;
                settings.filterBrightness = foreground === "#000" ? "0" : "100";
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
                    $.ajax(url).done(data =>
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
                        if (downloadedCount >= resourceCount && this.callback)
                        {
                            this.callback();
                        }
                    });
                }
            }
            ready(callback)
            {
                this.callback = callback;
            }
            getStyle(key, id)
            {
                return `<style id='${id}'>${this.data[key]}</style>`;
            }
        }

        const resources = new ExternalResource();
        resources.ready(() =>
        {
            for (const key in settings)
            {
                if (settings[key] === true)
                {
                    const func = eval(resources.data[key]);
                    func(settings, resources);
                    if (ajaxReload.indexOf(key) !== -1)
                    {
                        $(document).ajaxComplete(() =>
                        {
                            func(settings, resources);
                        });
                    }
                }
            }
        });
    });
})(window.jQuery.noConflict(true));
