// ==UserScript==
// @name         Bilibili Evolved
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Powerful tools for bilibili.
// @author       Grant Howard
// @match        *://*.bilibili.com/*
// @match        *://*.bilibili.com
// @grant        unsafeWindow
// @grant        GM_getResourceText
// @resource     style https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/style/style.scss
// @resource     touchPlayerStyle https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/style/style-touch-player.scss
// @resource     oldStyle https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/style/style-old.scss
// @resource     darkStyle https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/style/style-dark.scss
// @require      https://static.hdslb.com/js/jquery.min.js
// @require      https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/utils/common.min.js
// @require      https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/utils/remove-ads.min.js
// @require      https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/utils/watchlater.min.js
// @require      https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/utils/expand-danmaku.min.js
// @require      https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/touch/touch-navbar.min.js
// @require      https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/touch/touch-player.min.js
// @require      https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/style/new-styles.min.js
// @require      https://raw.githubusercontent.com/the1812/Bilibili-Evolved/master/style/dark-styles.min.js
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
            // use new styles for nav bar and player
            useNewStyles: true,
            // [New Styles]
            // set theme color (must in #rrggbb format, not compatible with Edge)
            customStyleColor: colors.pink,
            // [New Styles]
            // set background blur opacity of nav bar
            blurBackgroundOpacity: 0.382,
            // [New Styles]
            // (Not Implemented) use dark mode
            useDarkMode: true,
            // [New Styles]
            // (Experimental) use new nav bar in old sites
            overrideNavBar: true,
            // [New Styles -> Override Nav Bar]
            // show top banner
            showBanner: true
        };
        for (const key in userSettings)
        {
            settings[key] = userSettings[key];
        }

        if (settings.removeAds)
        {
            removeAds(settings);
        }
        if (settings.touchNavBar)
        {
            touchNavBar(settings);
        }
        if (settings.touchVideoPlayer)
        {
            touchVideoPlayer(settings);
            $(document).ajaxComplete(() =>
            {
                touchVideoPlayer(settings);
            });
        }
        if (settings.watchLaterRedirect)
        {
            watchlaterRedirect(settings);
            $(document).ajaxComplete(() =>
            {
                watchlaterRedirect(settings);
            });
        }
        if (settings.expandDanmakuList)
        {
            expandDanmakuList(settings);
            $(document).ajaxComplete(() =>
            {
                expandDanmakuList(settings);
            });
        }
        if (settings.useNewStyles)
        {
            newStyle(settings);
        }
        if (settings.useDarkMode)
        {
            darkStyle(settings);
        }
    });
})(window.jQuery.noConflict(true));
