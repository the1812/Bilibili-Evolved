(() =>
{
    return (settings, resources) =>
    {
        const qualities = [
            {
                name: "1080P60",
                value: 116,
            },
            {
                name: "1080P+",
                value: 112,
            },
            {
                name: "1080P",
                value: 80,
            },
            {
                name: "720P60",
                value: 74,
            },
            {
                name: "720P",
                value: 64,
            },
            {
                name: "480P",
                value: 32,
            },
            {
                name: "360P",
                value: 15,
            },
            {
                name: "自动",
                value: 0,
            },
        ];
        async function applyQuality()
        {
            const qualityItems = await SpinQuery.any(
                () => $(".bilibili-player-video-quality-menu .bui-select-list>li.bui-select-item"),
            );
            const descendingOrder = (a, b) => b - a;
            const [availableHighestQualities] = qualityItems.toArray()
                .map(it => parseInt(it.getAttribute("data-value")))
                .sort(descendingOrder);
            const [targetQuality] = qualities
                .filter(it => it.name === settings.defaultVideoQuality)
                .map(it => it.value)
                .sort(descendingOrder);
            const [finalQuality] = qualities
                .map(it => it.value)
                .filter(it => it <= Math.min(targetQuality, availableHighestQualities))
                .sort(descendingOrder);

            console.info(`[Video Quality] availableHighestQualities=${availableHighestQualities}`);
            console.info(`[Video Quality] targetQuality=${targetQuality}`);
            console.info(`[Video Quality] finalQuality=${finalQuality}`);
            const video = await SpinQuery.condition(() => document.querySelector("video"), it => it);
            function onplay()
            {
                qualityItems.each((_, it) =>
                {
                    if (parseInt(it.getAttribute("data-value")) === finalQuality)
                    {
                        it.click();
                    }
                });
                this.removeEventListener("play", onplay);
            }
            video.addEventListener("play", onplay);
        }
        Observer.childList("#bofqi", () => applyQuality());
    };
})();