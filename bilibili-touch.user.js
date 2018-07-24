// ==UserScript==
// @name         Bilibili Touch
// @namespace    http://tampermonkey.net/
// @version      3.4
// @description  Touch optimizations and UI improvements for Bilibili
// @author       Grant Howard
// @match        *://*.bilibili.com/*
// @match        *://*.bilibili.com
// @grant        unsafeWindow
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAACXBIWXMAAAsTAAALEwEAmpwYAAAH0mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOC0wMi0yNVQxNDo1NzozOCswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wMi0yNVQxNDo1NzozOCswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTgtMDItMjVUMTQ6NTc6MzgrMDg6MDAiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODY3MDMzY2UtZjdlMy0wYTRiLWE5YWItODE3ZTI2ZmNlYTMyIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YWFhN2UzZTQtM2MzOS0yOTQ4LWI1OTgtYTEzM2ZjMTMxNDMyIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YjRjNGFjZWUtZjQyYS0yMTQwLTlmMzgtY2NlZTc3YmY2ZTM1IiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkhpc3Rvcnk9IjIwMTgtMDItMjVUMTQ6NTc6MTArMDg6MDAmI3g5O+aWh+S7tiDmnKrmoIfpopgtMiDlt7LmiZPlvIAmI3hBO+W7uueriyYjeDk75paw5bu6OiDmlofmoaMmI3hBO0ZBTFNFJiN4QTvmqKHlvI86IFJHQiDpopzoibLmqKHlvI8mI3hBO+WuveW6pjogMi41IOiLseWvuCYjeEE76auY5bqmOiAyLjUg6Iux5a+4JiN4QTvmr4/oi7Hlr7gg5YiG6L6o546HOiA3MiYjeEE75YOP57Sg6ZW/5a695q+UOiAxJiN4QTvloavlhYU6IOmAj+aYjiYjeEE75rex5bqmOiA4JiN4QTvphY3nva7mlofku7Y6IOKAnG5vbmXigJ0mI3hBO+WPguiAg+e6vzog5pegJiN4QTsyMTcmI3hBOyYjeEE757KY6LS0JiN4QTvnspjotLQmI3g5O+a2iOmZpOmUr+m9vzog5pegJiN4QTvkuLo6IOWDj+e0oCYjeEE7JiN4QTsyMDE4LTAyLTI1VDE0OjU3OjM4KzA4OjAwJiN4OTvmlofku7YgQzpcVXNlcnNcVGhlMThcUGljdHVyZXNcR3JhcGhpY3NcYmlsaWJpbGkgbG9nbyBzbWFsbC5wbmcg5bey5a2Y5YKoJiN4QTvlrZjlgqgmI3g5OyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YjRjNGFjZWUtZjQyYS0yMTQwLTlmMzgtY2NlZTc3YmY2ZTM1IiBzdEV2dDp3aGVuPSIyMDE4LTAyLTI1VDE0OjU3OjM4KzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIg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
// @require      https://static.hdslb.com/js/jquery.min.js
// @require      https://raw.githubusercontent.com/briangonzalez/rgbaster.js/master/rgbaster.min.js
// ==/UserScript==

