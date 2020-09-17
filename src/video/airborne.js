if (typeof isEmbeddedPlayer !== "undefined" && isEmbeddedPlayer())
{
    return;
}

function isAirbornable(danmaku)
{
    return danmaku.innerText.search(/\d{1,}[:：]\d{2}/) !== -1 && danmaku.childElementCount === 0; // 无子元素表明没有被检测并加过下划线，防止重复调用陷入死循环
}

function doAirborne(danmaku)
{
    if (settings.airborne)
    {
        airborneDestination = danmaku.innerText.match(/\d{1,}[:：]\d{2}/)[0];
        sep = airborneDestination.includes(':') ? ':' : '：';
        airborneDestination = parseInt(airborneDestination.split(sep)[0]) * 60 + parseInt(airborneDestination.split(sep)[1]);
        if (0 <= airborneDestination <= document.querySelector('.bilibili-player-video video').duration)
        {
            const originalWidth = danmaku.offsetWidth;
            danmaku.innerHTML = '<u>' + danmaku.innerText + '🚁</u>';
            // 弹幕离开视频后并不一定会删除该元素，如果不向左移有可能会导致画面最左边弹幕离开的地方有一个 🚁 一直在那里
            if (danmaku.style.marginLeft === '')
            {
                danmaku.style.marginLeft = '-' + (danmaku.offsetWidth - originalWidth).toString() + 'px';
            }
        }
        function clickHandler(event)
        {
            // 计算弹幕区域
            var left = danmaku.offsetLeft;
            var top = danmaku.offsetTop;
            var offParent = danmaku.offsetParent;
            while (offParent !== null)
            {
                left += offParent.offsetLeft;
                top += (offParent.offsetTop + offParent.clientTop);
                offParent = offParent.offsetParent;
            }
            const right = left + danmaku.offsetWidth;
            const bottom = top + danmaku.offsetHeight;
            if (left <= event.clientX &&
                event.clientX <= right &&
                top <= event.clientY &&
                event.clientY <= bottom &&
                danmaku.offsetWidth !== 0)
            {
                document.querySelector('.bilibili-player-video video').currentTime = airborneDestination;
                document.querySelector('.bilibili-player-video video').play();
            }
        }
        document.querySelector('.bilibili-player-video-wrap').addEventListener('click', clickHandler);
        document.querySelector('.bilibili-player-video video').addEventListener('click', clickHandler);
    }
}

(function addDanmakuListener()
{
    SpinQuery.select(() => document.querySelector(".bilibili-player-video-danmaku"))
    .then(() => {
        Observer.childList('.bilibili-player-video-danmaku', (records) => {
            records.forEach((record) => {
                record.addedNodes.forEach((addedNode) => {
                    if (isAirbornable(addedNode))
                    {
                        doAirborne(addedNode);
                    }
                    // 有可能会出现当前元素在视频里面走完了一次之后不删除更改内容再出现在视频里面的情况，这里保证所有弹幕都能被监听到
                    Observer.childList(addedNode, (records) => {
                        records.forEach((record) => {
                            if (isAirbornable(record.target))
                            {
                                doAirborne(record.target);
                            }
                        })
                    })
                })
            })
        });
    })
})()