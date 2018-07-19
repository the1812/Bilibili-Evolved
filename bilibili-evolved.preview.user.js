// ==UserScript==
// @name         Bilibili Evolved (Preview)
// @version      0.9.0
// @description  增强哔哩哔哩Web端体验. (预览版分支)
// @author       Grant Howard
// @match        *://*.bilibili.com/*
// @match        *://*.bilibili.com
// @grant        unsafeWindow
// @require      https://static.hdslb.com/js/jquery.min.js
// @icon         https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/images/logo.png
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
            useDarkStyle: true
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
        // $.ajax will be modified by bilibili, so I have to use my own implementation.
        function ajax(url, done)
        {
            const xhr = new XMLHttpRequest();
            xhr.addEventListener("load", () => done(xhr.responseText));
            xhr.open("GET", url);
            xhr.send();
        }

        class ExternalResource
        {
            static get resourceUrls()
            {
                const root = "https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/";
                const urls = {
                    style: "style/style.scss",
                    oldStyle: "style/style-old.scss",
                    darkStyle: "style/style-dark.scss",
                    touchPlayerStyle: "style/style-touch-player.scss",
                    navbarOverrideStyle: "style/style-navbar-override.css",
                    noBannerStyle: "style/style-no-banner.css",
                    guiSettingsStyle: "style/style-gui-settings.scss",
                    guiSettingsDom: "utils/gui-settings.html",
                    guiSettings: "utils/gui-settings.js",
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
                    ajax(url, data =>
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
            // settings.guiSettings = true;
            for (const key in settings)
            {
                if (settings[key] === true)
                {
                    const func = eval(resources.data[key]);
                    if (func)
                    {
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
            }
            waitForQuery()(
                () => $(".member-bottom"),
                it => it.length > 0,
                it =>
                {
                    if ($(".gui-settings").length === 0)
                    {
                        it.append(`<span class='gui-settings'>设置</span>`);
                        $(".gui-settings").on("click", () =>
                        {
                            $(".gui-settings-panel").css("display", "flex");
                        });
                    }
                    const style = resources.getStyle("guiSettingsStyle", "gui-settings-style");
                    $("body").after(style);
                    const settingsBox = resources.data.guiSettingsDom;
                    if (settingsBox)
                    {
                        $("body").append(settingsBox);

                        $(".gui-settings-close path").attr("d", "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z");
                        $(".gui-settings-ok path").attr("d", "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z");

                        const dependencies = {};
                        for (const key in settings)
                        {
                            $(`input[type='checkbox'][key='${key}']`).prop("checked", settings[key]);
                            $(`input[dependencies]`).each((_, element) =>
                            {
                                dependencies[$(element).prop("key")] = $(element).prop("dependencies");
                            });
                            $(`input[type='checkbox']`).on("change", () =>
                            {
                                const self = $(this);
                                for (const key in dependencies)
                                {
                                    if (dependencies[key].indexOf(self.prop("key")) !== -1)
                                    {
                                        $(`input[key='${key}']`).prop("disabled", self.prop("checked"));
                                    }
                                }
                            });
                        }
                    }
                }
            );
        });
    });
})(window.jQuery.noConflict(true));
