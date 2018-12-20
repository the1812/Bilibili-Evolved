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
            blurBackgroundOpacity: `设置顶栏对横幅的透明度(0~1), 数值越高顶栏越淡, 当横幅关闭时此选项无效.`,
            useDarkStyle: `夜间模式更适合光线暗的环境, 并会大量应用主题颜色.`,
            darkSchedule: `设置一个使用夜间模式的时间段, 进入/离开此时间段时, 会自动开启/关闭夜间模式.
结束时间小于起始时间时将视为次日, 如<span>18:00</span>至<span>6:00</span>表示晚上18:00到次日6:00.`,
            darkScheduleStart: `设置计划时段的起始时间.`,
            darkScheduleEnd: `设置计划时段的结束时间.`,
            overrideNavBar: `开启后, 在主站中总是把搜索框置于顶栏, 如果页面里没有搜索栏则不会显示.`,
            showBanner: `控制是否显示主站顶部的横幅`,
            preserveRank: `控制是否在搜索框左侧显示排行榜图标.`,
            blurVideoControl: `模糊视频控制栏背景, 原版的阴影效果将无效.`,
            customControlBackground: `给视频控制栏附上半透明的黑色, 代替原来的阴影.`,
            customControlBackgroundOpacity: `设置控制栏着色的黑色不透明度(0~1), 数值越大黑色越浓.`,
            harunaScale: `根据屏幕DPI缩放直播看板娘的大小以提高像素的清晰度.`,
            removeLiveWatermark: `删除观看直播时角落的水印.`,
            removeVideoTopMask: `删除视频里鼠标经过时出现在顶端的标题覆盖层.`,
            forceWide: `对主站强制使用宽屏样式, 将在宽度达到<span>1300px</span>时启用. 此功能的适用范围为屏幕宽度介于<span>1300px</span>至<span>1400px</span>的设备.
原有的宽屏样式会在宽度超过<span>1400px</span>时自动启用, 如果你的屏幕宽度大于<span>1400px</span>, 则没有必要开启此功能.
非宽屏样式下, 首页视频排行为2行<span>3</span>列; 宽屏样式下, 首页视频排行为2行<span>4</span>列.`,
            removeAds: `删除站内的各种广告. 包括首页的推广模块, 手机app推荐, 视频页面右侧的广告等.`,
            watchLaterRedirect: `将稍后再看的链接重定向为普通播放网址, 以使用新版播放页面.`,
            hideTopSearch: `将搜索框的推荐词替换为<span>搜索</span>.`,
            fullTweetsTitle: `在顶栏的动态预览框中, 总是展开完整的标题.`,
            touchNavBar: `删除顶栏右侧的一级链接(从<span>大会员</span>到<span>历史</span>), 以方便触屏设备快速预览信息. 被删除的链接可从各预览中的<span>查看更多</span>进入.`,
            touchVideoPlayer: `增大控制栏的按钮间距, 使触摸操作更准确. 并为播放器启用触摸支持:
- 左右滑动可调整进度
- 上下滑动可调整音量
- 进度调整可在左上角和右上角取消
- 在不同位置滑动, 可以使用3档不同的灵敏度.`,
            touchVideoPlayerAnimation: `决定是否要对触摸调整的提示框使用出现/消失动画, 此动画可能导致掉帧.`,
            touchVideoPlayerDoubleTapControl: `将操作方式更改为: 单击显示/隐藏控制栏, 双击播放/暂停.`,
            toast: `允许在网页左下角显示来自本脚本的消息, 如更新提醒, 错误提示等.`,
            toastInternalError: `开启后, 错误消息将显示详细的技术性错误信息及堆栈跟踪, 这通常用于准确地确定问题发生的原因, 所以报告问题时这些信息会非常有用.`,
            useCache: `使用缓存以提高脚本的加载速度.`,
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