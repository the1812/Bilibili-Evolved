# 可安装功能
在标题右键可以复制安装链接.

## [禁止跳转动态详情](../registry/dist/components/feeds/disable-details.js)
`disableFeedsDetails`

禁止动态点击后跳转详情页, 方便选择其中的文字.

## [直播信息扩充](../registry/dist/components/feeds/extend-live.js)
`extendFeedsLive`

在动态的<span>正在直播</span>中, 为每一个直播间加上标题, 并且能够显示超过10个的直播间.

## [快速收起评论](../registry/dist/components/feeds/fold-comments.js)
`foldComments`

动态里查看评论区时, 在底部添加一个<span>收起评论</span>按钮, 这样就不用再回到上面收起了.

## [展开动态内容](../registry/dist/components/feeds/full-content.js)
`fullFeedsContent`

不管内容多长, 总是完全展开动态的内容.

## [展开动态标题](../registry/dist/components/feeds/full-title.js)
`fullFeedsTitle`

在顶栏的视频动态中, 无论标题多长总是完全展开.

## [动态反折叠](../registry/dist/components/feeds/unfold.js)
`unfoldFeeds`

自动展开被折叠的动态.

## [直播勋章快速更换](../registry/dist/components/live/badge-helper.js)
`badgeHelper`

在直播区中, 可从功能面板中直接切换勋章和头衔.

## [删除直播水印](../registry/dist/components/live/remove-watermark.js)
`removeLiveWatermark`

删除观看直播时角落的水印.

## [直播看板娘高DPI适配](../registry/dist/components/live/showgirl.js)
`dpiLiveShowgirl`

根据屏幕DPI缩放直播看板娘的大小, 避免像素锯齿.

## [自动收起直播侧栏](../registry/dist/components/live/side-bar.js)
`collapseLiveSideBar`

暂无描述

## [自定义顶栏](../registry/dist/components/style/custom-navbar.js)
`customNavbar`

暂无描述

## [夜间模式跟随系统](../registry/dist/components/style/dark-mode/follow-system.js)
`darkModeFollowSystem`

使夜间模式同步系统设置的亮/暗主题.

## [夜间模式](../registry/dist/components/style/dark-mode.js)
`darkMode`

启用夜间模式能更好地适应光线暗的环境, 并会大量应用主题颜色.

## [夜间模式计划时段](../registry/dist/components/style/dark-mode/schedule.js)
`darkModeSchedule`

设置一个使用夜间模式的时间段, 进入/离开此时间段时, 会自动开启/关闭夜间模式.
结束时间小于起始时间时将视为次日, 如<span>18:00</span>至<span>6:00</span>表示晚上18:00到次日6:00.

## [简化评论区](../registry/dist/components/style/simplify/comments.js)
`simplifyComments`

- 删除热评头像下方的关注按钮
- 删除用户的等级标识
- 删除发送源信息(<span>来自安卓客户端</span>这种)
- 删除用户名右边的勋章
- 删除评论区顶部的横幅
- 发送时间移动到右上角
- 位图图标全部换用矢量图标, 高分屏不会模糊
- 投票仅显示链接, 隐藏下面的大框.

> 注: 关注和等级可以通过鼠标停留在头像上, 在弹出的资料卡小窗中查看.

## [简化直播间](../registry/dist/components/style/simplify/live.js)
`simplifyLiveroom`

- 隐藏老爷图标
- 隐藏粉丝勋章
- 隐藏活动头衔
- 隐藏用户等级
- 隐藏舰长图标
- 隐藏全区广播
- 隐藏欢迎信息 (xxx老爷进入直播间)
- 隐藏礼物弹幕 (仅弹幕列表, 特殊效果如节奏风暴不受影响)
- 隐藏上舰提示 (弹幕列表里的 xxx开通了舰长)
- 隐藏付费礼物 (播放器下面的各种金瓜子礼物, 以及许愿瓶, 上舰等)
- 隐藏入场特效
- 隐藏看板娘
- 隐藏活动横幅
- 隐藏抽奖提示 (开通舰长, 小飞船抽奖等)
- 禁用直播间皮肤

> 每一项都可以在<span>功能</span>中单独选择是否隐藏.

## [专栏文字选择](../registry/dist/components/utils/column-unlock.js)
`columnUnlock`

使专栏的文字可以选择.

## [快捷键扩展](../registry/dist/components/utils/keymap.js)
`keymap`

为视频播放器启用更多的快捷键:
- <kbd>w</kbd> 网页全屏
- <kbd>t</kbd> 宽屏
- <kbd>m</kbd> 静音
- <kbd>d</kbd> 弹幕开关
- <kbd>l</kbd> 点赞
- <kbd>c</kbd> 投币
- <kbd>s</kbd> 收藏
- <kbd>j</kbd> 长前进
- <kbd>Shift + j</kbd> 长倒退
- <kbd>Shift + w</kbd> 稍后再看
- <kbd>Shift + ↑/↓</kbd> / <kbd>Shift + ,/.</kbd> 播放速度调整
- <kbd>Shift + /</kbd> 重置播放速度

## [删除广告](../registry/dist/components/utils/remove-promotions.js)
`removePromotions`

删除站内的各种广告. 包括首页的推广模块, 手机app推荐, 视频页面右侧的广告等.

- `占位文本`: 删除首页推广模块的广告后显示"🚫已屏蔽广告"来替代空白区域.
- `保留活动横幅`: 保留视频页面的活动横幅.

## [网址参数清理](../registry/dist/components/utils/url-params-clean.js)
`urlParamsClean`

自动删除网址中的多余跟踪参数.

## [查看封面](../registry/dist/components/utils/view-cover.js)
`viewCover`

在视频和直播页面中, 可从功能面板中查看封面.

## [稍后再看重定向](../registry/dist/components/utils/watchlater-redirect.js)
`watchlaterRedirect`

将稍后再看的链接重定向为普通播放网址, 以使用新版播放页面.

## [启用弹幕空降](../registry/dist/components/video/danmaku/airborne.js)
`danmakuAirborne`

暂无描述

## [下载弹幕](../registry/dist/components/video/danmaku/download.js)
`downloadDanmaku`

启用下载弹幕支持, 在视频和番剧页面中可从功能面板里下载弹幕.

## [下载视频](../registry/dist/components/video/download.js)
`downloadVideo`

暂无描述

## [展开视频简介](../registry/dist/components/video/full-description.js)
`fullVideoDescription`

总是展开完整的视频简介.

## [外置稍后再看](../registry/dist/components/video/outer-watchlater.js)
`outerWatchlater`

将视频页面菜单里的`稍后再看`移到外面.

## [删除视频弹窗](../registry/dist/components/video/player/remove-popup.js)
`removePlayerPopup`

删除视频播放器中出现的各种弹窗, 类别可在选项中分别选择.

## [跳过充电鸣谢](../registry/dist/components/video/player/skip-charge-list.js)
`skipChargeList`

自动跳过视频结尾的充电鸣谢.

## [启用快速收藏](../registry/dist/components/video/quick-favorite.js)
`quickFavorite`

启用快速收藏, 在视频页面可以一键收藏到设定的某个收藏夹.