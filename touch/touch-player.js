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
