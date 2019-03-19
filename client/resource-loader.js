
export function loadResources()
{
    const resourceManifest = {
        style: {
            path: "min/style.min.css",
            order: 10,
        },
        oldStyle: {
            path: "min/old.min.css",
            order: 10,
        },
        scrollbarStyle: {
            path: "min/scrollbar.min.css",
            order: 10,
        },
        darkStyle: {
            path: "min/dark.min.css",
            order: 11,
        },
        darkStyleImportant: {
            path: "min/dark-important.min.css",
        },
        darkStyleNavBar: {
            path: "min/dark-navbar.min.css",
        },
        touchPlayerStyle: {
            path: "min/touch-player.min.css",
            order: 13,
        },
        navbarOverrideStyle: {
            path: "min/override-navbar.min.css",
            order: 14,
        },
        noBannerStyle: {
            path: "min/no-banner.min.css",
            order: 15,
        },
        removeAdsStyle: {
            path: "min/remove-promotions.min.css",
            order: 16,
        },
        guiSettingsStyle: {
            path: "min/gui-settings.min.css",
            order: 12,
        },
        fullTweetsTitleStyle: {
            path: "min/full-tweets-title.min.css",
            order: 17,
        },
        imageViewerStyle: {
            path: "min/image-viewer.min.css",
            order: 18,
        },
        toastStyle: {
            path: "min/toast.min.css",
            order: 19,
        },
        blurVideoControlStyle: {
            path: "min/blur-video-control.min.css",
            order: 20,
        },
        downloadVideoStyle: {
            path: "min/download-video.min.css",
        },
        guiSettingsHtml: {
            path: "min/gui-settings.min.html",
        },
        imageViewerHtml: {
            path: "min/image-viewer.min.html",
        },
        downloadVideoHtml: {
            path: "min/download-video.min.html",
        },
        latestVersion: {
            path: "version.txt",
        },
        iconsStyle: {
            path: "min/icons.min.css",
        },
        settingsSideBar: {
            path: "min/settings-side-bar.min.js",
        },
        textValidate: {
            path: "min/text-validate.min.js",
        },
        themeColors: {
            path: "min/theme-colors.min.js",
        },
        settingsTooltipStyle: {
            path: "min/settings-tooltip.min.css",
        },
        settingsTooltip: {
            path: "min/settings-tooltip.min.js",
            dependencies: [
                "settingsTooltipStyle"
            ],
        },
        settingsSearch: {
            path: "min/settings-search.min.js",
            dependencies: [
                "settingsTooltip"
            ],
        },
        guiSettings: {
            path: "min/gui-settings.min.js",
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
            path: "min/dark-styles.min.js",
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
            path: "min/tweets.min.css",
        },
        useNewStyle: {
            path: "min/new-styles.min.js",
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
            path: "min/override-navbar.min.js",
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
            path: "min/touch-navbar.min.js",
            displayNames: {
                touchNavBar: "顶栏触摸优化",
            },
        },
        touchVideoPlayer: {
            path: "min/touch-player.min.js",
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
            path: "min/expand-danmaku.min.js",
            displayNames: {
                expandDanmakuList: "自动展开弹幕列表",
            },
        },
        removeAds: {
            path: "min/remove-promotions.min.js",
            styles: [
                "removeAdsStyle",
            ],
            displayNames: {
                removeAds: "删除广告",
            },
        },
        watchLaterRedirect: {
            path: "min/watchlater.min.js",
            displayNames: {
                watchLaterRedirect: "稍后再看重定向",
            },
        },
        hideTopSearch: {
            path: "min/hide-top-search.min.js",
            displayNames: {
                hideTopSearch: "隐藏搜索推荐",
            },
        },
        harunaScale: {
            path: "min/haruna-scale.min.js",
            displayNames: {
                harunaScale: "缩放直播看板娘",
            },
        },
        removeLiveWatermark: {
            path: "min/remove-watermark.min.js",
            displayNames: {
                removeLiveWatermark: "删除直播水印",
            },
        },
        fullTweetsTitle: {
            path: "min/full-tweets-title.min.js",
            styles: [
                "fullTweetsTitleStyle",
            ],
            displayNames: {
                fullTweetsTitle: "展开动态标题",
            },
        },
        fullPageTitleStyle: {
            path: "min/full-page-title.min.css",
        },
        fullPageTitle: {
            path: "min/full-page-title.min.js",
            dependencies: ["fullPageTitleStyle"],
            displayNames: {
                fullPageTitle: "展开选集标题",
            },
        },
        viewCover: {
            path: "min/view-cover.min.js",
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
            path: "min/notify-new-version.min.js",
            dependencies: [
                "latestVersion",
            ],
            displayNames: {
                notifyNewVersion: "检查更新",
            },
        },
        toast: {
            path: "min/toast.min.js",
            styles: [
                "toastStyle",
            ],
            displayNames: {
                toast: "显示消息",
                toastInternalError: "显示内部错误消息",
            },
        },
        removeVideoTopMask: {
            path: "min/remove-top-mask.min.js",
            displayNames: {
                removeVideoTopMask: "删除视频标题层",
            },
        },
        blurVideoControl: {
            path: "min/blur-video-control.min.js",
            styles: [
                "blurVideoControlStyle",
            ],
            displayNames: {
                blurVideoControl: "模糊视频控制栏背景",
            },
        },
        darkSchedule: {
            path: "min/dark-schedule.min.js",
            displayNames: {
                darkSchedule: "夜间模式计划时段",
                darkScheduleStart: "起始时间",
                darkScheduleEnd: "结束时间",
            },
        },
        clearCache: {
            path: "min/clear-cache.min.js",
            displayNames: {
                useCache: "启用缓存",
            },
        },
        downloadVideo: {
            path: "min/download-video.min.js",
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
            path: "min/download-danmaku.min.js",
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
            path: "min/danmaku-converter.min.js"
        },
        videoInfo: {
            path: "min/video-info.min.js",
        },
        aboutHtml: {
            path: "min/about.min.html",
        },
        aboutStyle: {
            path: "min/about.min.css",
        },
        about: {
            path: "min/about.min.js",
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
            path: "min/custom-control-background.min.css",
            order: 21
        },
        customControlBackground: {
            path: "min/custom-control-background.min.js",
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
            path: "min/default-player-mode.min.js",
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
            path: "min/default-video-quality.min.js",
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
            path: "min/combo-like.min.js",
            displayNames: {
                comboLike: "素质三连触摸支持",
            },
        },
        autoContinue: {
            path: "min/auto-continue.min.js",
            displayNames: {
                autoContinue: "自动从历史记录点播放",
            },
        },
        expandDescriptionStyle: {
            path: "min/expand-description.min.css"
        },
        expandDescription: {
            path: "min/expand-description.min.js",
            styles: [
                "expandDescriptionStyle"
            ],
            displayNames: {
                expandDescription: "自动展开视频简介"
            }
        },
        defaultDanmakuSettingsStyle: {
            path: "min/default-danmaku-settings.min.css",
        },
        useDefaultDanmakuSettings: {
            path: "min/default-danmaku-settings.min.js",
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
            path: "min/skip-charge-list.min.css",
        },
        skipChargeList: {
            path: "min/skip-charge-list.min.js",
            styles: [
                "skipChargeListStyle",
            ],
            displayNames: {
                skipChargeList: "跳过充电鸣谢",
            }
        },
        playerLayout: {
            path: "min/default-player-layout.min.js",
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
            path: "min/compact-layout.min.css",
        },
        compactLayout: {
            path: "min/compact-layout.min.js",
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
            path: "min/medal-helper.min.js",
            styles: ["medalHelperStyle"],
            dependencies: ["medalHelperHtml"],
            displayNames: {
                medalHelper: "直播勋章快速更换"
            }
        },
        medalHelperStyle: {
            path: "min/medal-helper.min.css",
        },
        medalHelperHtml: {
            path: "min/medal-helper.min.html",
        },
        showDeadVideoTitle: {
            path: "min/show-dead-video-title.min.js",
            displayNames: {
                showDeadVideoTitle: "显示失效视频信息",
                useBiliplusRedirect: "失效视频重定向",
            },
        },
        autoPlay: {
            path: "min/auto-play.min.js",
            displayNames: {
                autoPlay: "自动播放视频",
            }
        },
        useCommentStyle: {
            path: "min/comment.min.js",
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
            path: "min/comment.min.css"
        },
        commentDarkStyle: {
            path: "min/comment-dark.min.css"
        },
        title: {
            path: "min/title.min.js"
        },
        imageResolution: {
            path: "min/image-resolution.min.js",
            displayNames: {
                imageResolution: "总是显示原图",
            },
        },
        biliplusRedirect: {
            path: "min/biliplus-redirect.min.js",
            displayNames: {
                biliplusRedirect: "BiliPlus跳转支持",
            }
        },
        framePlaybackHtml: {
            path: "min/frame-playback.min.html",
        },
        framePlaybackStyle: {
            path: "min/frame-playback.min.css",
        },
        framePlayback: {
            path: "min/frame-playback.min.js",
            dependencies: [
                "framePlaybackHtml",
                "framePlaybackStyle"
            ],
            displayNames: {
                framePlayback: "启用逐帧调整",
            },
        },
        downloadAudio: {
            path: "min/download-audio.min.js",
            displayNames: {
                downloadAudio: "下载音频",
            },
        },
    };
    Resource.root = "https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/";
    Resource.all = {};
    Resource.displayNames = {};
    Resource.reloadables = {
        useDarkStyle: "useDarkStyle",
        showBanner: "overrideNavBar",
    };
    Resource.manifest = resourceManifest;
    for (const [key, data] of Object.entries(resourceManifest))
    {
        const resource = new Resource(data.path, data.order, data.styles);
        resource.key = key;
        if (data.displayNames)
        {
            resource.displayName = data.displayNames[key];
            Object.assign(Resource.displayNames, data.displayNames);
        }
        Resource.all[key] = resource;
    }
    for (const [key, data] of Object.entries(resourceManifest))
    {
        if (data.dependencies)
        {
            Resource.all[key].dependencies = data.dependencies.map(name => Resource.all[name]);
        }
    }
}
