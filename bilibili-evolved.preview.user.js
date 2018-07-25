// ==UserScript==
// @name         Bilibili Evolved (Preview)
// @version      0.9.3
// @description  增强哔哩哔哩Web端体验. (预览版分支)
// @author       Grant Howard
// @match        *://*.bilibili.com/*
// @match        *://*.bilibili.com
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://code.jquery.com/jquery-3.2.1.min.js
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
        const settings = {
            // remove ads
            removeAds: true,
            // max retry count used for query elements
            touchNavBar: false,
            // (Experimental) touch support for video player
            touchVideoPlayer: false,
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
            // (Experimental) use dark mode
            useDarkStyle: false,
            // use new styles for nav bar and player
            useNewStyle: true
        };
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
        function reload(resources)
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
        }
        function loadSettings()
        {
            for (const key in settings)
            {
                settings[key] = GM_getValue(key, settings[key]);
            }
        }
        function saveSettings(newSettings)
        {
            for (const key in settings)
            {
                GM_setValue(key, newSettings[key]);
            }
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

        loadSettings();
        const resources = new ExternalResource();
        resources.ready(() =>
        {
            reload(resources);
            // #utils/gui-settings.js
            const svgData = {
                settings: "M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z",
                close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
                ok: "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
            };
            const textValidate = {
                "customStyleColor": text =>
                {
                    const match = text.match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/);
                    if (match)
                    {
                        if (text.length < 7)
                        {
                            return `#${text[0]}${text[0]}${text[1]}${text[1]}${text[2]}${text[2]}`;
                        }
                        else
                        {
                            return text;
                        }
                    }
                    else
                    {
                        return settings.customStyleColor;
                    }
                },
                "blurBackgroundOpacity": text =>
                {
                    const match = text.match(/^([-\+]?\d+)(\.\d+)?$/);
                    if (match)
                    {
                        const value = parseFloat(text);
                        if (value >= 0 && value <= 1)
                        {
                            return text;
                        }
                    }
                    return settings.blurBackgroundOpacity;
                }
            };
            waitForQuery()(
                () => $("html[class]>body"),
                it => it.length > 0,
                it =>
                {
                    if ($(".gui-settings").length === 0)
                    {
                        it.append(`<div class='gui-settings-icon-panel'><div class='gui-settings'>
                            <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                                <path/>
                            </svg>
                        </div></div>`);
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
                        const reloadGuiSettings = () =>
                        {
                            for (const key in settings)
                            {
                                $(`input[type='checkbox'][key='${key}']`).prop("checked", settings[key]);
                                $(`input[type='text'][key='${key}']`).val(settings[key]);
                            }
                        };
                        $("body").append(settingsBox);
                        $(".gui-settings-header .gui-settings-close").on("click", () =>
                        {
                            $(".gui-settings-panel").css("display", "none");
                        });
                        $("input[key='customStyleColor']").on("change", () =>
                        {
                            const color = textValidate.customStyleColor($(this).val());
                            $("div.custom-color-preview").css("background", color);
                        });
                        $("button.save").on("click", () =>
                        {
                            $("input[type='checkbox'][key]")
                                .each((_, element) =>
                                {
                                    settings[$(element).attr("key")] = $(element).prop("checked");
                                });
                            $("input[type='text'][key]")
                                .each((_, element) =>
                                {
                                    const key = $(element).attr("key");
                                    const value = $(element).val();
                                    settings[key] = textValidate[key](value);
                                });
                            saveSettings(settings);
                            const svg = $(".gui-settings-footer svg.gui-settings-ok");
                            if (parseInt(svg.css("width")) === 0)
                            {
                                svg.css({
                                    width: "30px",
                                    marginLeft: "3rem"
                                });
                                setTimeout(() =>
                                {
                                    svg.css({
                                        width: "0",
                                        marginLeft: "0"
                                    });
                                }, 3000);
                            }
                            reloadGuiSettings();
                        });

                        $(".gui-settings-close path").attr("d", svgData.close);
                        $(".gui-settings-ok path").attr("d", svgData.ok);
                        $(".gui-settings svg path").attr("d", svgData.settings);

                        reloadGuiSettings();
                        const dependencies = {};
                        $(`input[dependencies]`).each((_, element) =>
                        {
                            dependencies[$(element).attr("key")] = $(element).attr("dependencies");
                        });
                        $(`input[type='checkbox']`).on("change", e =>
                        {
                            const self = $(e.srcElement);
                            const checked = self.prop("checked");
                            for (const key in dependencies)
                            {
                                const dependency = dependencies[key].split(" ");
                                if (dependency.indexOf(self.attr("key")) !== -1)
                                {
                                    let value = true;
                                    if (checked && dependency.every(k => $(`input[key='${k}']`).prop("checked")))
                                    {
                                        value = false;
                                    }
                                    $(`input[key='${key}']`).prop("disabled", value);
                                    if (value)
                                    {
                                        $(`input[key='${key}'][type='text']`).parent().addClass("disabled");
                                    }
                                    else
                                    {
                                        $(`input[key='${key}'][type='text']`).parent().removeClass("disabled");
                                    }
                                }
                            }
                        });
                    }
                }
            );
            // -#utils/gui-settings.js
        });
    });
})(window.jQuery.noConflict(true));
