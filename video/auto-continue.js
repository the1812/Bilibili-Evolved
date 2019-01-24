(() =>
{
    return (settings, resources) =>
    {
        function continuePlay(toastText)
        {
            const regex = /((\d)*:)?(\d)*:(\d)*/g;
            const text = toastText.text();
            const match = text.match(regex);
            if (!match)
            {
                return;
            }
            const historyTime = match[0].split(":");
            const time = (() =>
            {
                if (historyTime.length === 3)
                {
                    const [hour, minute, second] = historyTime.map(it => parseInt(it));
                    return hour * 60 * 60 + minute * 60 + second;
                }
                else if (historyTime.length === 2)
                {
                    const [minute, second] = historyTime.map(it => parseInt(it));
                    return minute * 60 + second;
                }
                else
                {
                    logError(`解析历史时间发生错误: historyTime=${JSON.stringify(historyTime)}`);
                    return NaN;
                }
            })();
            const toastItem = toastText.parent();
            const video = document.querySelector("video");
            if (time < video.duration)
            {
                video.currentTime = time;
                video.play();
                toastItem.find(".bilibili-player-video-toast-item-jump").remove();
                const restart = $(`<div class="bilibili-player-video-toast-item-jump">从头开始</div>`);
                restart.appendTo(toastItem).on("click", () => video.currentTime = 0);
                toastText.html(`<span>已跳转到上次历史记录</span><span>${match[0]}</span>`);
            }
            else
            {
                toastItem.find(".bilibili-player-video-toast-item-close").get(0).click();
            }
        }
        function findHistoryToast()
        {
            SpinQuery.condition(
                () => $(".bilibili-player-video-toast-item-text"),
                it => it.text().indexOf("上次看到") !== -1,
                it => continuePlay(it.filter((_, e) => e.innerText.indexOf("上次看到") !== -1)),
            );
        }
        Observer.childListSubtree("#bofqi", findHistoryToast);
    };
})();