(self$ =>
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
        maxQueryRetry: 30,
        // query retry interval (ms)
        queryInterval: 500,
        // touch support for nav bar (not compatible with Edge)
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
        // [Not used]
        // (Experimental) use dominant color of banner image
        // useDominantColor: false
    };
    for (const key in userSettings)
    {
        settings[key] = userSettings[key];
    }

    const $ = unsafeWindow.$ || self$;
    const waitForQuery = () =>
    {
        const MaxRetry = settings.maxQueryRetry;
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
                    setTimeout(() => tryQuery(query, condition, action, failed), settings.queryInterval);
                }
            }
        };
        return tryQuery;
    };
    const getEventHandler = (element, event) =>
    {
        return element.data("events")[event][0].handler;
    };
    const getPosition = element =>
    {
        let x = 0;
        let y = 0;
        while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop))
        {
            x += element.offsetLeft - element.scrollLeft;
            y += element.offsetTop - element.scrollTop;
            element = element.offsetParent;
        }
        return { x: x, y: y };
    };
    class Swiper
    {
        constructor(element)
        {
            this.action = new SwipeAction(element);
            this.onTouchStart = undefined;
            this.onTouchEnd = undefined;
            this._direction = null;

            element.addEventListener("touchstart", e =>
            {
                this._xDown = e.touches[0].clientX;
                this._yDown = e.touches[0].clientY;
                if (this.onTouchStart)
                {
                    this.onTouchStart(e);
                }
            });
            element.addEventListener("touchmove", e =>
            {
                if (!this._xDown || !this._yDown)
                {
                    return;
                }
                const xUp = e.touches[0].clientX;
                const yUp = e.touches[0].clientY;
                const elementPosition = getPosition(element);
                const position = {
                    x: (e.touches[0].pageX - elementPosition.x) / element.clientWidth,
                    y: (e.touches[0].pageY - elementPosition.y) / element.clientHeight,
                    width: element.clientWidth,
                    height: element.clientHeight
                };

                const xDiff = this._xDown - xUp;
                const yDiff = this._yDown - yUp;

                if (!this._direction)
                {
                    let direction = "";
                    if (Math.abs(xDiff) > Math.abs(yDiff))
                    {
                        direction = "horizontal";
                    }
                    else
                    {
                        direction = "vertical";
                    }
                    this._direction = direction;
                    e.preventDefault();
                }
                else
                {
                    if (this._direction === "vertical")
                    {
                        this.action.startAction(this._direction, yDiff, position);
                    }
                    else if (this._direction === "horizontal")
                    {
                        this.action.startAction(this._direction, -xDiff, position);
                    }
                    e.preventDefault();
                }

            });
            element.addEventListener("touchend", e =>
            {
                this._xDown = null;
                this._yDown = null;
                this._direction = null;
                if (this.onTouchEnd)
                {
                    this.onTouchEnd(e);
                }
            });
        }
    }
    class SwipeAction
    {
        constructor(element)
        {
            this.lowSpeedForward = undefined;
            this.lowSpeedBackward = undefined;
            this.mediumSpeedForward = undefined;
            this.mediumSpeedBackward = undefined;
            this.highSpeedForward = undefined;
            this.highSpeedBackward = undefined;

            this.lowVolumeUp = undefined;
            this.lowVolumeDown = undefined;
            this.mediumVolumeUp = undefined;
            this.mediumVolumeDown = undefined;
            this.highVolumeUp = undefined;
            this.highVolumeDown = undefined;

            this.speedCancel = undefined;
            this.volumeCancel = undefined;
            this.minSwipeDistance = 20;
            this.onActionStart = undefined;
            this.onActionEnd = undefined;

            this._element = element;
            this._touchStart = false;
            this._startPosition = null;
            this._lastAction = null;
            element.addEventListener("touchstart", () =>
            {
                this._touchStart = true;
            });
            element.addEventListener("touchend", () =>
            {
                this._startPosition = null;
                this.onActionEnd && this.onActionEnd(this._lastAction);
                this._lastAction = null;
            });
        }

        startAction(direction, distance, position)
        {
            if (this._touchStart)
            {
                this.onActionStart && this.onActionStart();
                this._startPosition = position;
                this._touchStart = false;
            }
            if (direction === "vertical")
            {
                if (Math.abs(distance) < this.minSwipeDistance)
                {
                    this.volumeCancel && this.volumeCancel();
                    this._lastAction = null;
                }
                else
                {
                    let volumeFactor = 0;
                    let upHandler = undefined;
                    let downHandler = undefined;
                    if (this._startPosition.x < 1 / 3)
                    {
                        volumeFactor = 0.4;
                        upHandler = this.lowVolumeUp;
                        downHandler = this.lowVolumeDown;
                    }
                    else if (this._startPosition.x >= 1 / 3 && this._startPosition.x <= 2 / 3)
                    {
                        volumeFactor = 1;
                        upHandler = this.mediumVolumeUp;
                        downHandler = this.mediumVolumeDown;
                    }
                    else
                    {
                        volumeFactor = 2;
                        upHandler = this.highVolumeUp;
                        downHandler = this.highVolumeDown;
                    }

                    if (distance > 0)
                    {
                        const volumeChange = Math.round(
                            volumeFactor * 100 * (distance - this.minSwipeDistance) / (1.5 * position.height)
                        );
                        upHandler && upHandler(volumeChange);
                        this._lastAction = {
                            type: "volume",
                            volume: volumeChange
                        };
                    }
                    else
                    {
                        const volumeChange = Math.round(
                            volumeFactor * 100 * (distance + this.minSwipeDistance) / (1.5 * position.height)
                        );
                        downHandler && downHandler(volumeChange);
                        this._lastAction = {
                            type: "volume",
                            volume: volumeChange
                        };
                    }
                }
            }
            else if (direction === "horizontal")
            {
                if (position.y < 1 / 3 && (position.x < 0.1 || position.x > 0.9) ||
                    Math.abs(distance) < this.minSwipeDistance)
                {
                    this.speedCancel && this.speedCancel();
                    this._lastAction = null;
                }
                else
                {
                    let speedFactor = 0;
                    let forwardHandler = undefined;
                    let backwardHandler = undefined;
                    if (this._startPosition.y < 1 / 3)
                    {
                        speedFactor = 0.05;
                        forwardHandler = this.lowSpeedForward;
                        backwardHandler = this.lowSpeedBackward;
                    }
                    else if (this._startPosition.y >= 1 / 3 && this._startPosition.y <= 2 / 3)
                    {
                        speedFactor = 0.2;
                        forwardHandler = this.mediumSpeedForward;
                        backwardHandler = this.mediumSpeedBackward;
                    }
                    else
                    {
                        speedFactor = 1;
                        forwardHandler = this.highSpeedForward;
                        backwardHandler = this.highSpeedBackward;
                    }

                    if (distance > 0)
                    {
                        const seconds = (distance - this.minSwipeDistance) * speedFactor;
                        forwardHandler && forwardHandler(seconds);
                        this._lastAction = {
                            type: "playback",
                            seconds: seconds
                        };
                    }
                    else
                    {
                        const seconds = (distance + this.minSwipeDistance) * speedFactor;
                        backwardHandler && backwardHandler(seconds);
                        this._lastAction = {
                            type: "playback",
                            seconds: seconds
                        };
                    }
                }
            }
        }
    }
    class VideoShot
    {
        constructor(totalTime)
        {
            this.interval = totalTime < 5 * 100 ? 5 : totalTime / 100;
            this.firstShot = {
                css: {
                    backgroundPosition: "-160px 0px"
                },
                x: -160,
                y: 0,
                position: 2
            };
            this.lastShot = {
                css: {
                    backgroundPosition: "-1440px -810px"
                },
                x: -1440,
                y: -810,
                position: 100
            };

            this.imageXLength = 10;
            this.imageYLength = 10;
            this.imageXSize = 160;
            this.imageYSize = 90;
            this.imageUrl = null;
            this.imageIndex = [];
        }
        init(input)
        {
            const matches = input.prop("value").match(/aid=([\d]+)&cid=([\d]+)/);
            const aid = matches[1];
            const cid = matches[2];
            $.ajax({
                type: "GET",
                url: `https://api.bilibili.com/x/player/videoshot?aid=${aid}&cid=${cid}&index=1`,
                success: obj =>
                {
                    const data = obj.data;
                    this.imageXLength = data.img_x_len;
                    this.imageYLength = data.img_y_len;
                    this.imageXSize = data.img_x_size;
                    this.imageYSize = data.img_y_size;
                    this.imageIndex = data.index;
                    this.imageUrl = data.image[0];

                    this.firstShot = {
                        css: {},
                        x: -this.imageXSize,
                        y: 0,
                        position: 1
                    };
                    this.firstShot.css.backgroundPosition = `${this.firstShot.x}px ${this.firstShot.y}px`;
                    this.lastShot = {
                        css: {},
                        x: -this.imageXSize * (this.imageXLength - 1),
                        y: -this.imageYSize * (this.imageYLength - 1),
                        position: 99
                    };
                    this.lastShot.css.backgroundPosition = `${this.lastShot.x}px ${this.lastShot.y}px`;


                }
            });
        }
        _getStyle(position)
        {
            if (position <= this.firstShot.position)
            {
                return this.firstShot.css;
            }
            else if (position >= this.lastShot.position)
            {
                return this.lastShot.css;
            }
            else
            {
                const x = -160 * (position % 10 - 1);
                const y = -90 * (position >= 100 ? 9 : Math.trunc(position / 10));
                return {
                    backgroundPosition: `${x}px ${y}px`
                };
            }
        }
        getStyle(time)
        {
            const position = Math.round(time / interval);
            return this._getStyle(position);
        }
    }

    $(document).ready(() =>
    {
        // Remove ads
        if (settings.removeAds)
        {
            waitForQuery()(
                () => $("#slide_ad"),
                it => it.length > 0,
                it => it.css("display", "none")
            );
            waitForQuery()(
                () => $("#home_popularize"),
                it => it.length > 0,
                it => it.css("display", "none")
            );
            waitForQuery()(
                () => $(".gg-floor-module"),
                it => it.length > 0,
                it => it.css("display", "none")
            );
        }

        // Touch nav bar
        if (settings.touchNavBar)
        {
            waitForQuery()(
                () => $("ul.fr>li.nav-item").not(".profile-info"),
                it => it.length === 6,
                navItems =>
                {
                    const navTouch = (_, nav) =>
                    {
                        const $nav = $(nav);
                        $nav.css("cursor", "pointer");
                        const a = $nav.find("a.t");
                        a.removeAttr("href");
                    };
                    navItems.each(navTouch);
                }
            );
        }

        // Touch video player
        const touchVideoPlayer = () =>
        {
            waitForQuery()(
                () => $(".bilibili-player-video-web-fullscreen"),
                it => it.length > 0,
                fullscreenButton =>
                {
                    if (!fullscreenButton.hasClass("bilibili-player-video-btn") &&
                        $(".bilibili-player-video-btn-fullscreen").data("events"))
                    {
                        const clickHandler = getEventHandler(
                            $(".bilibili-player-video-btn-fullscreen"), "click");
                        fullscreenButton
                            .detach()
                            .insertAfter(".bilibili-player-video-btn-widescreen")
                            .addClass("bilibili-player-video-btn")
                            .on("click", clickHandler);
                    }
                }
            );
            waitForQuery()(
                () => $(".bilibili-player-iconfont,.bilibili-player-video-quality-menu"),
                it => it.length > 0,
                icons => icons.unbind("click")
            );
            waitForQuery()(
                () => $(".bilibili-player-video"),
                it => it.length > 0 && $("video").length > 0,
                player =>
                {
                    if ($(".touch-video-box").length === 0)
                    {
                        $(".bilibili-player-video-subtitle").before(`<div class='touch-video-box-wrapper'>
                            <div class='touch-video-box'>
                                <div class='touch-video-info'></div>
                            </div>
                        </div>`);
                        const swiper = new Swiper(player.get(0));
                        const text = document.getElementsByClassName("touch-video-info")[0];
                        const box = document.getElementsByClassName("touch-video-box")[0];
                        swiper.action.speedCancel = () =>
                        {
                            text.innerHTML = `松开手指,取消进退`;
                        };
                        swiper.action.volumeCancel = () =>
                        {
                            text.innerHTML = `松开手指,取消调整`;
                        };
                        swiper.action.onActionStart = () =>
                        {
                            box.style.display = "flex";
                            text.innerHTML = "";
                        };

                        const fixed = (number, precision = 1) =>
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
                        };
                        const secondsToTime = sec =>
                        {
                            sec = Math.abs(sec);
                            const hours = Math.floor(sec / 3600);
                            const minutes = Math.floor((sec - hours * 3600) / 60);
                            const seconds = sec - hours * 3600 - minutes * 60;

                            let result = fixed(seconds) + "秒";
                            if (minutes > 0)
                            {
                                result = minutes + "分" + result;
                            }
                            if (hours > 0)
                            {
                                result = hours + "小时" + result;
                            }

                            return result;
                        };
                        const secondsToHms = sec =>
                        {
                            sec = Math.abs(sec);
                            const hours = Math.floor(sec / 3600);
                            const minutes = Math.floor((sec - hours * 3600) / 60);
                            const seconds = sec - hours * 3600 - minutes * 60;

                            let result = (seconds < 10 ? "0" : "") + fixed(seconds);
                            result = (minutes < 10 ? "0" : "") + minutes + ":" + result;
                            result = (hours < 10 ? "0" : "") + hours + ":" + result;

                            return result;
                        };

                        const video = $("video");
                        const videoDuration = video.prop("duration");
                        //const videoshot = new VideoShot(videoDuration);
                        const speedChange = speed =>
                        {
                            return sec =>
                            {
                                const current = video.prop("currentTime");
                                let info = `<div class='touch-row'><span class='touch-speed'>${speed}速</span><span class='touch-info'>进度: ${sec > 0 ? "+" : "-"}`;
                                const commonInfoPart = `</span></div><div class='touch-row'><div class='videoshot'></div><span class='touch-result'>`;
                                const finalTime = current + sec;
                                if (finalTime > videoDuration)
                                {
                                    info += `${secondsToTime(videoDuration - current)}${commonInfoPart}${secondsToHms(current)} → ${secondsToHms(videoDuration)} (100%)`;
                                }
                                else if (finalTime < 0)
                                {
                                    info += `${secondsToTime(current)}${commonInfoPart}${secondsToHms(current)} → ${secondsToHms(0)} (0%)`;
                                }
                                else
                                {
                                    info += `${secondsToTime(sec)}${commonInfoPart}${secondsToHms(current)} → ${secondsToHms(finalTime)} (${fixed(100 * finalTime / videoDuration)}%)`;
                                }
                                text.innerHTML = info + `</span></div>`;
                                //$(".videoshot").css(videoshot.getStyle(finalTime));
                            };
                        };
                        swiper.action.lowSpeedBackward = speedChange("低");
                        swiper.action.lowSpeedForward = speedChange("低");
                        swiper.action.mediumSpeedBackward = speedChange("中");
                        swiper.action.mediumSpeedForward = speedChange("中");
                        swiper.action.highSpeedBackward = speedChange("高");
                        swiper.action.highSpeedForward = speedChange("高");

                        const volumeChange = speed =>
                        {
                            return volume =>
                            {
                                const current = Math.round(video.prop("volume") * 100);
                                let info = `<div class='touch-row'><span class='touch-speed'>${speed}速</span><span class='touch-info'>音量: ${volume > 0 ? "+" : "-"}`;
                                const commonInfoPart = `</span></div><div class='touch-row'><span class='touch-result'>`;
                                const finalVolume = current + volume;
                                if (finalVolume > 100)
                                {
                                    info += `${100 - current}${commonInfoPart}${current} → 100`;
                                }
                                else if (finalVolume < 0)
                                {
                                    info += `${current}${commonInfoPart}${current} → 0`;
                                }
                                else
                                {
                                    info += `${Math.abs(volume)}${commonInfoPart}${current} → ${finalVolume}`;
                                }
                                text.innerHTML = info + `</span></div>`;
                            };
                        };
                        swiper.action.lowVolumeUp = volumeChange("低");
                        swiper.action.lowVolumeDown = volumeChange("低");
                        swiper.action.mediumVolumeUp = volumeChange("中");
                        swiper.action.mediumVolumeDown = volumeChange("中");
                        swiper.action.highVolumeUp = volumeChange("高");
                        swiper.action.highVolumeDown = volumeChange("高");

                        swiper.action.onActionEnd = action =>
                        {
                            box.style.display = "none";
                            text.innerHTML = "";
                            if (action)
                            {
                                if (action.type === "volume")
                                {
                                    let volume = video.prop("volume");
                                    volume += action.volume / 100;
                                    if (volume < 0)
                                    {
                                        volume = 0;
                                    }
                                    else if (volume > 1)
                                    {
                                        volume = 1;
                                    }
                                    video.prop("volume", volume);
                                    $(".bilibili-player-video-volume-num").text(Math.round(volume * 100));
                                    $(".bpui-slider-progress").css("height", volume * 100 + "%");
                                    $(".bpui-slider-handle").css("bottom", (35 + volume * 230) / 3 + "%");

                                    if (volume === 0)
                                    {
                                        $(".icon-24soundoff").show();
                                        $(".icon-24soundlarge").hide();
                                        $(".icon-24soundsmall").hide();
                                    }
                                    else if (volume >= 0.5)
                                    {
                                        $(".icon-24soundoff").hide();
                                        $(".icon-24soundlarge").show();
                                        $(".icon-24soundsmall").hide();
                                    }
                                    else
                                    {
                                        $(".icon-24soundoff").hide();
                                        $(".icon-24soundlarge").hide();
                                        $(".icon-24soundsmall").show();
                                    }
                                }
                                else if (action.type === "playback")
                                {
                                    let time = video.prop("currentTime");
                                    time += action.seconds;
                                    if (time < 0)
                                    {
                                        time = 0;
                                    }
                                    else if (time > videoDuration)
                                    {
                                        time = videoDuration;
                                    }
                                    video.prop("currentTime", time);
                                }
                            }
                        };
                    }
                }
            );

            if ($("#bilibili-touch-video-player").length === 0)
            {
                const videoPlayerStyles = `<style id='bilibili-touch-video-player'>
.touch-video-box-wrapper
{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 14;
    pointer-events: none;
}
.touch-video-box
{
    border-radius: 4px;
    display: none;
    align-items: center;
    justify-content: center;
    width: 50%;
    height: 40%;
    background: #000;
    background: #000A;
    backdrop-filter: blur(30px);
}
.touch-video-info
{
    color: white;
    font-size: 2rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 100%;
    width: 100%;
}
.touch-row
{
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}
.touch-info
{
    display: block;
    flex-grow: 1;
    flex-shrink: 0;
    margin-right: 1em;
    margin-left: 0.2em;
    color: ${settings.customStyleColor};
    max-width: 15em;
}
.touch-result
{
    display: block;
    flex-grow: 1;
    flex-shrink: 0;
    font-size: 1.5rem;
}
.touch-speed
{
    display: block;
    flex-grow: 2;
    flex-shrink: 0;
    background: #444A;
    padding: 0.5em;
    margin-left: 1em;
    border-radius: 4px;
    margin-right: 0.2em;
    max-width: 5em;
}
.videoshot
{
    display:none;

    background-image: none;
    flex-grow: 0;
    flex-shrink: 0;
    border-radius: 4px;
    width: 80px;
    height: 45px;
    background-size: 1000%;
    margin-left: 1em;
}
div.bilibili-player-video-control
{
    height: 38px !important;
    align-items: center !important;
}
.bilibili-player-video-btn
{
    flex-grow: 1 !important;
    height: 38px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}
.bilibili-player-video-inputbar,
.bilibili-player-video-progress
{
    flex-grow: 30 !important;
}
.bilibili-player-video-quality-menu
{
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}
.bilibili-player-iconfont-start,
.bilibili-player-iconfont-pause,
.bilibili-player-iconfont-volume,
.bilibili-player-iconfont-volume-max,
.bilibili-player-iconfont-volume-min,
.bilibili-player-iconfont-setting,
.bilibili-player-iconfont-danmaku,
.bilibili-player-iconfont-danmaku-off,
.bilibili-player-iconfont-repeat,
.bilibili-player-iconfont-widescreen,
.bilibili-player-iconfont-web-fullscreen,
.bilibili-player-iconfont-fullscreen,
.bilibili-player-iconfont-color
{
    font-size: 2.5rem !important;
}
.bilibili-player-iconfont-next
{
    font-size: 2rem !important;
}
.bpui-selectmenu-list,
.bilibili-player-video-danmaku-setting-wrap,
.bilibili-player-video-btn-setting-panel,
.bilibili-player.mode-fullscreen .bilibili-player-video-sendbar
{
    left: unset !important;
    bottom: 38px !important;
}
.bilibili-player-video-volumebar-wrp
{
    left: unset !important;
}
                </style>`;
                $("body").after(videoPlayerStyles);
            }
            // waitForQuery()(
            //     () => $(".bilibili-player-video-progress-detail-img"),
            //     it => it.length > 0,
            //     videoshot =>
            //     {

            //     }
            // );

        };
        touchVideoPlayer();

        // Watch later redirect
        const watchlaterRedirect = () =>
        {
            if (settings.watchLaterRedirect)
            {
                const redirectLinks = items =>
                {
                    if (items.attr("href").indexOf("watchlater") !== 0)
                    {
                        const watchlaterList = items
                            .map((_, it) => "https://www.bilibili.com/" + $(it)
                                .attr("href")
                                .match(/av[\d]+/)[0]);
                        items.each((index, it) => $(it).attr("href", watchlaterList[index]).attr("target", "_blank"));
                    }
                };
                waitForQuery()(
                    () => $(".av-item>a"),
                    it => it.length > 0,
                    items => redirectLinks(items)
                );
                waitForQuery()(
                    () => $("div.watch-later-m>ul>div>li>a"),
                    it => it.length > 0,
                    items => redirectLinks(items)
                );
                waitForQuery()(
                    () => $(".read-more.mr"),
                    it => it.length > 0,
                    it => it.remove()
                );
                waitForQuery()(
                    () => $(".read-more-grp>.read-more"),
                    it => it.length > 0,
                    it => it.css({
                        float: "none",
                        width: "auto"
                    })
                );
                if (document.URL.indexOf("watchlater") !== -1 && document.URL.match(/av[\d]+/))
                {
                    const av = document.URL.match(/av[\d]+/)[0];
                    if (av)
                    {
                        document.URL.replace(`https://www.bilibili.com/${av}`);
                    }
                }
            }
        };
        watchlaterRedirect();

        // Expand danmaku list
        const expandDanmakuList = () =>
        {
            if (settings.expandDanmakuList)
            {
                waitForQuery()(
                    () => $(".bui-collapse-header"),
                    it => it.length > 0,
                    button =>
                    {
                        if (parseInt($(".bui-collapse-body").css("height")) === 0 &&
                            $(".bui-collapse-arrow-text").text() === "展开")
                        {
                            button.click();
                        }
                    }
                );
            }
        };
        expandDanmakuList();

        $(document).ajaxComplete(() =>
        {
            expandDanmakuList();
            watchlaterRedirect();
            touchVideoPlayer();
        });

        // Styles
        if (settings.useNewStyles)
        {
            waitForQuery()(
                () => $(".nav-search-keyword"),
                it => it.length > 0,
                textBox => textBox.attr("placeholder", "搜索")
            );
            waitForQuery()(
                () => $(".custom-scrollbar"),
                it => it.length > 0,
                it => it.removeClass("custom-scrollbar")
            );
            // waitForQuery()(
            //     () => $("li.home>a"),
            //     it => it.length > 0 && it.css("font-size").indexOf("12px") !== -1,
            //     it => it.css("font-size", "0px")
            // );

            const getForeground = () =>
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
            };

            const updateDarkModeColor = () =>
            {
                if (settings.useDarkMode)
                {
                    const foreground = getForeground();
                    const darkStyles = `<style id='bilibili-new-style-dark'>
body,
html,
p.num,
.bili-header-m.report-wrap-module,
.bili-footer,
.footer-wrp,
div.box,
div.live-box,
div.bubble-traditional,
div.dd-bubble,
div.ver span.tips,
div.desc-tips,
div.member-bottom,
div.im-list-box,
div.i-frame,
.dynamic-m,
ul.dyn_list,
.history-tag,
div.dyn_list_wrapper,
ul.up-nav,
ul.up-nav li,
span.date,
ul.bilibili-suggest,
.b-line>p>span,
.sub-nav,
.video-info-module,
div.stardust-player,
div.danmaku-wrap,
div.bilibili-player-auxiliary-area,
.bilibili-player-danmaku-date-picker-container,
.video-toolbar .share .share-pos .share-address ul li input,
li.tag,
.btn-add,
form.ipt,
.tag-info-pane,
.bangumi-info-module,
.bb-comment,
.user-card-m,
textarea,
.bb-comment .hot-line span,
.page-jump>input,
.bilibili-player-video-control,
.bilibili-player-video-sendbar,
.bilibili-player-video-inputbar,
.bilibili-player-video-progress-detail-time,
.bilibili-player.mode-fullscreen .bilibili-player-area .bilibili-player-video-control .bilibili-player-video-btn.bilibili-player-video-btn-widescreen,
.bilibili-player-video-volumebar-wrp,
.bpui-selectmenu-list,
.bpui-selectmenu-list-row[data-selected],
.bilibili-player-video-time-seek,
.user-card,
.emoji-box,
.emoji-tabs,
.bilibili-player-video-btn-setting-panel,
.bilibili-player-video-danmaku-setting-box,
.bilibili-player-video-danmaku-setting-left,
.bilibili-player-video-danmaku-setting-right,
.bui-select-list,
.bilibili-player-mode-selection-container,
.mode .selection-span,
.bilibili-player-color-picker-container,
.bilibili-player-color-picker-color-code,
.bilibili-player-block-string-short,
.bilibili-player-block-line,
.bilibili-player-modal-container,
.bpm-btn,
.bui-input-input,
.bui-select .bui-select-border,
.advanced-danmaku-group .adv-danmaku-btn-span,
.advanced-danmaku-group .adv-danmaku-btn-span.bpui-button-type-small,
.bui-input-wrap-disabled,
.bilibili-player-block-tabpanel .bilibili-player-block-tabpanel-row.bilibili-player-border,
.multi-page .cur-list li.on,
.multi-page .cur-list li.on:hover,
.collection-m,
.coin-operated-m,
.follow-dialog-window,
form.searchform:hover,
#app,
.home-page .back-top,
.repost,
.not-support,
.deleted,
.video-container,
.article-container,
.imagesbox .boost-control,
.history-list .r-info,
.dynamic-link-hover-bg:hover,
.dynamic-btn.pink.disabled,
.sticky-bar,
.card .focus-btn .unfocus,
.bangumi-container,
.textarea-container .comm-tool .comm-emoji,
.emoji,
.pagination,
.userinfo-content,
.watch-later-list header .d-btn,
.tab-contain,
.card .focus-btn .focus,
.page-container,
.right-side-bar .to-comment .comment-num,
.music-container .image-area .share-img,
.music-container .text-area,
div.con,
.audiolist-list .song-list .song-li .content .text,
.audio-info-module,
.audio-list .song-list .song-li .content .text,
.multi-page .more-box,
.h5share-container .text-area,
.g-search input,
.list-create,
.wrapper .modal-body .choice-wrp .battery,
.wrapper .modal-body .choice-wrp .battery-desp input,
.be-dropdown-menu,
.small-item .cover,
.disabled-cover,
#id-card,
#page-video #submit-video-type-filter,
.be-pager-options-elevator input[type=text],
.be-pager-item,
.be-pager-next, .be-pager-prev,
.contribution-sidenav .contribution-item:hover,
.my-album .tab-list,
#page-setting #setting-new-tag,
#page-setting #setting-new-tag-btn
{
    background-color: #222 !important;
}
.back-top,
.sortable,
.nav-list,
.more-link,
.read-push,
.link-more,
.rank-item>.ri-num,
p.update>span>a,
.bili-dropdown,
.dropdown-list,
.c-clink,
a.more,
a.im-list:hover,
li.d-data:hover,
a.read-more,
ul.up-nav li:hover,
.bili-header-m .mini-wnd-nav .list li:hover,
li.suggest-item:hover,
.sub-nav li:hover,
.num-tip,
.btn.followed .b-gz,
.up-info .btn .b-cd,
.bilibili-player-danmaku-function,
.bilibili-player-danmaku-btn-time,
.bilibili-player-danmaku-btn-danmaku,
.bilibili-player-danmaku-btn-date,
.bilibili-player-danmaku-wrap,
.mCSB_draggerRail,
.bilibili-player-danmaku-btn-history,
.more-ops-list,
.app-look,
.video-toolbar .share .share-pos,
.bilibili-player-context-menu-container,
.tag-info-pane .tag-header .btn-subscribe,
.tag-info-pane .tag-header .btn-unsubscribe,
.notice-item,
.btn-box .liked,
.btn-box .like,
.btn-box .message,
.follow-btn,
.paging-box-big .tcd-number,
.paging-box-big .next,
.float-nav .nav-menu .item,
div.drag-bar,
.bpui-slider-tracker,
.bilibili-player-video-progress-buffer,
.bilibili-player-video-btn:hover,
.bilibili-player-setting-menu-wrap,
.bilibili-player-setting-menu-list,
.opera-list,
.tab-link.on,
.emoji-text:hover,
.bui-radio .bui-radio-button .bui-radio-label,
.bpui-selectmenu-list-row:hover,
.bpui-button.bpui-button-type-small,
.fontsize .selection-span,
.bilibili-player-filter-wrap.bilibili-player-block,
.recommend-list .rec-footer,
.bilibili-player-block-line:hover,
.bilibili-player-modal-btns .bpm-btn,
.bilibili-player-adv-danmaku,
.multi-page,
.video-page-card .card-box .pic-box,
.add-btn,
.collection-m .bottom .btn.disable,
a.s-btn,
.user-panel,
.tag-panel,
.section-block,
.publish-panel,
.tab-bar,
.card,
.notice-panel,
.history-btn>.btn,
.go-top
.tag-panel .more-button .more:hover,
a.more.tc-slate:hover,
.bp-popup-panel,
.comment-area,
.comment-area .comm-main .comm-list .hot-line >span,
.comment-area .comm-more a.more:hover,
.emoji:hover,
.emoji-cover.selected,
.page-controller .prev:hover,
.page-controller .next:hover,
.bg-white,
.feed-card .empty-content,
.forw-area,
.live-panel,
.paging-box-big .dian,
.feed-tag .publish-panel-container,
.go-top-m .go-top,
.right-side-bar .to-comment,
.right-side-bar .to-top,
.up-info-holder .fixed-box .rightside-article-list-btn,
.article-list-holder-block .article-list-plane,
.btn-cancel,
.n .n-inner,
#page-index .col-1,
#page-index .col-2 .section,
.wrapper .modal-header .u-info,
#page-index .album .content .album-wrapper .album-item .album-top,
.be-dropdown-item:hover,
.elec .elec-status,
.btn.default,
.col-full,
#page-dynamic .col-2 .section,
#page-channel-index .channel-option.no-channel,
#page-setting .setting-index-module,
.btn.ghost
{
    background-color: #444 !important;
}
.brief a:hover,
div.brief>a:hover,
div.all>a:hover,
.live-lr .banner a:hover,
.bui-collapse-header,
.bilibili-player-filter,
.bpui-selected span,
.bpui-selected,
.bpui-unselecting,
.bpui-selecting,
.bpui-selecting>span,
.context-menu-a:hover,
.danmaku-info-report-btn,
.danmaku-info-block-btn,
.btn-box .message:hover,
.bui-switch .bui-body,
li.context-menu-descipline a,
.bui-select .bui-select-item:hover,
.multi-page .cur-list li:hover,
.article-list-holder-block .article-list-plane .button:hover,
.btn-cancel:hover,
.btn.default:hover,
.be-switch
{
    background-color: #555 !important;
}
.btn-add span,
.bui-bar-wrap,
.bui-step-dot
{
    background-color: #aaa !important;
}
.bpui-slider-handle
{
    background-color: #eee !important;
}
.bilibili-player-video-inputbar,
#app,
.wrapper .modal-header
{
    background-image: none !important;
}
.bilibili-player-color-picker-mask,
.bilibili-player-advanced-danmaku-control-container.mask:after,
.elevator-module .nav-bg
{
    background-color: #222e !important;
}

.bili-footer a,
a.pic>p.title,
div.desc-tips,
div.r.p>div.info,
a.message,
div.desc,
.btn.followed .b-gz,
span.copyright,
.danmaku-info-row,
.bilibili-player-danmaku-btn-time,
.bilibili-player-danmaku-btn-danmaku,
.bilibili-player-danmaku-btn-date,
.bilibili-player-danmaku-date-picker-header,
.bilibili-player-danmaku-date-picker-btn,
.day-span,
.video-toolbar .ops span,
.video-toolbar .share .share-btn,
.video-toolbar,
li.tag,
.tag-info-pane .tag-footer .btn-left-box>a,
.video-desc .btn span,
li.tag>a,
.tag-info-pane .tag-header .btn-unsubscribe,
span.disabled,
.btn-box .liked,
.info .sign,
span.like span,
span.hate span,
.bb-comment .comment-list .list-item .info .plad a,
.float-nav .nav-menu .item,
div.drag-bar,
.bilibili-player-block-filter-label,
.bilibili-player-block-filter-image,
.mode .selection-span,
.recommend-list .rec-footer,
.bilibili-player-block-list-function>div,
.bilibili-player-block-line.block-state-disabled,
.bilibili-player-block-line-delete,
.bilibili-player-block-empty,
.collection-m .bottom .btn.disable,
.looked,
.history-list .r-info .w-info .name,
.history-list .r-info .w-info .pro-txt,
.history-list .l-info .lastplay-time .lastplay-t,
.tc-slate,
.more-button,
.boost-control li,
.boost-control li i,
.dynamic-list-item-wrap .item-user a.user-name,
.dynamic-list-item-wrap .item-user a.user-name.vip,
.textarea-container .comm-tool .comm-transpond,
.dynamic-list-item-wrap .info >span,
.page-controller .prev.disabled,
.page-controller .next.disabled,
.forw-area .forw-more a,
.watch-later-list header .d-btn,
.tab-list .tb-item,
.dynamic-list-item-wrap .view-more,
.comment-area .comm-main .comm-list .hot-line >span,
.up-info-block .up-info-right-block .row-2,
.up-info-block .up-info-right-block .fans-num,
.up-info-block .up-info-right-block .view-num,
blockquote,
blockquote *,
blockquote .color-blue-01,
blockquote .color-blue-02,
blockquote .color-blue-03,
blockquote .color-blue-04,
blockquote .color-gray-01,
blockquote .color-gray-02,
blockquote .color-gray-03,
blockquote .color-green-01,
blockquote .color-green-02,
blockquote .color-green-03,
blockquote .color-green-04,
blockquote .color-lblue-01,
blockquote .color-lblue-02,
blockquote .color-lblue-03,
blockquote .color-lblue-04,
blockquote .color-pink-01,
blockquote .color-pink-02,
blockquote .color-pink-03,
blockquote .color-pink-04,
blockquote .color-purple-01,
blockquote .color-purple-02,
blockquote .color-purple-03,
blockquote .color-purple-04,
blockquote .color-yellow-01,
blockquote .color-yellow-02,
blockquote .color-yellow-03,
blockquote .color-yellow-04,
.article-action .coin-btn .info-block span,
.article-action .fav-btn .info-block span,
.article-action .like-btn .info-block span,
.article-action .share-btn .info-block span,
.right-side-bar .to-comment .comment-num,
.up-info-holder .fixed-box .rightside-article-list-btn .title,
.article-list-holder-block .article-list-plane .button .title,
.article-list-holder-block .article-list-plane .button.off .label,
.multi-page .head-con .range-box .paging li,
.multi-page .more-box li,
.multi-page .head-con .range-box i,
.n .n-data .n-data-k,
.sec-empty-hint,
#page-index .channel .empty-state p,
.private-hint,
#page-index .col-2 .section .user-auth.no-auth .no-auth-title span,
.section .operation,
.i-live .i-live-unfo-btn,
.i-live .i-live-fo-count,
.elec .elec-status,
.disabled-cover,
.be-pager-item a,
.be-pager-next a, .be-pager-prev a,
.be-pager-item-jump-next,
.be-pager-item-jump-prev,
.be-pager-next,
.be-pager-prev,
.be-pager-options-elevator,
.be-pager-total,
.tabs a,
#id-card .idc-auth-description
{
    color: #aaa !important;
}
.bili-dropdown,
.dropdown-list,
a.side-link>span,
h3,
p.ri-title,
p.t,
a.name,
div.bili-tab-item,
.sortable,
.nav-name,
.more-link,
.read-push,
.link-more,
.customize,
div.r-text>.t,
.c-clink,
div.brief>a>span,
div.all>a>span,
.lf-item p,
a.more,
a.recommand-link,
a.logout,
.member-menu a,
.btns-profile span,
div.bar>div.num>div,
div.grade span,
div.lv-row>strong,
a.im-list,
.dynamic-m a,
a.read-more,
.bili-header-m .mini-wnd-nav a,
.suggest-item a,
.sub-nav span,
.v-title,
.video-title,
a.username,
.bi-btn,
.up-info .btn .b-cd,
div.info,
div.title a,
div.b-head,
div.rec-title,
.bui-collapse-arrow,
.bilibili-player-filter-title,
.bilibili-player-filter-menu,
.danmaku-info-report-btn,
.danmaku-info-block-btn,
.danmaku-info-danmaku,
.bilibili-player-danmaku-btn-history,
.day-span.day-enable,
.more-ops-list,
.app-look,
.video-toolbar .share .share-pos .share-address ul li input,
.context-menu-a,
form.ipt>input,
.tag-title>a,
.tag-info-pane .text,
.tag-info-pane .tag-header .btn-subscribe,
.tag-info-pane .btn-right-box a,
.bangumi-info-module .v-preview .title,
.bb-comment .reply-notice .notice-item a,
.bb-comment .comment-header .tabs-order li,
.result,
.tcd-number,
.next,
.info .social a,
.btn-box .like,
textarea,
.comment-emoji,
p.text,
.bb-comment .hot-line span,
.page-jump>input,
.follow-btn,
.paging-box-big .tcd-number,
.paging-box-big .next,
.bilibili-player-video-btn:hover,
.bilibili-player-video-danmaku-input,
.bilibili-player-video-btn:hover .bilibili-player-iconfont,
.bilibili-player-video-progress-detail-time,
.bpui-selectmenu-list-row,
.bilibili-player-video-time-seek,
.bilibili-player-setting-menu-list,
.opera-list,
.emoji-text,
.bilibili-player-video-btn-setting-panel-playtype-title,
.bui-radio-label .bui-radio-text,
.bui-checkbox-name,
.bilibili-player-video-danmaku-setting-left-block-title,
.bilibili-player-video-danmaku-setting-left-more-text,
.bilibili-player-video-danmaku-setting-right,
.bilibili-player-video-danmaku-setting-right-more,
.bpui-button.bpui-button-type-small,
.bilibili-player-video-danmaku-setting-left-area-title,
.bilibili-player-video-danmaku-setting-left-block-title,
.bilibili-player-video-danmaku-setting-left-fontsize-title,
.bilibili-player-video-danmaku-setting-left-opacity-title,
.bilibili-player-video-danmaku-setting-left-speedplus-title,
.row-title,
.fontsize .selection-span,
.bilibili-player-color-picker-color-code,
.bilibili-player-block-label,
.text-con,
.bilibili-player-block-string-short,
.bilibili-player-block-tabpanel-row .bilibili-player-block-type-keyword,
.bilibili-player-block-tabpanel-row .bilibili-player-block-type-regex,
.bilibili-player-block-tabpanel-row .bilibili-player-block-type-user,
.bilibili-player-block-line,
.bilibili-player-modal-title,
.bilibili-player-modal-info,
.bilibili-player-modal-btns .bpm-btn,
.advanced-danmaku-group .content-span,
.bui-input-input,
.bui-select .bui-select-border,
.advanced-danmaku-group .adv-danmaku-pos-row .pos-span,
.advanced-danmaku-group .adv-danmaku-pos-row .axias-span,
.advanced-danmaku-group .adv-danmaku-btn-span,
.bui-input-wrap-disabled,
a.router-link-active,
a.router-link-exact-active,
.multi-page .cur-list li:hover,
.collection-m .title,
.content .group-list li,
.content .group-list li label .count,
.add-btn,
.coin-operated-m .coin-title,
.follow-dialog-window .title,
.watch-later-list header .t,
.watch-later-list .list-box .av-item .av-about .t,
a.s-btn,
span.key,
form.searchform:hover input,
.tc-black,
.history-wrap  .b-head .b-head-t,
.history-btn>.btn,
.history-list .r-info .title,
.history-list .r-info .w-info .username,
.user-name a,
.content,
.video-container .text-area .title,
.sticky-bar .bar-content .title,
.home-page .sticky-bar .bar-content .message,
.bp-popup-panel .title-ctnr .popup-title,
.comment-area .comm-main .comm-tabs >ul >li,
.card .focus-btn .unfocus .unfocus-text,
.bangumi-container .text-area .title,
.emoji-box .title,
.emoji,
.emoji-cover.selected,
.emoji-cover,
.page-controller .prev,
.page-controller .next,
.dynamic-list-item-wrap .item-detail .text,
.userinfo-content,
.tc-dark-slate,
.article-container .text-area .title,
.paging-box-big .dian,
.feed-tag .separater-line,
.nav-tab-bar .tab-item span,
a.up-name,
.up-info-holder .fixed-box .more .top-bar,
.up-info-holder .fixed-box .more .help .title,
.up-info-holder .fixed-box .more .link .title,
.title-container .title,
.article-holder,
.article-holder .color-default,
.article-holder h1,
.article-action .coin-btn .info-block label,
.article-action .fav-btn .info-block label,
.article-action .like-btn .info-block label,
.article-action .share-btn .info-block label,
.up-info-holder .fixed-box .rightside-article-list-btn .label,
.up-info-holder .fixed-box .up-article-list-block .block-title,
.article-list-holder-block .article-list-plane .button .label,
.article-holder .video-holder .title,
div.con>div.txt,
.btn-cancel,
div.con header,
.audiolist-list .song-list .song-li .content .text a,
.audio-list .song-list .song-li .content .text,
.audio-list .song-list .song-li .content .text a,
.n .n-btn,
.n .n-data .n-data-v,
.g-search input,
.i-pin-v .be-tab-item,
.list-create .text,
.large-item .title,
.user-auth.no-auth .no-auth-title .goto-auth,
.i-m-title,
.i-m-btn,
.user .info .meta .item,
.wrapper .modal-header .title,
.wrapper .modal-body .choice-wrp .battery-desp,
.wrapper .modal-body .choice-wrp .battery-desp input,
.wrapper .elec-main-title,
.wrapper .elec-sub-title,
.paging-box .current,
.paging-box .dian,
.paging-box .next,
.paging-box .prev,
.paging-box .tcd-number,
.multi-page .cur-list li a,
#page-index .channel.guest .channel-item .channel-title .channel-name,
.small-item.disabled .title,
#page-index .album .content .album-wrapper .album-item .album-title,
#page-index .col-2 .section .user-auth .auth-description,
.elec .elec-monthly-c,
.elec .elec-count,
.be-dropdown-item,
#id-card .idc-uname,
#id-card .idc-meta-item,
.btn.default,
.contribution-sidenav,
.breadcrumb .item.cur,
.be-tab-item,
#page-video #submit-video-type-filter a,
.be-pager-options-elevator input[type=text],
#page-article .row .breadcrumb .item,
.my-album .title,
.my-album .tab-list .tab .name,
#page-channel-index .channel-option.no-channel p,
#page-channel-index .channel-item .channel-name,
#page-setting .setting-privacy-item .setting-privacy-name,
#page-setting #setting-new-tag,
.btn.ghost
{
    color: #eee !important;
}
.bilibili-player.mode-fullscreen .bilibili-player-area .bilibili-player-video-btn-widescreen,
.bilibili-player.mode-fullscreen .bilibili-player-area .bilibili-player-video-btn-widescreen .bilibili-player-iconfont
{
    color: #99a2aa !important;
}
.nav-tab-bar .tab-item.on span
{
    color: #00a1d6 !important
}

li.tag,
form.ipt,
.bilibili-player-color-picker-color-code,
.history-list .l-info .lastplay-time .history-red-round,
.history-list .l-info,
.up-info-holder .fixed-box .more .top-bar,
.tag-container .tag-item .tag-content,
.up-info-holder .fixed-box .rightside-article-list-btn .label,
.up-info-holder .fixed-box .up-article-list-block .block-title
{
    border-color: #aaa !important;
}
div.dd-bubble,
ul.bilibili-suggest,
.video-info-module,
.bilibili-player-danmaku-date-picker-container,
.video-toolbar .share .share-pos .share-address ul li input,
.bangumi-info-module,
.user-card-m,
.bilibili-player-video-control,
.bilibili-player-video-inputbar,
.bilibili-player-video-volumebar-wrp,
.bpui-selectmenu-list,
.user-card,
.face,
.emoji-box,
.bilibili-player-video-btn-setting-panel,
.bilibili-player-video-danmaku-setting-box,
.bilibili-player-mode-selection-container,
.bilibili-player-color-picker-container,
.bilibili-player-block-string-short,
.bilibili-player-modal-container,
.video-container,
.article-container,
.card .focus-btn .unfocus,
.textarea-container .comm-tool .comm-emoji,
.watch-later-list header .d-btn,
.card .focus-btn .focus,
.slim-border:after,
.music-container,
.audio-info-module,
.multi-page .more-box,
.h5share-container,
#id-card .idc-avatar,
.be-pager-options-elevator input[type=text],
#page-setting #setting-new-tag,
#page-setting #setting-new-tag-btn
{
    border-color: #222 !important;
}
.nav-list,
.customize,
#primary_menu,
.bili-tab,
.bili-tab-item,
.bili-dropdown,
.dropdown-list,
.member-menu,
div.bar>div.num,
.dynamic-m,
.day-span,
.danmaku-info-report-btn,
.danmaku-info-block-btn,
.comment-header,
.bilibili-player-video-time-seek,
.pl__card,
.advanced-danmaku-group,
.add-btn,
.looked,
.history-wrap  .time-label:before,
.comment-area .comm-main .comm-tabs,
.dynamic-list-item-wrap,
.comment-area .comm-more,
.forw-area .forw-more,
.userinfo-wrapper,
.btn-box .message:hover,
.article-action,
#article-list-btn .label,
#article-list-btn .title,
.btn-cancel,
.song-list .song-li .content .num,
.multi-page .head-con .range-box .paging li,
.multi-page .more-box li,
.g-search input,
.i-m-upload,
.i-m-r2,
#page-index .col-2 .section-title,
.user .info .meta .row,
#page-index .fav-covers,
.section .operation,
.i-live .i-live-unfo-btn,
.i-live .i-live-fo-count,
.be-dropdown-menu,
.btn.default,
.be-pager-item,
.be-pager-next, .be-pager-prev,
#page-subs .mini-item,
#page-setting .setting-index-container,
#page-setting .setting-index-module,
.btn.ghost,
.be-dropdown-item.be-dropdown-item-delimiter
{
    border-color: transparent !important;
}
.back-top,
.more-link,
.read-push,
.link-more,
.c-clink,
ul.boston-postcards>li,
.lf-list,
a.more,
a.read-more,
.live-field.fl,
.square-field,
.v-preview,
.v-data,
.btn.followed .b-gz,
.up-info .btn .b-cd,
#arc_toolbar_report,
#v_desc,
.more-ops-list,
.app-look,
.video-toolbar .share .share-pos,
.bilibili-player-context-menu-container,
.notice-item,
.btn-box .liked,
.btn-box .like,
.btn-box .message,
.paging-box-big .tcd-number,
.paging-box-big .next,
div.con,
.float-nav .nav-menu .item,
textarea,
.comment-emoji,
.bb-comment .hot-line,
.page-jump>input,
.bilibili-player-setting-menu-wrap,
.opera-list,
.bilibili-player-video-danmaku-setting-right-separator,
.bui-select .bui-select-border,
.bpui-button.bpui-button-type-small,
.danmaku-wrap .bilibili-player-block-wrap,
.bilibili-player-block-string-short-btn,
.bilibili-player-modal-btns .bpm-btn,
.bilibili-player-adv-danmaku,
.bui-input-stepper,
.bui-input-input,
.bui-input .bui-input-stepper-up,
.bui-input-wrap-disabled,
.bilibili-player-modal-header,
.collection-m .title,
.collection-m .bottom,
.follow-dialog-window .title,
.follow-dialog-window .bottom,
.watch-later-list .list-box .av-item .av-about,
a.s-btn,
.history-btn>.btn,
.history-list .r-info .r-txt,
.history-list .r-info .w-info .username,
.go-top,
.btn-box .like,
.paging-box-big .dian,
.right-side-bar .to-comment,
.right-side-bar .to-top,
.right-side-bar .to-comment .comment-num,
.up-info-holder .fixed-box .rightside-article-list-btn,
.article-list-holder-block .article-list-plane,
div.con header,
#page-index .col-1,
.i-pin-v .be-tab,
.section,
.list-create,
#page-index .col-2 .section,
#page-index .col-2 .section:last-child,
.wrapper .modal-header .u-info,
.wrapper .modal-body .choice-wrp .battery,
.wrapper .modal-body .choice-wrp .battery-desp input,
.wrapper .modal-body .elec-protocol .checkbox,
.elec .elec-avatar,
.contribution-sidenav~.main-content,
.contribution-sidenav,
#page-myalbum .album-content
{
    border-color: #444 !important
}
li.history,
li.history:hover,
li.timeline,
li.timeline:hover,
.b-line,
.b-line:hover,
.bilibili-player-danmaku-date-picker-header,
.video-toolbar .share .share-pos .box-b,
.btn-right-box
{
    border-color: #99a2aa !important;
}

p.ri-title,
.read-push,
.link-more,
.dropdown-item,
.more-link,
.member-menu a,
a.logout,
a.im-list,
.bili-header-m .mini-wnd-nav a,
.video-desc .btn span,
li.tag,
.history-btn>.btn,
.elevator-module .nav-list .item
{
    transition: all .2s !important;
}

.more-link>.icon,
.read-push>.icon,
.link-more>.icon,
.bili-dropdown>.icon,
.home>a,
.c-clink>.icon,
a.more>.b-icon,
.member-menu i,
a.read-more>.b-icon,
form.ipt>a,
.tag-info-pane .btn-right-box a i,
.icon-notice,
.icon-close-notice,
i.face,
img[src$='0a399ff.png@22w_22h.webp'],
i.btn-del,
.up-info-holder .fixed-box .rightside-article-list-btn .icon-list,
.list-create:hover .icon,
.i-m-ra,
.i-m-u-icon,
.i-live-icon,
.i-live-arrow,
.i-m-v-icon
{
    filter: grayscale(100) brightness(100) saturate(0) !important;
}
ul.up-nav li
{
    filter: grayscale(1) brightness(1.3) !important;
}
#page-index .col-1 .section .more,
.elec .elec-status,
.elec .elec-status-bg,
.small-item .cover
{
    background-image: none !important;
}
.dropdown-item,
.bilibili-player-block-tabpanel-row.bilibili-player-border,
.g-search input
{
    border-radius: 4px !important;
}
.back-top:hover,
.go-top:hover
{
    background-position: -713px -72px !important;
}
.list-create:hover .icon
{
    background-position: -716px -332px !important;
}
.multi-page .cur-list ul
{
    max-height: none !important;
}
div.live-box,
div.box,
div.im-list-box,
.dynamic-m,
.bpui-slider-handle,
.bpui-selectmenu-list,
.sticky-bar .bar-content .send-button,
.article-container:hover .text-area,
.music-container:hover .text-area,
.h5share-container:hover .text-area,
.n .n-inner,
.large-item .cover img,
.mini-item .cover img,
.i-pin-c,
.elec .elec-trigger,
.col-full
{
    box-shadow: none !important;
}
div.i-frame,
div.dd-bubble,
div.desc-tips,
ul.up-nav,
ul.bilibili-suggest,
.video-info-module,
.bilibili-player-context-menu-container,
.tag-info-pane,
.bangumi-info-module,
.user-card-m,
div.drag-bar,
#bofqi.mini-player:before,
.user-card,
.emoji-box,
.userinfo-wrapper,
.audio-info-module
{
    box-shadow: 0px 1px 20px 2px ${settings.customStyleColor}30 !important;
}
.sticky-bar
{
    box-shadow: 0px 1px 10px 0 #0003 !important;
}
.bilibili-player-context-menu-container
{
    text-shadow: none !important;
}
div.desc-tips>span.arrow-left,
.bb-comment .comment-header .tabs-order li.on:after,
.emoji-box:before,
.up-info-holder .fixed-box .more .link .icon,
.up-info-holder .fixed-box .more .help .icon,
.g-search .search-btn,
.wrapper .elec-message-wrp .elec-triangle
{
    display: none !important;
}
.article-action i.animation
{
    opacity: 0 !important;
}
.bilibili-player-video-progress-buffer-range
{
    opacity: 0.5 !important;
}
.bilibili-player-block-label,
.advanced-danmaku-group .content-span
{
    font-weight: 400 !important;
}
.bilibili-player-video-progress-detail-sign-down
{
    border-top-color: ${settings.customStyleColor} !important;
}
.bilibili-player-video-progress-detail-sign-up
{
    border-bottom-color: ${settings.customStyleColor} !important;
}
.bilibili-player-video-control
{
    border-bottom-color: #333 !important;
}
.coin-operated-m .mc-box
{
    border: 2px dashed #444 !important;
    background-color: #fff !important;
}
.coin-operated-m .mc-box.on
{
    border-style: solid !important;
}
.go-top-m .go-top
{
    border: none !important;
}
.music-container .image-area .icon
{
    filter: brightness(0) !important;
}
.g-search input
{
    padding: 0 8px !important;
}

.c-clink:hover,
.bili-tab-item.on,
.read-push:hover,
.link-more:hover,
.more-link:hover,
a.read-more:hover,
a.more:hover,
.up-info .btn .b-cd:hover,
.bi-btn,
.day-span.day-enable.active,
li.tag:hover,
.bb-comment .comment-header .tabs-order li.on,
textarea:focus,
.comment-submit,
.page-jump>input:focus,
.paging-box-big .current,
.paging-box-big .tcd-number:hover,
.paging-box-big .next:hover,
.float-nav .nav-menu .item:hover,
.bilibili-player-video-btn-send,
.bpui-button.bpui-button-type-small:hover,
.bilibili-player-block-tabpanel-row.active-1 .bilibili-player-block-type-keyword,
.bilibili-player-block-tabpanel-row.active-2 .bilibili-player-block-type-regex,
.bilibili-player-block-tabpanel-row.active-3 .bilibili-player-block-type-user,
.coin-operated-m .mc-box.on
.coin-operated-m .mc-box:hover,
a.s-btn:hover,
.history-btn>.btn:hover,
.history-wrap .time-label,
.history-wrap .active:before,
.history-wrap .time-label:after,
.go-top,
.tag-panel .more-button .more:hover::after,
.comment-area .comm-main .comm-tabs >ul >li.active,
.up-info .up-focus-btn,
.card .focus-btn .unfocus:hover,
.btn-box .like:hover,
.live-panel .more-button .more:hover::after,
.coin-operated-m .mc-box.on,
.tab-list .tb-item.active,
.up-info-holder .fixed-box .follow-btn-holder .follow-btn,
.up-info-holder .fixed-box .follow-btn-holder .follow-btn:hover,
.right-side-bar .to-comment:hover,
.right-side-bar .to-top:hover,
.btn-submit,
.elevator-module .nav-list .item.on,
.elevator-module .nav-list .item:hover,
.elevator-module .back-top:hover,
.multi-page .more-box li.on,
input[type=text]:focus,
.be-tab-cursor,
.be-tab-cursor:after,
.list-create:hover,
.btn.primary,
.wrapper .modal-body .choice-wrp.selected .elec-input,
.wrapper .modal-body .choice-wrp.selected .battery,
.be-pager-item-active
{
    border-color: ${settings.customStyleColor} !important;
}
.num-wrap>span,
.rank-item.highlight>.ri-num,
p.on>span>a,
.c-clink:hover,
.sortable:hover,
.read-push:hover,
.link-more:hover,
.dropdown-item:hover,
.more-link:hover,
a.more:hover,
.dynamic-m .dyn_menu .line,
a.read-more:hover,
.bi-btn,
.up-info .btn .b-cd:hover,
.danmaku-info-report-btn:hover,
.danmaku-info-block-btn:hover,
.more-ops-list li:hover,
.video-toolbar .share .share-pos .share-address ul li .btn,
.btn-add:hover span,
.tag-info-pane .tag-header .btn-subscribe:hover,
.tag-info-pane .tag-footer .btn-left-box>a:hover,
.btn-box .like:hover,
.comment-submit,
span.reply:hover,
.bb-comment .hot-line a:hover,
.follow-btn,
.paging-box-big .tcd-number:hover,
.paging-box-big .current,
.paging-box-big .next:hover,
a.btn-more:hover,
.float-nav .nav-menu .item:hover,
.bilibili-player-video-progress-buffer-range,
.bpui-slider-progress,
.bilibili-player-video-btn-send,
.bilibili-player-setting-menu-list:hover,
.opera-list li:hover,
.bui-radio-input:checked+.bui-radio-label,
.bui-thumb-dot,
.bui-bar,
.bpui-button.bpui-button-type-small:hover,
.fontsize .selection-span.active,
.bui-switch .bui-checkbox:checked+.bui-body,
.bilibili-player-block-string-short-btn,
.advanced-danmaku-group .adv-danmaku-btn-span:hover,
a.s-btn:hover,
.history-btn>.btn:hover,
.history-wrap .time-label.active,
.history-list .cover-contain .progress,
.tab-bar .line,
.go-top:hover,
.dynamic-btn.pink,
.sticky-bar .bar-content .send-button,
.textarea-container .comm-tool .comm-submit,
.new-notice-bar,
.card .focus-btn .unfocus:hover,
.right-side-bar .to-comment:hover,
.right-side-bar .to-top:hover,
.btn-submit,
.elevator-module .nav-list .item.on,
.elevator-module .nav-list .item:hover,
.elevator-module .back-top:hover,
.multi-page .more-box li.on,
.n .n-cursor,
.btn.primary,
.elec .elec-trigger,
.contribution-sidenav .contribution-item.cur,
.be-pager-item-active,
#page-channel-index .channel-option.no-channel .create-channel,
.be-switch-container.is-checked .be-switch,
#page-setting #setting-new-tag-btn
{
    background-color: ${settings.customStyleColor} !important;
}
p.t:hover,
p.ri-title:hover,
div.r-text>.t:hover,
a.name:hover,
div.bili-tab-item:hover,
ul.nav-menu>li:hover,
div.spread-module:hover,
.bili-tab-item.on,
.bili-footer a:hover,
a.pic>p.title:hover,
a.bbs,
div.brief>a>span:hover,
div.all>a>span:hover,
.live-box .title,
.bili-header-m .bubble-traditional .recommand .title,
a.help-link,
.member-menu a:hover,
a.logout:hover,
a.im-list:hover,
.dynamic-m .dyn_menu li.on,
div.info>a,
.bili-header-m .mini-wnd-nav a:hover,
.bilibili-player-danmaku-btn-history.bpui-state-hover,
.day-span.day-enable.active,
.day-span.day-enable:hover,
.video-toolbar .ops span:hover,
.video-toolbar .ops .app .app-look .foot-txt a,
.video-toolbar .ops span.on,
li.tag>a:hover,
.video-desc .btn span:hover,
.tag-info-pane .tag-header .btn-unsubscribe:hover,
div.title a:hover,
span.current,
a.tcd-number:hover,
.bb-comment .comment-header .tabs-order li:hover,
.bb-comment .comment-header .tabs-order li.on,
.bb-comment .comment-list .list-item .info .plad a:hover,
a.more-hot,
a.btn-more,
.bilibili-player-video-hint>a:hover,
.bpui-selectmenu-list-row[data-selected],
.bui-checkbox:hover .bui-checkbox-name,
.bilibili-player-block-filter-type.disabled .bilibili-player-block-filter-label,
.bilibili-player-block-filter-type:hover .bilibili-player-block-filter-label,
.bilibili-player-block-filter-type.disabled .bp-icon,
.bilibili-player-block-filter-type:hover .bp-icon,
.bilibili-player-video-danmaku-setting-left-more:hover .bilibili-player-video-danmaku-setting-left-more-text,
.bilibili-player-video-danmaku-setting-left-more:hover,
.bilibili-player-video-danmaku-setting-left-more:hover i,
.bilibili-player-video-danmaku-setting-right-more:hover,
.bilibili-player-video-danmaku-setting-right-more:hover i,
.mode .selection-span.active,
.mode .selection-span:hover,
.bilibili-player-block-tabpanel-row.active-1 .bilibili-player-block-type-keyword,
.bilibili-player-block-tabpanel-row.active-2 .bilibili-player-block-type-regex,
.bilibili-player-block-tabpanel-row.active-3 .bilibili-player-block-type-user,
.bilibili-player-block-line-state,
.bilibili-player-block-line-delete:hover,
.bilibili-player-block-tabpanel-row>div:hover,
.multi-page .cur-list li.on i,
.collection-m .content .group-list li:hover,
.coin-operated-m .coin-title span,
.follow-dialog-window .content .info .uname,
.watch-later-list .list-box .av-item .av-about .t:hover,
.tc-blue,
.history-list .r-info .title:hover,
.history-list .r-info .w-info .username:hover,
.history-wrap .time-label,
.user-name:hover,
.time .detail-link:hover,
.more-button:hover,
.boost-control li:hover,
.boost-control li:hover i,
.tab-text:hover,
.tab-text.selected,
.tag-panel .tag-list a,
.box-toggle:hover,
.box-toggle:focus,
.box-toggle.active,
.expand-btn,
.dynamic-link-hover-bg,
.tag-panel .more-button .more:hover,
.sticky-bar .bar-content .title:hover,
.home-page .sticky-bar .bar-content .message:hover,
.comment-area .comm-main .comm-tabs >ul >li.active,
.comment-area .comm-more a.more:hover,
.bangumi-container .text-area .title:hover,
.tc-blue-hover,
.live-panel .more-button .more:hover,
a.up-name:hover,
.up-info-holder .fixed-box .more .help .title:hover,
.up-info-holder .fixed-box .more .link .title:hover,
.song-list .song-li:hover .content .text a,
.multi-page .head-con .range-box .paging li.on,
.multi-page .head-con .range-box i:hover,
.multi-page .more-box li:hover,
.n .n-btn:hover,
.n .n-fs:hover p,
.n .n-gz:hover p,
.be-tab-item.is-active,
.sec-empty-hint a,
.large-item .title:hover,
.small-item .title:hover,
.i-m-title:hover,
.i-live .i-live-link:hover,
.wrapper .modal-header .u-name,
.wrapper .modal-body .choice-wrp.selected .battery-desp,
.wrapper .elec-sub-title .up-name,
.bb-comment a,
.multi-page .cur-list li a:hover,
.section-title .t:hover,
.section .operation:hover,
#page-index .channel.guest .channel-item .channel-title .channel-name:hover,
.small-item.disabled .title:hover,
#page-index .album .content .album-wrapper .album-item .album-title:hover,
.i-live .i-live-off-guest a,
#id-card .idc-uname:hover,
.breadcrumb .item:hover,
#page-video #submit-video-type-filter a.active,
.be-pager-item:hover a,
.be-pager-next:hover a, .be-pager-prev:hover a,
.contribution-sidenav .contribution-item a:hover,
.my-album .tab-list .tab.active .name,
.album-card .title:hover,
.tabs a:hover,
#page-subs .detail a:hover,
#page-subs .action .sub-action,
#page-channel-index .no-channel-container em
{
    color: ${settings.customStyleColor} !important;
}
.sortable:hover,
.read-push:hover,
.link-more:hover,
.num-wrap>span,
.dropdown-item:hover,
.more-link:hover,
a.more:hover,
.dynamic-m .dyn_menu li,
.bili-header-m .mini-wnd-nav a:hover,
.up-info .btn .b-cd:hover,
.danmaku-info-report-btn:hover,
.danmaku-info-block-btn:hover,
.more-ops-list li:hover,
.tag-info-pane .tag-header .btn-subscribe:hover,
.tag-info-pane .tag-footer .btn-left-box>a:hover,
.btn-box .like:hover,
.comment-submit,
span.reply:hover,
.bb-comment .hot-line a:hover,
.follow-btn,
.paging-box-big .tcd-number:hover,
.paging-box-big .next:hover,
.paging-box-big .current,
a.btn-more:hover,
.float-nav .nav-menu .item:hover,
.bilibili-player-video-btn-send,
.bilibili-player-setting-menu-list:hover,
.opera-list li:hover,
.bui-radio-input:checked+.bui-radio-label .bui-radio-text,
.bpui-button.bpui-button-type-small:hover,
.fontsize .selection-span.active,
.bilibili-player-block-string-short-btn,
.advanced-danmaku-group .adv-danmaku-btn-span:hover,
a.s-btn:hover,
.history-btn>.btn:hover,
.history-wrap .time-label.active,
.dynamic-btn.pink,
.sticky-bar .bar-content .send-button,
.up-info .up-focus-btn,
.textarea-container .comm-tool .comm-submit,
.new-notice-bar .message,
.card .focus-btn .unfocus .unfocus-text:hover,
.article-container:hover .text-area .title,
.tab-list .tb-item.active,
.btn-submit,
.multi-page .more-box li.on,
.btn.primary,
.contribution-item.cur a,
.be-pager-item-active a,
.contribution-sidenav .contribution-item.cur .text:hover,
.be-pager-item.be-pager-item-active:hover a
{
    color: ${foreground} !important;
}
.bui-checkbox .bui-checkbox-input:checked+.bui-checkbox-label .bui-checkbox-icon svg,
.bui-checkbox:hover .bui-checkbox-icon svg
{
    fill: ${settings.customStyleColor} !important;
}

.history-wrap .active:before,
.history-wrap .time-label:after,
.history-list .l-info .lastplay-time .history-red-round
{
    border-top-color: transparent !important;
    border-bottom-color: transparent !important;
}
.tag-panel .more-button .more::after
.tag-panel .more-button .more:hover::after
{
    border-top-color: transparent !important;
    border-right-color: transparent !important;
}
.bili-tab-item:before,
.dynamic-m .dyn_menu .line:before,
.be-tab-cursor:after
{
    border-color: ${settings.customStyleColor} !important;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
}

.multi-page .cur-list ul::-webkit-scrollbar-track {
    background: #444 !important;
}

.multi-page .cur-list ul::-webkit-scrollbar-thumb {
    background: #222 !important;
}

.multi-page .cur-list ul::-webkit-scrollbar-thumb:hover {
    background: #333 !important;
}

::-webkit-scrollbar-thumb,
::-webkit-resizer
{
    background: #444 !important;
}
::-webkit-scrollbar-thumb:hover
{
    background: #555 !important;
}
                </style>`;
                    $("#bilibili-new-style-dark").remove();
                    $("body").after(darkStyles);
                }
            };
            const updateStyleColor = () =>
            {
                const foreground = getForeground();
                const navbar = document.getElementsByClassName("bili-wrapper")[0];
                let useFlexStyles = false;
                if (navbar instanceof Element)
                {
                    useFlexStyles = parseInt(window.getComputedStyle(navbar).height) === 50;
                }
                let styles = "";
                if (useFlexStyles)
                {
                    styles = `<style id='bilibili-new-style'>
.bili-wrapper
{
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    height: 50px !important;

}
.bili-header-m>.nav-menu
{
    background: rgb(0, 86, 177) !important;
    box-shadow: rgba(17, 81, 150, 0.48) 0px 2px 10px 1px !important;

    background: ${settings.customStyleColor}ff !important;
    box-shadow: ${settings.customStyleColor}70 0px 2px 10px 1px !important;
}
div.stardust-player
{
    background: #fff !important;
}
div.player
{
    /*width: 835.5px !important;*/
}
.nav-mask
{
    background-color: transparent !important;
    box-shadow: none !important;
}

.nav-con
{
    flex-grow: 10 !important;
    flex-shrink: 0 !important;
}

.nav-con.fl
{
    margin-left: -2em !important;
}

.bili-header-m .nav-menu .nav-con .nav-item .t
{
    color: #effbff !important;

    color: ${foreground}d !important;
}

li.nav-item:hover
{
    background-color: hsla(0,0%,${foreground === "#000" ? "100" : "0"}%,.2) !important;
}

li.nav-item.home:hover
{
    background: transparent !important;
}

.vip-m
{
    background: white !important;
}

a.t>i.bili-icon-logo,
a.t>i.bili-icon
{
    filter: grayscale(100) brightness(${foreground === "#000" ? "0" : "100"}) saturate(0) !important;
    width: 50px !important;
    left: -60px !important;
    top: 0px !important;
    height: 50px !important;
    opacity: 0.81 !important;
    background-position-y: 12px !important;
}

#entryOld,
.nav-search-submit,
.b-icon-app,
.title-icon
{
    display: none !important;
}

.i-face>.face
{
    border: 1.5px solid #fff !important;
    border: 1.5px solid #fff3 !important;
    margin-top: -1px !important;
}
div.up-load
{
    margin-left: 9px !important;
    height: 32px !important;
    order: 4 !important;
    flex-grow: 0;
    flex-shrink: 0;
}
.u-link
{
    background-image: none !important;
    background-color: #D5E3F2 !important;
    border: 1px solid #effbff !important;
    color: #effbff !important;

    background: transparent !important;
    color: ${foreground}d !important;
    border-radius: 4px !important;
    line-height: 30px !important;
    height: 30px !important;
    border: 1px solid ${foreground}b !important;
    transition: background-color .2s !important;
}

.u-link:hover
{
    opacity: 1 !important;
    background-color: hsla(0,0%,${foreground === "#000" ? "100" : "0"}%,.2) !important;
}

.nav-search
{
    width: 130px !important;
}

.nav-search-keyword
{
    width: 120px !important;
}

#nav_searchform
{
    background-image: none !important;
    background-color: #D5E3F2 !important;

    margin-top: 0.1rem !important;
    border-radius: 4px !important;
    background: #fffb !important;
    border: none !important;
    transition: background-color .2s !important;
    box-shadow: 0px 2px 10px 1px #0002;
}

#nav_searchform:hover
{
    background-color: #fff !important;
}

#bilibiliPlayer
{
    box-shadow: 0px 10px 30px 5px #D0E4EC !important;

    box-shadow: 0px 10px 30px 5px ${settings.customStyleColor}40 !important;
}

.blur-bg
{
    opacity: ${settings.blurBackgroundOpacity} !important;
    filter: blur(20px) !important;
}

.cancel
{
    width: 28px !important;
}

ul.bilibili-suggest
{
    margin-left: -35px !important;
    width: 200px !important;
}

li.suggest-item>a
{
    max-width: 155px !important;
}

div.num
{
    border: 1px solid #fff8 !important;
}

#primary_menu,
#primary_menu>ul.nav-menu
{
    display: flex !important;
    align-items: center !important;
}

/*li.home>a.t,*/
div.nav-gif,
#primary_menu
{
    padding: 0 !important;
}

/*li.home>a.t
{
    font-size: 0 !important;
}*/

@media only screen and (min-width: 1291px)
{
    .nav-con
    {
        margin: 0 1em !important;
    }

    .bilibili-suggest.nav,
    .nav-search
    {
        width: 250px !important;
    }

    .nav-search-keyword
    {
        width: 240px !important;
    }

    ul.bilibili-suggest
    {
        margin-left: 0px !important;
        width: 250px !important;
    }

    li.suggest-item>a
    {
        max-width: 205px !important;
    }
}

::-webkit-scrollbar
{
    width: 5px !important;
    height: 5px !important;
}
::-webkit-scrollbar-corner,
::-webkit-scrollbar-track
{
    background: transparent !important;
}
::-webkit-resizer,
::-webkit-scrollbar-thumb
{
    background: #aaa !important;
}
::-webkit-scrollbar-thumb:hover
{
    background: #888 !important;
}
                </style>`;
                }
                else
                {
                    styles = `<style id='bilibili-new-style'>
.bili-header-m>.nav-menu
{
    background: rgb(0, 86, 177) !important;
    box-shadow: rgba(17, 81, 150, 0.48) 0px 2px 10px 1px !important;

    background: ${settings.customStyleColor}ff !important;
    box-shadow: ${settings.customStyleColor}70 0px 2px 10px 1px !important;
}

.nav-mask
{
    background-color: transparent !important;
    box-shadow: none !important;
}

.bili-header-m .nav-menu .nav-con .nav-item .t
{
    color: #effbff !important;

    color: ${foreground}d !important;
}

li.nav-item:hover
{
    background-color: hsla(0,0%,${foreground === "#000" ? "100" : "0"}%,.2) !important;
}

.vip-m
{
    background: white !important;
}

a.t>i.bili-icon
{
    filter: grayscale(100) brightness(${foreground === "#000" ? "0" : "100"}) saturate(0) !important;
    background-image: url(https://www.bilibili.com/favicon.ico) !important;
    background-size: cover !important;
    background-position: inherit !important;
    width: 16px !important;
    height: 16px !important;
    opacity: 0.81 !important;
}

#entryOld,
.nav-search-submit,
.b-icon-app,
.title-icon
{
    display: none !important;
}

.i-face>.face
{
    border: 1.5px solid #fff !important;
    border: 1.5px solid #fff3 !important;
    margin-top: -1px !important;
}

div.up-load
{
    margin: 5px 0 0 5px !important;
    height: 32px !important;
}
.u-link
{
    background-image: none !important;
    background-color: #D5E3F2 !important;
    border: 1px solid #effbff !important;
    color: #effbff !important;

    background: transparent !important;
    color: ${foreground}d !important;
    border-radius: 4px !important;
    line-height: 30px !important;
    height: 30px !important;
    border: 1px solid ${foreground}b !important;
    transition: background-color .2s !important;
}

.u-link:hover
{
    opacity: 1 !important;
    background-color: hsla(0,0%,${foreground === "#000" ? "100" : "0"}%,.2) !important;
}

.nav-search
{
    width: 140px !important;
}

.nav-search-keyword
{
    width: 130px !important;
}

#nav_searchform
{
    background-image: none !important;
    background-color: #D5E3F2 !important;

    margin-top: 0.1rem !important;
    border-radius: 4px !important;
    background: #fffb !important;
    border: none !important;
    transition: background-color .2s !important;
    box-shadow: 0px 2px 10px 1px #0002;
}

#nav_searchform:hover
{
    background-color: #fff !important;
}

#bilibiliPlayer
{
    box-shadow: 0px 10px 30px 5px #D0E4EC !important;

    box-shadow: 0px 10px 30px 5px ${settings.customStyleColor}40 !important;
}

.blur-bg
{
    opacity: ${settings.blurBackgroundOpacity} !important;
    filter: blur(20px) !important;
}

.cancel
{
    width: 28px !important;
}

ul.bilibili-suggest
{
    margin-left: -30px !important;
    width: 200px !important;
}

li.suggest-item>a
{
    max-width: 155px !important;
}

div.num
{
    border: 1px solid #fff8 !important;
}

#primary_menu,
#primary_menu>ul.nav-menu
{
    display: flex !important;
    align-items: center !important;
}

div.nav-gif,
#primary_menu
{
    padding: 0 !important;
}

.up-nav
{
    top: 37px !important;
}

@media only screen and (min-width: 1291px)
{
    .bilibili-suggest.nav,
    .nav-search
    {
        width: 250px !important;
        margin-right: 72px !important;
    }

    .nav-search-keyword
    {
        width: 240px !important;
    }

    ul.bilibili-suggest
    {
        margin-left: 0px !important;
        width: 250px !important;
    }

    li.suggest-item>a
    {
        max-width: 205px !important;
    }
}

::-webkit-scrollbar
{
    width: 5px !important;
    height: 5px !important;
}
::-webkit-scrollbar-corner,
::-webkit-scrollbar-track
{
    background: transparent !important;
}
::-webkit-resizer,
::-webkit-scrollbar-thumb
{
    background: #aaa !important;
}
::-webkit-scrollbar-thumb:hover
{
    background: #888 !important;
}
                </style>`;


                    if (settings.overrideNavBar)
                    {
                        waitForQuery()(
                            () => $(".search"),
                            it => it.length > 0 && $(".nav-con.fr").length > 0,
                            textBox =>
                            {
                                textBox.detach()
                                    .insertAfter(".nav-con.fr");
                            }
                        );
                        waitForQuery()(
                            () => $("input.search-keyword"),
                            it => it.length > 0,
                            textBox => textBox.attr("placeholder", "搜索")
                        );
                        const navBarStyles = `<style id='bilibili-nav-bar-override'>
div.nav-menu
{
    width: unset !important;
}
div.nav-menu>div.bili-wrapper
{
    width: 1018px;
    margin: 0 auto !important;
}

.search
{
    position: relative !important;
    float: right !important;
    margin: 30px 12px 5px 0 !important;
    margin: 26px 12px 5px 0 !important;
    width: 130px !important;
    height: 30px !important;
    background-color: transparent !important;
    padding: 0 !important;
}

form.searchform
{
    background-color: #fff !important;

    background-color: #fffb !important;
    box-shadow: 0px 2px 10px 1px #0002 !important;
    height: 30px !important;
}
form.searchform:hover
{
    background-color: #fff !important;
}

button.search-submit,
a.link-ranking
{
    display: none !important;
}

input.search-keyword
{
    width: 110px !important;
    height: 30px !important;
    padding: 0 10px !important;
}

@media only screen and (min-width: 1291px)
{
    div.nav-menu>div.bili-wrapper
    {
        width: 1234px !important;
    }

    .search
    {
        width: 250px !important;
        margin: 30px 72px 5px 0 !important;
        margin: 26px 72px 5px 0 !important;
    }

    input.search-keyword
    {
        width: 230px !important;
    }
}
                </style>`;
                        $("body").after(navBarStyles);

                        if (!settings.showBanner)
                        {
                            const bannerStyles = `<style id='bilibili-banner-override'>
#banner_link
{
    display: none !important;
}

div.blur-bg
{
    opacity: 0 !important;
}

                </style>`;
                            $("body").after(bannerStyles);
                        }
                    }
                }
                $("#bilibili-new-style").remove();
                $("body").after(styles);
            };
            const updateColors = () =>
            {
                updateDarkModeColor();
                updateStyleColor();
            };
            updateColors();

            // if (settings.useDominantColor && !(settings.overrideNavBar && !settings.showBanner))
            // {
            //     waitForQuery()(
            //         () => $("#banner_link"),
            //         it => it.length > 0 && it.css("background-image") !== "none",
            //         image =>
            //         {
            //             const src = image.css("background-image").match(/url\("(.+)"\)/)[1];
            //             RGBaster.colors(src, {
            //                 success: color =>
            //                 {
            //                     settings.customStyleColor = color.dominant;
            //                     updateColors();
            //                 }
            //             });
            //         }
            //     );
            // }
        }

    });
})(window.jQuery.noConflict(true));
