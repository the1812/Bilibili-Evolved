Resource.manifest = {
  darkStyle: {
    path: 'dark.min.css',
    alwaysPreview: true,
  },
  darkStyleImportant: {
    path: 'dark-important.min.css',
    alwaysPreview: true,
  },
  darkStyleNavBar: {
    path: 'dark-navbar.min.css',
    alwaysPreview: true,
  },
  touchPlayerStyle: {
    path: 'touch-player.min.css',
  },
  noBannerStyle: {
    path: 'no-banner.min.css',
  },
  imageViewerStyle: {
    path: 'image-viewer.min.css',
  },
  imageViewerHtml: {
    path: 'image-viewer.min.html',
  },
  iconsStyle: {
    path: 'icons.min.css',
  },
  settingsSideBar: {},
  textValidate: {},
  themeColors: {},
  settingsTooltipStyle: {
    path: 'settings-tooltip.min.css',
  },
  settingsTooltipJapanese: {
    path: 'settings-tooltip.ja-JP.min.js',
  },
  settingsTooltipChinese: {
    path: 'settings-tooltip.zh-CN.min.js',
  },
  settingsTooltipEnglish: {
    path: 'settings-tooltip.en-US.min.js',
  },
  settingsTooltip: {
    path: 'settings-tooltip.loader.min.js',
    dependencies: ['settingsTooltipStyle'],
  },
  settingsSearch: {},
  guiSettings: {
    html: true,
    style: 'instant',
    dependencies: [
      'textValidate',
      'settingsSideBar',
      'themeColors',
      'settingsTooltip',
      'settingsSearch',
    ],
    styles: [
      {
        key: 'iconsStyle',
        important: true,
      },
    ],
    displayNames: {
      guiSettings: '设置',
      blurSettingsPanel: '模糊设置面板背景',
      clearCache: '清除缓存',
      settingsTooltip: '设置项帮助',
      settingsSearch: '搜索设置',
      sideBarOffset: '侧栏垂直偏移量',
      ajaxHook: '启用 Ajax Hook API',
      scriptLoadingMode: '加载模式',
      guiSettingsDockSide: '设置面板停靠位置',
      foregroundColorMode: '文本颜色',
      updateCdn: '更新源',
      autoHideSideBar: '自动隐藏侧栏',
      elegantScrollbar: '使用细滚动条',
      downloadPackageEmitMode: '多文件下载模式',
      alwaysShowDuration: '总是显示视频时长',
    },
    dropdown: [
      {
        key: 'guiSettingsDockSide',
        items: ['左侧', '右侧'],
      },
      {
        key: 'foregroundColorMode',
        items: ['自动', '黑色', '白色'],
      },
      {
        key: 'scriptLoadingMode',
        items: ['同时', '延后', '同时(自动)', '延后(自动)'],
      },
      {
        key: 'updateCdn',
        items: ['jsDelivr', 'GitHub'],
      },
      {
        key: 'downloadPackageEmitMode',
        items: ['打包下载', '分别下载'],
      },
    ],
  },
  useDarkStyle: {
    path: 'dark-styles.min.js',
    reloadable: true,
    alwaysPreview: true,
    styles: [
      'darkStyle',
      {
        key: 'darkStyleNavBar',
        important: true,
      },
      {
        key: 'darkStyleImportant',
        important: true,
      },
    ],
    displayNames: {
      useDarkStyle: '夜间模式',
      useDarkStyleAsUserStyle: 'UserStyle 模式',
    },
  },
  hideBanner: {
    reloadable: true,
    style: 'instant',
    displayNames: {
      hideBanner: '隐藏顶部横幅',
    },
  },
  touchNavBar: {
    path: 'touch-navbar.min.js',
    displayNames: {
      touchNavBar: '顶栏触摸优化',
    },
  },
  touchVideoPlayer: {
    path: 'touch-player.min.js',
    styles: ['touchPlayerStyle'],
    displayNames: {
      touchVideoPlayer: '播放器触摸支持',
      touchVideoPlayerDoubleTapControl: '启用双击控制',
    },
  },
  expandDanmakuList: {
    path: 'expand-danmaku.min.js',
    displayNames: {
      expandDanmakuList: '自动展开弹幕列表',
      expandDanmakuListIgnoreMediaList: '合集类页面不展开',
    },
  },
  removeAds: {
    path: 'remove-promotions.min.js',
    style: 'instant',
    displayNames: {
      removeAds: '删除广告',
      showBlockedAdsTip: '显示占位文本',
      preserveEventBanner: '保留活动横幅',
    },
  },
  watchLaterRedirect: {
    path: 'watchlater.min.js',
    displayNames: {
      watchLaterRedirect: '稍后再看重定向',
      watchLaterRedirectPage: '重定向稍后再看页面',
      watchLaterRedirectNavbar: '重定向顶栏',
    },
  },
  hideTopSearch: '隐藏搜索推荐',
  harunaScale: {
    reloadable: true,
    displayNames: {
      harunaScale: '缩放直播看板娘',
    },
  },
  removeLiveWatermark: {
    path: 'remove-watermark.min.js',
    reloadable: true,
    displayNames: {
      removeLiveWatermark: '删除直播水印',
    },
  },
  fullTweetsTitle: {
    reloadable: true,
    style: 'instant',
    displayNames: {
      fullTweetsTitle: '展开动态标题',
    },
  },
  fullPageTitle: {
    style: 'instant',
    reloadable: true,
    displayNames: {
      fullPageTitle: '展开选集列表',
    },
  },
  viewCover: {
    dependencies: ['imageViewerHtml', 'videoInfo', 'title'],
    styles: ['imageViewerStyle'],
    displayNames: {
      viewCover: '查看封面',
    },
  },
  notifyNewVersion: '检查更新',
  toast: {
    style: 'instant',
    displayNames: {
      toast: '显示消息',
      toastInternalError: '显示内部错误消息',
    },
  },
  removeVideoTopMask: {
    path: 'remove-top-mask.min.js',
    reloadable: true,
    displayNames: {
      removeVideoTopMask: '删除视频标题层',
    },
  },
  darkSchedule: {
    displayNames: {
      darkSchedule: '夜间模式计划时段',
      darkScheduleStart: '起始时间',
      darkScheduleEnd: '结束时间',
    },
  },
  clearCache: {
    displayNames: {
      useCache: '启用缓存',
    },
  },
  videoPackage: {
    path: 'download-package.min.js',
  },
  downloadVideo: {
    html: true,
    style: 'instant',
    dependencies: ['title', 'videoInfo', 'videoPackage'],
    displayNames: {
      downloadVideo: '下载视频',
      videoPackage: '下载视频打包器',
      batchDownload: '批量下载',
      aria2Rpc: 'aria2 RPC',
    },
  },
  downloadDanmaku: {
    dependencies: ['title', 'videoInfo', 'danmakuConverter'],
    displayNames: {
      downloadDanmaku: '下载弹幕',
    },
  },
  danmakuConverter: {},
  videoInfo: {},
  videoStory: {},
  about: {
    alwaysPreview: true,
    html: true,
    style: 'important',
    displayNames: {
      about: '关于',
    },
  },
  customControlBackground: {
    reloadable: true,
    style: {
      key: 'customControlBackgroundStyle',
    },
    displayNames: {
      customControlBackground: '控制栏着色',
      customControlBackgroundOpacity: '不透明度',
    },
  },
  useDefaultPlayerMode: {
    path: 'default-player-mode.min.js',
    displayNames: {
      useDefaultPlayerMode: '使用默认播放器模式',
      defaultPlayerMode: '默认播放器模式',
      autoLightOff: '播放时自动关灯',
      applyPlayerModeOnPlay: '播放时应用模式',
    },
    dropdown: {
      key: 'defaultPlayerMode',
      items: ['常规', '宽屏', '网页全屏', '全屏'],
    },
  },
  useDefaultVideoQuality: {
    path: 'default-video-quality.min.js',
    displayNames: {
      useDefaultVideoQuality: '使用默认视频画质',
      defaultVideoQuality: '画质设定',
    },
    dropdown: {
      key: 'defaultVideoQuality',
      items: ['4K', '1080P60', '1080P+', '1080P', '720P60', '720P', '480P', '360P', '自动'],
    },
  },
  comboLike: '素质三连触摸支持',
  autoContinue: {
    displayNames: {
      autoContinue: '自动从历史记录点播放',
      allowJumpContinue: '允许跨集跳转',
    },
  },
  airborne: {
    reloadable: true,
    style: true,
    displayNames: {
      airborne: '启用空降',
    },
  },
  expandDescription: {
    style: 'instant',
    reloadable: true,
    displayNames: {
      expandDescription: '自动展开视频简介',
    },
  },
  skipChargeList: {
    style: 'instant',
    displayNames: {
      skipChargeList: '跳过充电鸣谢',
    },
  },
  medalHelper: {
    html: true,
    style: true,
    displayNames: {
      medalHelper: '直播勋章快速更换',
      autoMatchMedal: '自动选择当前直播间勋章',
    },
  },
  showDeadVideoTitle: {
    displayNames: {
      showDeadVideoTitle: '显示失效视频信息',
      useBiliplusRedirect: '失效视频重定向',
      deadVideoTitleProvider: '信息来源',
    },
  },
  useCommentStyle: {
    path: 'comment.min.js',
    reloadable: true,
    style: 'important',
    displayNames: {
      useCommentStyle: '简化评论区',
    },
  },
  title: {
    displayNames: {
      filenameFormat: '文件命名格式',
      batchFilenameFormat: '批量命名格式',
    },
  },
  imageResolution: '高分辨率图片',
  biliplusRedirect: 'BiliPlus跳转支持',
  framePlayback: {
    reloadable: true,
    style: 'instant',
    html: true,
    displayNames: {
      framePlayback: '启用逐帧调整',
    },
  },
  downloadAudio: '下载音频',
  i18n: {
    path: 'i18n.min.js',
    alwaysPreview: true,
    style: 'important',
    displayNames: {
      i18n: '界面翻译',
      i18nLanguage: '语言',
    },
    dropdown: {
      key: 'i18nLanguage',
      items: ['日本語', 'English'],
    },
  },
  i18nEnglish: {
    path: 'i18n.en-US.min.js',
    alwaysPreview: true,
  },
  i18nJapanese: {
    path: 'i18n.ja-JP.min.js',
    alwaysPreview: true,
  },
  i18nTraditionalChinese: {
    path: 'i18n.zh-TW.min.js',
    alwaysPreview: true,
  },
  i18nGerman: {
    path: 'i18n.de-DE.min.js',
    alwaysPreview: true,
  },
  playerFocus: {
    displayNames: {
      playerFocus: '自动定位到播放器',
      playerFocusOffset: '定位偏移量',
    },
  },
  simplifyLiveroom: {
    style: 'important',
    displayNames: {
      simplifyLiveroom: '简化直播间',
    },
  },
  customNavbarComponent: {},
  customNavbar: {
    reloadable: true,
    style: 'instant',
    html: true,
    dependencies: ['customNavbarComponent'],
    displayNames: {
      customNavbar: '使用自定义顶栏',
      customNavbarComponent: '顶栏组件',
      customNavbarSeasonLogo: '使用季节Logo',
      customNavbarFill: '主题色填充',
      customNavbarTransparent: '透明填充',
      customNavbarShadow: '投影',
      customNavbarCompact: '紧凑布局',
      customNavbarBlur: '背景模糊',
      customNavbarBlurOpacity: '模糊层不透明度',
      customNavbarGlobalFixed: '全局固定',
    },
  },
  outerWatchlater: {
    reloadable: true,
    style: true,
    displayNames: {
      outerWatchlater: '外置稍后再看',
    },
  },
  playerShadow: {
    reloadable: true,
    displayNames: {
      playerShadow: '播放器投影',
    },
  },
  narrowDanmaku: {
    reloadable: true,
    displayNames: {
      narrowDanmaku: '强制保留弹幕栏',
    },
  },
  videoScreenshot: {
    path: 'screenshot.min.js',
    reloadable: true,
    style: true,
    displayNames: {
      videoScreenshot: '启用视频截图',
    },
    dependencies: ['title'],
  },
  hideBangumiReviews: {
    reloadable: true,
    displayNames: {
      hideBangumiReviews: '隐藏番剧点评',
    },
  },
  noLiveAutoplay: {
    displayNames: {
      noLiveAutoplay: '直播首页静音',
      hideHomeLive: '隐藏推荐直播',
    },
  },
  noMiniVideoAutoplay: '禁止小视频自动播放',
  foldComment: {
    style: true,
    displayNames: {
      foldComment: '快速收起动态评论区',
    },
  },
  useDefaultVideoSpeed: {
    path: 'remember-video-speed.min.js',
    displayNames: {
      useDefaultVideoSpeed: '记忆上次播放速度',
    },
  },
  autoDraw: '直播间自动领奖',
  keymap: {
    reloadable: true,
    style: true,
    displayNames: {
      keymap: '快捷键扩展',
      keymapPreset: '快捷键预设',
    },
    dropdown: {
      key: 'keymapPreset',
      items: ['Default', 'YouTube', 'HTML5Player', 'PotPlayer'],
    },
  },
  doubleClickFullscreen: '双击全屏',
  simplifyHome: {
    style: 'instant',
    displayNames: {
      simplifyHome: '简化首页',
      simplifyHomeStyle: '首页风格',
      simpleHomeWheelScroll: '允许横向滚动',
    },
    dropdown: {
      key: 'simplifyHomeStyle',
      items: ['清爽', '极简'],
    },
  },
  fullActivityContent: {
    reloadable: true,
    displayNames: {
      fullActivityContent: '展开动态内容',
    },
  },
  activityImageSaver: '解除动态存图限制',
  selectableColumnText: {
    reloadable: true,
    displayNames: {
      selectableColumnText: '专栏文字选择',
    },
  },
  miniPlayerTouchMove: {
    style: true,
    reloadable: true,
    displayNames: {
      miniPlayerTouchMove: '迷你播放器触摸拖动',
    },
  },
  feedsFilter: {
    reloadable: true,
    displayNames: {
      feedsFilter: '动态过滤器',
    },
  },
  hideBangumiSponsors: {
    reloadable: true,
    displayNames: {
      hideBangumiSponsors: '隐藏番剧承包',
    },
  },
  hideRecommendLive: {
    reloadable: true,
    displayNames: {
      hideRecommendLive: '隐藏推荐直播',
    },
  },
  hideRelatedVideos: {
    reloadable: true,
    displayNames: {
      hideRelatedVideos: '隐藏视频推荐',
    },
  },
  urlParamsClean: '网址参数清理',
  collapseLiveSideBar: {
    style: 'instant',
    reloadable: true,
    displayNames: {
      collapseLiveSideBar: '收起直播间侧栏',
    },
  },
  downloadSubtitle: '下载字幕',
  feedsTranslate: {
    style: true,
    displayNames: {
      feedsTranslate: '动态翻译',
      feedsTranslateProvider: '翻译器',
    },
    dropdown: {
      key: 'feedsTranslateProvider',
      items: ['Bing', 'Google', 'GoogleCN'],
    },
  },
  recordLiveDanmaku: '直播弹幕记录器',
  useDefaultLiveQuality: {
    path: 'default-live-quality.min.js',
    displayNames: {
      useDefaultLiveQuality: '使用默认直播画质',
      defaultLiveQuality: '默认直播画质',
    },
    dropdown: {
      key: 'defaultLiveQuality',
      items: ['原画', '4K', '蓝光', '超清', '高清', '流畅'],
    },
  },
  downloadLiveRecords: '下载直播录像',
  bvidConvert: {
    style: true,
    displayNames: {
      bvidConvert: 'BV号转换',
      preferAvUrl: '网址AV号转换',
    },
  },
  fixedSidebars: {
    reloadable: true,
    displayNames: {
      fixedSidebars: '强制固定顶栏与侧栏',
    },
  },
  livePip: '直播画中画',
  extendFeedsLive: {
    style: true,
    displayNames: {
      extendFeedsLive: '直播信息扩充',
    },
  },
  playerOnTop: {
    reloadable: true,
    displayNames: {
      playerOnTop: '播放器置顶',
    },
  },
  darkColorScheme: '夜间模式跟随系统',
  restoreFloors: '评论楼层显示',
  quickFavorite: {
    style: true,
    reloadable: true,
    displayNames: {
      quickFavorite: '启用快速收藏',
    },
  },
  disableFeedsDetails: {
    reloadable: true,
    displayNames: {
      disableFeedsDetails: '禁止跳转动态详情',
    },
  },
  danmakuSendBar: {
    reloadable: true,
    style: true,
    displayNames: {
      danmakuSendBar: '直播全屏弹幕栏',
    },
  },
  showCoverBeforePlay: {
    reloadable: true,
    style: true,
    displayNames: {
      showCoverBeforePlay: '播放前显示封面',
    },
  },
  volumeOverdrive: '音量增幅',
  seoJump: 'SEO页面重定向',
  commentsTranslate: '评论翻译',
  copyFeedsLink: '动态链接复制',
  copyCommentLink: '评论链接复制',
  unfoldFeeds: '动态反折叠',
  feedsImageExporter: '动态图片导出',
  columnImageExporter: '专栏图片导出',
  homeHidden: {
    style: true,
    displayNames: {
      homeHidden: '首页过滤',
    },
  },
  extendVideoSpeed: '扩展视频倍数菜单',
  menuRepeatVideo: '视频右键菜单循环播放',
  removeVideoPopup: {
    displayNames: {
      removeVideoPopup: '删除关联视频弹窗',
    },
    reloadable: true,
  },
  removeGuidePopup: {
    displayNames: {
      removeGuidePopup: '删除关注弹窗',
    },
    reloadable: true,
  },
  removeVotePopup: {
    displayNames: {
      removeVotePopup: '删除投票弹窗',
    },
    reloadable: true,
  },
  liveSpeedBoost: '直播自动追帧',
  checkInCenter: '签到助手',
  fullscreenGiftBox: {
    reloadable: true,
    style: true,
    displayNames: {
      fullscreenGiftBox: '直播全屏包裹',
    },
  },
  autoPlayControl: '传统连播模式',
  scrollOutPlayer: {
    displayNames: {
      scrollOutPlayer: '当播放器退出页面时',
      scrollOutPlayerTriggerPlace: '选定触发位置',
      scrollOutPlayerAutoPause: '自动暂停',
      scrollOutPlayerAutoLightOn: '自动开灯'
    },
    reloadable: true,
    dropdown:{
      key: 'scrollOutPlayerTriggerPlace',
      items: ['视频顶部' ,'视频中间', '视频底部']
    }
  }
}
export const resourceManifest = Resource.manifest
