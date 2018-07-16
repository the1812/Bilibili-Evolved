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
        if (settings.removeAds)
        {
            removeAds();
        }
        if (settings.touchNavBar)
        {
            touchNavBar();
        }
        if (settings.touchVideoPlayer)
        {
            touchVideoPlayer();
            $(document).ajaxComplete(() =>
            {
                touchVideoPlayer();
            });
        }
        if (settings.watchLaterRedirect)
        {
            watchlaterRedirect();
            $(document).ajaxComplete(() =>
            {
                watchlaterRedirect();
            });
        }
        if (settings.expandDanmakuList)
        {
            expandDanmakuList();
            $(document).ajaxComplete(() =>
            {
                expandDanmakuList();
            });
        }
        if (settings.useNewStyles)
        {
            newStyle();
        }
        if (settings.useDarkMode)
        {
            darkStyle();
        }
    });
})(window.jQuery.noConflict(true));
