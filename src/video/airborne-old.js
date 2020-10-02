if (typeof isEmbeddedPlayer !== "undefined" && isEmbeddedPlayer())
{
    return;
}

function isAirbornable(danmaku)
{
    return danmaku.innerText.search(/\d{1,}[:：]\d{2}/) !== -1 && danmaku.childElementCount === 0; // 无子元素表明没有被检测并加过下划线，防止重复调用陷入死循环
}

function getArea(element)
{
    var eleLeft = element.offsetLeft;
    var eleTop = element.offsetTop;
    var offParent = element.offsetParent;
    while (offParent !== null)
    {
        eleLeft += offParent.offsetLeft;
        eleTop += (offParent.offsetTop + offParent.clientTop);
        offParent = offParent.offsetParent;
    }
    styleTransform = element.style.transform;
    translateXReg = styleTransform.match(/translateX\(-?[0-9]{1,}([.][0-9]{1,})?px\)/);
    if (translateXReg !== null)
    {
        eleLeft += parseFloat(translateXReg[0].match(/-?[0-9]{1,}([.][0-9]{1,})?/)[0]);
    }
    return {left: eleLeft,
            right: eleLeft + element.offsetWidth,
            top: eleTop,
            bottom: eleTop + element.offsetHeight};
}

function danmakuContainerCallback()
{
    // 当用户点击到视频内部时检查是否点击空降弹幕而非在检测到空降弹幕时就监听弹幕的点击从而改善性能(不然有可能点击时调用一堆函数)

    // 获取鼠标位置
    const mousePosition = document.querySelector(".bilibili-player-video-danmaku").mousePosition;

    // 依次检测鼠标是否在弹幕区域内以及是否为空降弹幕
    document.querySelector('.bilibili-player-video-danmaku').children.forEach((danmaku) => {
        if (typeof(danmaku.airborneDestination) === 'undefined')
        {
            // 不是空降弹幕,continue
            return true;
        }
        const danmakuArea = getArea(danmaku);
        if (danmakuArea.left <= mousePosition[0] &&
            mousePosition[0] <= danmakuArea.right &&
            danmakuArea.top <= mousePosition[1] &&
            mousePosition[1] <= danmakuArea.bottom)
        {
            document.querySelector('.bilibili-player-video video').currentTime = danmaku.airborneDestination;
            document.querySelector('.bilibili-player-video video').play();
        }
    });
}

function markAirborne(danmaku)
{
    if (settings.airborne)
    {
        airborneDestination = danmaku.innerText.match(/\d{1,}[:：]\d{2}/)[0];
        sep = airborneDestination.includes(':') ? ':' : '：';
        airborneDestination = parseInt(airborneDestination.split(sep)[0]) * 60 + parseInt(airborneDestination.split(sep)[1]);
        if (0 <= airborneDestination && airborneDestination <= document.querySelector('.bilibili-player-video video').duration)
        {
            danmaku.airborneDestination =airborneDestination;
            const originalWidth = danmaku.offsetWidth;
            danmaku.innerHTML = '<u>' + danmaku.innerText + '🚁</u>';
            // 弹幕离开视频后并不一定会删除该元素，如果不向左移有可能会导致画面最左边弹幕离开的地方有一个 🚁 一直在那里
            if (danmaku.style.marginLeft === '')
            {
                danmaku.style.marginLeft = '-' + (danmaku.offsetWidth - originalWidth).toString() + 'px';
            }
        }
    }
}

(function addDanmakuListener()
{
    SpinQuery.select(() => document.querySelector(".bilibili-player-video-danmaku"))
    .then(() => {
        // 当点击到 warp 时可以正常获取鼠标位置，但是点击到视频元素时获取到的鼠标位置是(0,0)，这里只好初始化时就一直记录鼠标位置，暂时没想到更好的办法(菜……)
        document.querySelector(".bilibili-player-video-danmaku").mousePosition = [0, 0];
        document.addEventListener ('mousemove', (e) => {document.querySelector(".bilibili-player-video-danmaku").mousePosition = [e.clientX, e.clientY]}, false);
        
        // 当视频或 warp 被点击时检测是否点击空降弹幕
        // setTimeout 原因：B站滚动字幕是通过 transform 实现的，如果当点击时立即调用计算弹幕区域就得出的就是弹幕移出视频范围的位置而非当前的位置
        // 延后5ms让B站的代码把 translateX 的值改到弹幕当前的位置，虽然说1ms应该完全够了，而且我测试的时候1ms在av78426409里没问题
        // 不过万一遇到老掉牙的电脑跑得慢就有可能出问题，这里就改成5ms了，但是用户应该也不会察觉到(什么神仙有那反应速度…)
        document.querySelector('.bilibili-player-video-wrap').addEventListener('click', ()=>{setTimeout(() => {danmakuContainerCallback();}, 5);});

        // 监听每一个弹幕并检测是否为空降弹幕
        Observer.childList('.bilibili-player-video-danmaku', (records) => {
            records.forEach((record) => {
                record.addedNodes.forEach((addedNode) => {
                    if (isAirbornable(addedNode))
                    {
                        markAirborne(addedNode);
                    }
                    
                    // 有可能会出现当前元素在视频里面走完了一次之后不删除更改内容再出现在视频里面的情况，这里保证所有弹幕都能被监听到
                    Observer.childList(addedNode, (records) => {
                        records.forEach((record) => {
                            if (isAirbornable(record.target))
                            {
                                markAirborne(record.target);
                            }
                        })
                    })
                })
            })
        });
    })
})()
