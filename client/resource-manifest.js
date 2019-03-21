Resource.manifest = {
    style: {
        path: "style.min.css",
    },
    oldStyle: {
        path: "old.min.css",
    },
    scrollbarStyle: {
        path: "scrollbar.min.css",
    },
    darkStyle: {
        path: "dark.min.css",
    },
    darkStyleImportant: {
        path: "dark-important.min.css",
    },
    darkStyleNavBar: {
        path: "dark-navbar.min.css",
    },
    touchPlayerStyle: {
        path: "touch-player.min.css",
    },
    navbarOverrideStyle: {
        path: "override-navbar.min.css",
    },
    noBannerStyle: {
        path: "no-banner.min.css",
    },
    removeAdsStyle: {
        path: "remove-promotions.min.css",
    },
    guiSettingsStyle: {
        path: "gui-settings.min.css",
    },
    fullTweetsTitleStyle: {
        path: "full-tweets-title.min.css",
    },
    imageViewerStyle: {
        path: "image-viewer.min.css",
    },
    toastStyle: {
        path: "toast.min.css",
    },
    blurVideoControlStyle: {
        path: "blur-video-control.min.css",
    },
    downloadVideoStyle: {
        path: "download-video.min.css",
    },
    guiSettingsHtml: {
        path: "gui-settings.min.html",
    },
    imageViewerHtml: {
        path: "image-viewer.min.html",
    },
    downloadVideoHtml: {
        path: "download-video.min.html",
    },
    iconsStyle: {
        path: "icons.min.css",
    },
    settingsSideBar: {
        path: "settings-side-bar.min.js",
    },
    textValidate: {
        path: "text-validate.min.js",
    },
    themeColors: {
        path: "theme-colors.min.js",
    },
    settingsTooltipStyle: {
        path: "settings-tooltip.min.css",
    },
    settingsTooltip: {
        path: "settings-tooltip.min.js",
        dependencies: [
            "settingsTooltipStyle"
        ],
    },
    settingsSearch: {
        path: "settings-search.min.js",
        dependencies: [
            "settingsTooltip"
        ],
    },
    guiSettings: {
        path: "gui-settings.min.js",
        dependencies: [
            "guiSettingsHtml",
            "textValidate",
            "settingsSideBar",
            "themeColors",
            "settingsTooltip",
            "settingsSearch",
        ],
        styles: [
            "guiSettingsStyle",
            {
                key: "iconsStyle",
                important: true,
            },
        ],
        displayNames: {
            guiSettings: "设置",
            blurSettingsPanel: "模糊设置面板背景",
            clearCache: "清除缓存",
            settingsTooltip: "设置项帮助",
            settingsSearch: "搜索设置",
        },
    },
    useDarkStyle: {
        path: "dark-styles.min.js",
        styles: [
            "darkStyle",
            "scrollbarStyle",
            {
                key: "darkStyleNavBar",
                important: true,
                condition()
                {
                    return !settings.useNewStyle && ($("#banner_link").length === 0 ||
                        $("#banner_link").length > 0 &&
                        settings.overrideNavBar &&
                        !settings.showBanner);
                }
            },
            {
                key: "darkStyleImportant",
                important: true,
                condition: () => true,
            },
        ],
        displayNames: {
            useDarkStyle: "夜间模式",
        },
    },
    tweetsStyle: {
        path: "tweets.min.css",
    },
    useNewStyle: {
        path: "new-styles.min.js",
        dependencies: [
            "style",
            "oldStyle",
        ],
        styles: [
            {
                key: "scrollbarStyle",
                condition: () => document.URL !== `https://h.bilibili.com/`,
            },
            "tweetsStyle",
        ],
        displayNames: {
            useNewStyle: "样式调整",
            blurBackgroundOpacity: "顶栏(对横幅)透明度",
        },
    },
    overrideNavBar: {
        path: "override-navbar.min.js",
        styles: [
            "navbarOverrideStyle",
            "tweetsStyle",
            {
                key: "noBannerStyle",
                condition: () => !settings.showBanner
            }
        ],
        displayNames: {
            overrideNavBar: "搜索栏置顶",
            showBanner: "显示顶部横幅",
            preserveRank: "显示排行榜图标",
        },
    },
    touchNavBar: {
        path: "touch-navbar.min.js",
        displayNames: {
            touchNavBar: "顶栏触摸优化",
        },
    },
    touchVideoPlayer: {
        path: "touch-player.min.js",
        styles: [
            "touchPlayerStyle",
        ],
        displayNames: {
            touchVideoPlayer: "播放器触摸支持",
            touchVideoPlayerAnimation: "启用实验性动画效果",
            touchVideoPlayerDoubleTapControl: "启用双击控制",
        },
    },
    expandDanmakuList: {
        path: "expand-danmaku.min.js",
        displayNames: {
            expandDanmakuList: "自动展开弹幕列表",
        },
    },
    removeAds: {
        path: "remove-promotions.min.js",
        styles: [
            "removeAdsStyle",
        ],
        displayNames: {
            removeAds: "删除广告",
        },
    },
    watchLaterRedirect: {
        path: "watchlater.min.js",
        displayNames: {
            watchLaterRedirect: "稍后再看重定向",
        },
    },
    hideTopSearch: {
        path: "hide-top-search.min.js",
        displayNames: {
            hideTopSearch: "隐藏搜索推荐",
        },
    },
    harunaScale: {
        path: "haruna-scale.min.js",
        displayNames: {
            harunaScale: "缩放直播看板娘",
        },
    },
    removeLiveWatermark: {
        path: "remove-watermark.min.js",
        displayNames: {
            removeLiveWatermark: "删除直播水印",
        },
    },
    fullTweetsTitle: {
        path: "full-tweets-title.min.js",
        styles: [
            "fullTweetsTitleStyle",
        ],
        displayNames: {
            fullTweetsTitle: "展开动态标题",
        },
    },
    fullPageTitleStyle: {
        path: "full-page-title.min.css",
    },
    fullPageTitle: {
        path: "full-page-title.min.js",
        dependencies: ["fullPageTitleStyle"],
        displayNames: {
            fullPageTitle: "展开选集标题",
        },
    },
    viewCover: {
        path: "view-cover.min.js",
        dependencies: [
            "imageViewerHtml",
            "videoInfo",
            "title",
        ],
        styles: [
            "imageViewerStyle",
        ],
        displayNames: {
            viewCover: "查看封面",
        },
    },
    notifyNewVersion: {
        path: "notify-new-version.min.js",
        displayNames: {
            notifyNewVersion: "检查更新",
        },
    },
    toast: {
        path: "toast.min.js",
        styles: [
            "toastStyle",
        ],
        displayNames: {
            toast: "显示消息",
            toastInternalError: "显示内部错误消息",
        },
    },
    removeVideoTopMask: {
        path: "remove-top-mask.min.js",
        displayNames: {
            removeVideoTopMask: "删除视频标题层",
        },
    },
    blurVideoControl: {
        path: "blur-video-control.min.js",
        styles: [
            "blurVideoControlStyle",
        ],
        displayNames: {
            blurVideoControl: "模糊视频控制栏背景",
        },
    },
    darkSchedule: {
        path: "dark-schedule.min.js",
        displayNames: {
            darkSchedule: "夜间模式计划时段",
            darkScheduleStart: "起始时间",
            darkScheduleEnd: "结束时间",
        },
    },
    clearCache: {
        path: "clear-cache.min.js",
        displayNames: {
            useCache: "启用缓存",
        },
    },
    downloadVideo: {
        path: "download-video.min.js",
        dependencies: [
            "downloadVideoHtml",
            "title",
        ],
        styles: [
            "downloadVideoStyle",
        ],
        displayNames: {
            "downloadVideo": "下载视频",
        },
    },
    downloadDanmaku: {
        path: "download-danmaku.min.js",
        dependencies: [
            "title",
            "videoInfo",
            "danmakuConverter",
        ],
        displayNames: {
            "downloadDanmaku": "下载弹幕",
        },
    },
    danmakuConverter: {
        path: "danmaku-converter.min.js"
    },
    videoInfo: {
        path: "video-info.min.js",
    },
    aboutHtml: {
        path: "about.min.html",
    },
    aboutStyle: {
        path: "about.min.css",
    },
    about: {
        path: "about.min.js",
        dependencies: [
            "aboutHtml",
        ],
        styles: [
            "aboutStyle",
        ],
        displayNames: {
            "about": "关于",
        }
    },
    customControlBackgroundStyle: {
        path: "custom-control-background.min.css",
    },
    customControlBackground: {
        path: "custom-control-background.min.js",
        styles: [
            {
                key: "customControlBackgroundStyle",
                condition: () => settings.customControlBackgroundOpacity > 0
            },
        ],
        displayNames: {
            customControlBackground: "控制栏着色",
            customControlBackgroundOpacity: "不透明度",
        },
    },
    useDefaultPlayerMode: {
        path: "default-player-mode.min.js",
        displayNames: {
            useDefaultPlayerMode: "使用默认播放器模式",
            defaultPlayerMode: "默认播放器模式",
            autoLightOff: "播放时自动关灯",
            applyPlayerModeOnPlay: "播放时应用模式",
        },
        dropdown: {
            key: "defaultPlayerMode",
            items: ["常规", "宽屏", "网页全屏", "全屏"],
        },
    },
    useDefaultVideoQuality: {
        path: "default-video-quality.min.js",
        displayNames: {
            useDefaultVideoQuality: "使用默认视频画质",
            defaultVideoQuality: "画质设定",
        },
        dropdown: {
            key: "defaultVideoQuality",
            items: ["1080P60", "1080P+", "1080P", "720P60", "720P", "480P", "360P", "自动"],
        },
    },
    comboLike: {
        path: "combo-like.min.js",
        displayNames: {
            comboLike: "素质三连触摸支持",
        },
    },
    autoContinue: {
        path: "auto-continue.min.js",
        displayNames: {
            autoContinue: "自动从历史记录点播放",
        },
    },
    expandDescriptionStyle: {
        path: "expand-description.min.css"
    },
    expandDescription: {
        path: "expand-description.min.js",
        styles: [
            "expandDescriptionStyle"
        ],
        displayNames: {
            expandDescription: "自动展开视频简介"
        }
    },
    defaultDanmakuSettingsStyle: {
        path: "default-danmaku-settings.min.css",
    },
    useDefaultDanmakuSettings: {
        path: "default-danmaku-settings.min.js",
        styles: [
            {
                key: "defaultDanmakuSettingsStyle",
                condition: () => settings.rememberDanmakuSettings,
            },
        ],
        displayNames: {
            useDefaultDanmakuSettings: "使用默认弹幕设置",
            enableDanmaku: "开启弹幕",
            rememberDanmakuSettings: "记住弹幕设置",
        },
    },
    skipChargeListStyle: {
        path: "skip-charge-list.min.css",
    },
    skipChargeList: {
        path: "skip-charge-list.min.js",
        styles: [
            "skipChargeListStyle",
        ],
        displayNames: {
            skipChargeList: "跳过充电鸣谢",
        }
    },
    playerLayout: {
        path: "default-player-layout.min.js",
        displayNames: {
            useDefaultPlayerLayout: "指定播放器布局",
            defaultPlayerLayout: "视频区布局",
            defaultBangumiLayout: "番剧区布局",
        },
        dropdown: [
            {
                key: "defaultPlayerLayout",
                items: ["旧版", "新版"]
            },
            {
                key: "defaultBangumiLayout",
                items: ["旧版", "新版"]
            },
        ],
    },
    compactLayoutStyle: {
        path: "compact-layout.min.css",
    },
    compactLayout: {
        path: "compact-layout.min.js",
        styles: [
            {
                key: "compactLayoutStyle",
                important: true,
                condition()
                {
                    return [
                        "https://www.bilibili.com/",
                        "https://www.bilibili.com/watchlater/#/list",
                    ].indexOf(location.href.replace(location.search, '')) !== -1;
                },
            },
        ],
        displayNames: {
            compactLayout: "首页使用紧凑布局",
        }
    },
    medalHelper: {
        path: "medal-helper.min.js",
        styles: ["medalHelperStyle"],
        dependencies: ["medalHelperHtml"],
        displayNames: {
            medalHelper: "直播勋章快速更换"
        }
    },
    medalHelperStyle: {
        path: "medal-helper.min.css",
    },
    medalHelperHtml: {
        path: "medal-helper.min.html",
    },
    showDeadVideoTitle: {
        path: "show-dead-video-title.min.js",
        displayNames: {
            showDeadVideoTitle: "显示失效视频信息",
            useBiliplusRedirect: "失效视频重定向",
        },
    },
    autoPlay: {
        path: "auto-play.min.js",
        displayNames: {
            autoPlay: "自动播放视频",
        }
    },
    useCommentStyle: {
        path: "comment.min.js",
        styles: [
            {
                key: "commentStyle",
                important: true,
                condition: () => true,
            },
            {
                key: "commentDarkStyle",
                important: true,
                condition: () => settings.useDarkStyle,
            },
        ],
        displayNames: {
            useCommentStyle: "简化评论区",
        },
    },
    commentStyle: {
        path: "comment.min.css"
    },
    commentDarkStyle: {
        path: "comment-dark.min.css"
    },
    title: {
        path: "title.min.js"
    },
    imageResolution: {
        path: "image-resolution.min.js",
        displayNames: {
            imageResolution: "总是显示原图",
        },
    },
    biliplusRedirect: {
        path: "biliplus-redirect.min.js",
        displayNames: {
            biliplusRedirect: "BiliPlus跳转支持",
        }
    },
    // framePlaybackHtml: {
    //     path: "frame-playback.min.html",
    // },
    // framePlaybackStyle: {
    //     path: "frame-playback.min.css",
    // },
    framePlayback: {
        path: "frame-playback.min.js",
        style: true,
        html: true,
        displayNames: {
            framePlayback: "启用逐帧调整",
        },
    },
    downloadAudio: {
        path: "download-audio.min.js",
        displayNames: {
            downloadAudio: "下载音频",
        },
    },
    i18nEnglish: {
        path: "i18n.en-US.min.js",
    },
    i18n: {
        path: "i18n.min.js",
        displayNames: {
            i18n: "界面翻译"
        },
    }
};
export const resourceManifest = Resource.manifest;