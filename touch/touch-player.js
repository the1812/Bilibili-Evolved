(() =>
{
    return (_, resources) =>
    {
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
            const style = resources.getStyle("touchPlayerStyle", "bilibili-touch-video-player");
            $("body").after(style);
        }
    };
})();
