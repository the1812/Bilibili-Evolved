export const toolTips = new Map<keyof BilibiliEvolvedSettings, string>([
  ["useDefaultPlayerMode", /*html*/`控制是否使用默认播放器模式, 可以为<span>常规</span>, <span>宽屏</span>, <span>网页全屏</span>或<span>全屏</span>.`],
  ["defaultPlayerMode", /*html*/`设置默认的播放器模式.`],
  ["applyPlayerModeOnPlay", /*html*/`是否在播放时应用模式, 若选择否就会在未开始播放时就应用.`],
  ["useDefaultPlayerLayout", /*html*/`设置默认的播放器布局, 尽量在相应的页面里设置(比如在番剧播放页面设置番剧播放器布局), 否则可能没有效果.
- 旧版: 传统布局
- 新版: 视频区默认的新版布局
注: 旧版布局中, 很多脚本功能将不适用.`],
  ["defaultPlayerLayout", /*html*/`设置视频区的布局.`],
  ["defaultBangumiLayout", /*html*/`设置番剧区的布局.`],
  ["useDefaultVideoQuality", /*html*/`进入视频时自动选择指定的画质, 若视频最高画质低于所选画质, 则使用视频的最高画质.`],
  ["defaultVideoQuality", /*html*/`设定自动选择的视频画质.`],
  ["autoLightOff", /*html*/`首次播放时, 自动进入关灯模式, 并在播放结束后自动开灯.`],
  ["useDefaultDanmakuSettings", /*html*/`设置默认是否开启弹幕, 以及是否记住防挡字幕和智能防挡弹幕.`],
  ["enableDanmaku", /*html*/`控制弹幕是否默认开启.`],
  ["rememberDanmakuSettings", /*html*/`控制是否记住弹幕设置, 包括防挡字幕和智能防挡弹幕. 在播放器中改动这些设置后, 每个视频都会默认使用这些设置.`],
  ["expandDanmakuList", /*html*/`新版播放页面中, 弹幕列表默认收起以显示推荐的其他视频. 启用此功能可在每次加载视频时自动展开弹幕列表.`],
  ["expandDescription", /*html*/`长的视频简介默认会被折叠, 启用此功能可以强制展开完整的视频简介.`],
  ["autoPlay", /*html*/`进入视频页面时自动开始播放视频.`],
  ["autoContinue", /*html*/`播放视频时如果检测到历史记录信息(<span>上次看到...</span>消息), 则自动跳转到相应的时间播放.`],
  ["skipChargeList", /*html*/`自动跳过视频结尾的充电鸣谢.`],
  ["framePlayback", /*html*/`在播放器的时间右边增加两个按钮, 用于<span>较</span>精细调整视频时间. 支持键盘快捷键<kbd>Shift</kbd>+<kbd>←</kbd>/<kbd>→</kbd>. (旧版播放器只能用键盘快捷键, 不会显示按钮)`],
  ["playerFocus", /*html*/`进入视频/番剧页面时, 自动定位到播放器.`],
  ["playerFocusOffset", /*html*/`定位时的竖直偏移量, 单位为像素(px).`],
  ["customStyleColor", /*html*/`设定顶栏(自定义顶栏启用时)和夜间模式使用的主题色, 可以点击颜色预览的圆圈打开色板, 其中含有预定义的16种主题色, 也可以在右侧的文本框直接输入任何有效的16进制颜色值(<span>#rrggbb</span>或<span>#rgb</span>).`],
  ["useNewStyle", /*html*/`<span>主要</span>会改变顶栏的样式, 并有一些其他地方的界面微调:
- 为播放器增加主题色投影
- 可控制顶栏对横幅的透明度
- 使播放器按钮垂直对齐
- 使部分搜索栏的提示文字的颜色更清晰
- 隐藏播放页面的"返回旧版"侧栏
- 修复直播间一些文字初始状态不正确
- 窄屏幕下强制保留弹幕发送栏`],
  ["blurBackgroundOpacity", /*html*/`设置顶栏对横幅的透明度(0~1), 数值越高顶栏越淡, 当横幅关闭时此选项无效.`],
  ["useDarkStyle", /*html*/`夜间模式更适合光线暗的环境, 并会大量应用主题颜色.`],
  ["darkSchedule", /*html*/`设置一个使用夜间模式的时间段, 进入/离开此时间段时, 会自动开启/关闭夜间模式.
结束时间小于起始时间时将视为次日, 如<span>18:00</span>至<span>6:00</span>表示晚上18:00到次日6:00.`],
  ["darkScheduleStart", /*html*/`设置计划时段的起始时间.`],
  ["darkScheduleEnd", /*html*/`设置计划时段的结束时间.`],
  ["compactLayout", /*html*/`设置首页是否使用紧凑布局, 视频的间距会减小并削去圆角, 分区栏的图标会使用高清重制版. 目前仅支持首页, 其他分区的样式后续会添加.`],
  ["useCommentStyle", /*html*/`- 删除热评头像下方的关注按钮
- 删除用户的等级标识
- 删除发送源信息(<span>来自安卓客户端</span>这种)
- 删除用户名右边的勋章
- 删除评论区顶部的横幅
- 发送时间移动到右上角
- 位图图标全部换用矢量图标, 高分屏不会模糊
- 投票仅显示链接, 隐藏下面的大框.
注: 关注和等级可以通过鼠标停留在头像上, 在弹出的资料卡小窗中查看.`],
  ["simplifyLiveroom", /*html*/`- 隐藏老爷图标
- 隐藏粉丝勋章
- 隐藏活动头衔
- 隐藏用户等级
- 隐藏舰长图标
- 隐藏全区广播
- 隐藏欢迎信息 (xxx老爷进入直播间)
- 隐藏礼物弹幕 (仅弹幕列表, 特殊效果如节奏风暴不受影响)
- 隐藏上舰提示 (弹幕列表里的 xxx开通了舰长)
- 隐藏抽奖提示 (开通舰长, 小飞船抽奖等)
- 禁用直播间皮肤
每一项都可以在<span>附加功能</span>中单独选择是否隐藏.`],
  //["overrideNavBar", /*html*/`开启后, 在主站中总是把搜索框置于顶栏, 如果页面里没有搜索栏则不会显示.`],
  //["showBanner", /*html*/`控制是否显示主站顶部的横幅`],
  ["preserveRank", /*html*/`控制是否在搜索框左侧显示排行榜图标.`],
  ["blurVideoControl", /*html*/`模糊视频控制栏背景, 原版的阴影效果将无效.`],
  ["customControlBackground", /*html*/`给视频控制栏附上半透明的黑色, 代替原来的阴影.`],
  ["customControlBackgroundOpacity", /*html*/`设置控制栏着色的黑色不透明度(0~1), 数值越大黑色越浓.`],
  ["harunaScale", /*html*/`根据屏幕DPI缩放直播看板娘的大小以提高像素的清晰度.`],
  ["removeLiveWatermark", /*html*/`删除观看直播时角落的水印.`],
  ["removeVideoTopMask", /*html*/`删除视频里鼠标经过时出现在右上角的覆盖层.`],
  ["removeAds", /*html*/`删除站内的各种广告. 包括首页的推广模块, 手机app推荐, 视频页面右侧的广告等.`],
  ["showBlockedAdsTip", /*html*/`删除首页推广模块的广告后显示"🚫已屏蔽广告"来替代空白区域.`],
  ["watchLaterRedirect", /*html*/`将稍后再看的链接重定向为普通播放网址, 以使用新版播放页面.`],
  ["favoritesRedirect", /*html*/`将个人空间收藏夹里的视频重定向为直链, 而不是收藏夹播单链接.`],
  ["hideTopSearch", /*html*/`将搜索框的推荐词替换为<span>搜索</span>.`],
  ["fullTweetsTitle", /*html*/`在顶栏的动态预览框中, 总是展开完整的视频标题.`],
  ["fullPageTitle", /*html*/`在视频选集列表中, 总是展开完整的标题.`],
  ["showDeadVideoTitle", /*html*/`在个人空间中, 为已失效视频恢复标题和封面.`],
  ["useBiliplusRedirect", /*html*/`将失效视频重定向到BiliPlus.`],
  ["deadVideoTitleProvider", /*html*/`失效视频的信息来源: 稍后再看较稳定, 但需要一点时间来查询; BiliPlus速度更快, 但是因为没写完暂不开放.`],
  ["biliplusRedirect", /*html*/`在视频/番剧/空间中, 附加功能<span>"转到BiliPlus"</span>, 点击可以转到BiliPlus上对应的页面.`],
  ["imageResolution", /*html*/`根据屏幕DPI请求更高分辨率的图片, 例如DPI缩放200%则请求2倍的分辨率, 加载时间也会相应变长一些.`],
  ["oldTweets", /*html*/`将新版动态的链接换为旧版动态, 同时可在附加功能中在新旧动态间切换.`],
  ["touchNavBar", /*html*/`删除顶栏右侧的一级链接(从<span>大会员</span>到<span>历史</span>), 以方便触屏设备快速预览信息. 被删除的链接可从各预览中的<span>查看更多</span>进入.`],
  ["comboLike", /*html*/`为素质三连(长按点赞)启用触摸支持.`],
  ["touchVideoPlayer", /*html*/`增大控制栏的按钮间距, 使触摸操作更准确. 并为播放器启用触摸支持:
- 左右滑动可调整进度
- 上下滑动可调整音量
- 进度调整可在左上角和右上角取消
- 在不同位置滑动, 可以使用3档不同的灵敏度.`],
  ["touchVideoPlayerAnimation", /*html*/`决定是否要对触摸调整的提示框使用出现/消失动画, 此动画可能导致掉帧.`],
  ["touchVideoPlayerDoubleTapControl", /*html*/`将操作方式更改为: 单击显示/隐藏控制栏, 双击播放/暂停.`],
  ["toast", /*html*/`允许在网页左下角显示来自本脚本的消息, 如更新提醒, 错误提示等.`],
  ["toastInternalError", /*html*/`开启后, 错误消息将显示详细的技术性错误信息及堆栈跟踪, 这通常用于准确地确定问题发生的原因, 所以报告问题时这些信息会非常有用.`],
  ["useCache", /*html*/`使用缓存以提高脚本的加载速度.`],
  ["outerWatchlater", /*html*/`将视频页面菜单里的<span>稍后再看</span>移到外面.`],
  ["i18n", /*html*/`为界面中一些常用文本提供翻译.`],
  ["i18nLanguage", /*html*/`翻译的目标语言.`],
  ["customNavbar", /*html*/`启用自定义顶栏, 替代原版的顶栏, 仅对主站生效, 不影响直播/相簿/会员购等.`],
  ["customNavbarFill", /*html*/`是否使用主题色填充顶栏.`],
  ["allNavbarFill", /*html*/`是否使用主题色填充其他的顶栏, 包括直播/相簿/会员购等.`],
  ["customNavbarShadow", /*html*/`是否为顶栏添加一层阴影效果.`],
  ["customNavbarCompact", /*html*/`是否为顶栏使用更紧凑的布局, 紧凑布局将使用更小的间距, 以及在视频标题过长时用...省略后面的部分.`],
  ["customNavbarBlur", /*html*/`是否在顶部横幅存在时, 使用背景模糊效果.`],
  ["playerShadow", /*html*/`为播放器添加主题色投影.`],
  ["narrowDanmaku", /*html*/`在网页全屏时, 即使宽度过小也强制保留弹幕发送栏, 注意这可能导致右侧的功能按钮挤出边界.`],
  ["hideOldEntry", /*html*/`隐藏播放页右侧的<span>返回旧版</span>入口.`],
  ["hideBanner", /*html*/`隐藏首页顶部横幅.`],
  ["allowJumpContinue", /*html*/`当历史记录的集数与当前打开的不一致时, 仍然自动跳转.`],
  ["hideBangumiReviews", /*html*/`隐藏番剧播放页面里的点评板块.`],
  ["videoScreenshot", /*html*/`启用视频快速截图, 将在播放器的时间右边增加一个截图按钮. 支持键盘快捷键<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>C</kbd>. (旧版播放器只能用键盘快捷键, 不会显示按钮)
如果弹幕渲染类型选择了Canvas, 则可以再按住<kbd>Shift</kbd>键来截取带弹幕的截图. 也就是鼠标操作为"按住<kbd>Shift</kbd>点击截图按钮", 键盘操作为"<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>C</kbd>".`],
  ["filenameFormat", /*html*/`自定义文件命名格式, 作用于<span>下载弹幕</span>, <span>下载视频</span>, <span>视频截图</span>, <span>查看封面</span>.
可以使用的变量有:
- <span>title</span>: 视频标题/直播间标题
- <span>ep</span>: 选集标题
- <span>aid</span>: AV号
- <span>cid</span>: CID (每个视频的唯一编号, AV号对应的视频可能有多集)
- <span>lid</span>: 直播间号
- <span>y</span>/<span>M</span>/<span>d</span>: 年/月/日
- <span>h</span>/<span>m</span>/<span>s</span>/<span>ms</span>: 时/分/秒/毫秒

默认的格式是<span>[title][ - ep]</span>, 标题+选集标题, 当没有选集标题时则只有标题.

变量要放在方括号里, 而方括号里的其他内容会在变量有效时出现. 比如格式如果写成<span>[title] - [ep]</span>, 那么即使没有选集标题, 中间那个<span> - </span>也会出现在文件名里. 如果像默认那样放在方括号里, 没有选集标题时, <span> - </span>也不会出现.

例如, 想要标题+AV号+时间的格式, 可以设定为<span>[title][ AVaid] [y]-[M]-[d] [h]-[m]-[s]</span>, 能够得到类似<span>xxxx AV23333 2019-05-29 19-59-44</span>的名字.`],
  ['noLiveAutoplay', /*html*/`禁止直播首页的推荐直播间自动开始播放.`],
  ['hideHomeLive', /*html*/`隐藏直播首页的推荐直播间板块.`],
  ['sideBarOffset', /*html*/`设定侧栏的垂直偏移量, 单位为百分比, 允许的范围为 -40% ~ 40%.`],
  ['hideCategory', /*html*/`隐藏主站的分区栏, 分区仍然可以从顶栏的主站菜单中进入.`],
  ['foldComment', /*html*/`动态里查看评论区时, 在底部添加一个<span>收起评论</span>按钮, 这样就不用再回到上面收起了.`],
  ['useDefaultVideoSpeed', /*html*/`设置是否使用默认视频播放速度.`],
  ['defaultVideoSpeed', /*html*/`设置默认的视频播放速度.`],
]);
export default {
  export: { toolTips },
};