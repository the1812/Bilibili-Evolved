(() =>
{
    return (settings, resources) =>
    {
        const toolTips = {
            defaultPlayerMode: `设置默认的播放器模式, 可以为<span>常规</span>, <span>宽屏</span>或<span>网页全屏</span>(<span>全屏</span>还未完成). 默认模式将在进入视频页面的首次播放时应用.`,
            defaultVideoQuality: `进入视频时自动选择指定的画质, 若视频最高画质低于所选画质, 则使用视频的最高画质.`,
        };
        function extractKey(listItem)
        {
            const input = $(listItem).find("input");
            if (input.length > 0)
            {
                return input.attr("key");
            }
            return null;
        }
        (async () =>
        {
            const tooltip = await SpinQuery.select(() => document.querySelector(".gui-settings-tooltip"));
            document.querySelectorAll(".gui-settings-content>ul>li").forEach(element =>
            {
                element.addEventListener("mouseover", () =>
                {
                    const tipText = toolTips[extractKey(element)];
                    if (tipText !== undefined)
                    {
                        tooltip.innerHTML = tipText;
                        tooltip.classList.add("show");
                    }
                });
                element.addEventListener("mouseout", () =>
                {
                    tooltip.classList.remove("show");
                });
            });
        })();
    };
})();