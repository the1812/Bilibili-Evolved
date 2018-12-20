(() =>
{
    return (settings, resources) =>
    {
        const toolTips = {
            defaultPlayerMode: `设置默认的播放器模式, 可以为<span>常规</span>, <span>宽屏</span>或<span>网页全屏</span>(<span>全屏</span>还未完成). 默认模式将在进入视频页面的首次播放时应用.`,
            useDefaultVideoQuality: `进入视频时自动选择指定的画质, 若视频最高画质低于所选画质, 则使用视频的最高画质.`,
            defaultVideoQuality: `设定自动选择的视频画质.`,
            autoLightOff: `首次播放时, 自动进入关灯模式.`,
            useDefaultDanmakuSettings: `设置默认是否开启弹幕, 以及是否记住弹幕屏蔽类型.`,
            enableDanmaku: `控制弹幕是否默认开启.`,
            rememberDanmakuBlock: `控制是否记住弹幕屏蔽类型, 在播放器中选择要屏蔽的弹幕类型后, 每个视频都会默认屏蔽这些类型的弹幕.`,
            expandDanmakuList: `新版播放页面中, 弹幕列表默认收起以显示推荐的其他视频. 启用此功能可在每次加载视频时自动展开弹幕列表.`,
            expandDescription: `长的视频简介默认会被折叠, 启用此功能可以强制展开完整的视频简介.`,
            autoContinue: `播放视频时如果检测到历史记录信息(<span>上次看到...</span>消息), 则自动跳转到相应的时间播放.`,
            customStyleColor: `设定顶栏(样式调整启用时)和夜间模式使用的主题色, 可以点击颜色预览的圆圈打开色板, 其中含有预定义的16种主题色, 也可以在右侧的文本框直接输入任何有效的16进制颜色值(<span>#rrggbb</span>或<span>#rgb</span>).`,
            useNewStyle: `<span>主要</span>会改变顶栏的样式, 并有一些其他地方的界面微调:
- 为播放器增加主题色投影
- 可控制顶栏对横幅的透明度
- 使播放器按钮垂直对齐
- 使部分搜索栏的提示文字的颜色更清晰
- 隐藏播放页面的"返回旧版"侧栏
- 修复直播间一些文字初始状态不正确`,
            useDarkStyle: `夜间模式更适合光线暗的环境, 并会大量应用主题颜色.`,
            darkSchedule: `设置一个使用夜间模式的时间段, 进入/离开此时间段时, 会自动开启/关闭夜间模式.
结束时间小于起始时间时将视为次日, 如<span>18:00</span>至<span>6:00</span>表示晚上18:00到次日6:00.`,
            darkScheduleStart: `设置计划时段的起始时间.`,
            darkScheduleEnd: `设置计划时段的结束时间.`,
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