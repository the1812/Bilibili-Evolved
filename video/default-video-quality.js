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
                value: 80
            },
            {
                name: "720P",
                value: 64
            },
            {
                name: "480P",
                value: 32
            },
            {
                name: "360P",
                value: 15
            },
            {
                name: "自动",
                value: 0
            },
        ];
        (async () =>
        {
            const qualityItems = await SpinQuery.condition(
                () => $(".bilibili-player-video-quality-menu .bui-select-list>li.bui-select-item"),
                it => it.length > 0 && $("li.profile-info").length > 0
            );
            const [availableHighestQualities] = qualityItems.toArray()
                .map(it => parseInt(it.getAttribute("data-value")))
                .sort(it => it);
            const [targetQuality] = qualities
                .filter(it => it.name === settings.defaultVideoQuality)
                .map(it => it.value);
            const [finalQuality] = qualities
                .map(it => it.value)
                .filter(it => it <= Math.min(targetQuality, availableHighestQualities))
                .sort(it => it);

            qualityItems.each((_, it) =>
            {
                if (parseInt(it.getAttribute("data-value")) === finalQuality)
                {
                    it.click();
                }
            });
        })();
    };
})();