export const settings = {
    useDarkStyle: false,
    useNewStyle: true,
    compactLayout: false,
    showBanner: true,
    overrideNavBar: true,
    expandDanmakuList: true,
    expandDescription: true,
    watchLaterRedirect: true,
    touchNavBar: false,
    touchVideoPlayer: false,
    customControlBackgroundOpacity: 0.64,
    customControlBackground: true,
    darkScheduleStart: "18:00",
    darkScheduleEnd: "6:00",
    darkSchedule: false,
    blurVideoControl: false,
    toast: true,
    fullTweetsTitle: true,
    fullPageTitle: false,
    removeVideoTopMask: false,
    removeLiveWatermark: true,
    harunaScale: true,
    removeAds: true,
    hideTopSearch: false,
    touchVideoPlayerDoubleTapControl: false,
    touchVideoPlayerAnimation: false,
    customStyleColor: "#00A0D8",
    preserveRank: true,
    blurBackgroundOpacity: 0.382,
    useDefaultPlayerMode: false,
    applyPlayerModeOnPlay: true,
    defaultPlayerMode: "常规",
    useDefaultVideoQuality: false,
    defaultVideoQuality: "自动",
    useDefaultDanmakuSettings: false,
    enableDanmaku: true,
    rememberDanmakuSettings: false,
    danmakuSettings: {
        subtitlesPreserve: false,
        smartMask: false,
    },
    defaultPlayerLayout: "新版",
    defaultBangumiLayout: "旧版",
    useDefaultPlayerLayout: false,
    skipChargeList: false,
    comboLike: false,
    autoLightOff: false,
    useCache: true,
    autoContinue: false,
    autoPlay: false,
    showDeadVideoTitle: false,
    useBiliplusRedirect: false,
    biliplusRedirect: false,
    framePlayback: true,
    useCommentStyle: true,
    imageResolution: false,
    imageResolutionScale: "auto",
    toastInternalError: false,
    i18n: false,
    i18nLanguage: "日本語",
    playerFocus: false,
    playerFocusOffset: -10,
    oldTweets: false,
    simplifyLiveroom: false,
    simplifyLiveroomSettings: {
        vip: true,
        fansMedal: true,
        title: true,
        userLevel: true,
        guard: true,
        systemMessage: true,
        welcomeMessage: true,
        popup: false,
        skin: false,
    },
    customNavbar: false,
    customNavbarSettings: {
        fill: true,
        shadow: true,
    },
    favoritesRedirect: true,
    outerWatchlater: true,
    cache: {},
};
const fixedSettings = {
    guiSettings: true,
    viewCover: true,
    notifyNewVersion: true,
    clearCache: true,
    downloadVideo: true,
    downloadDanmaku: true,
    downloadAudio: true,
    playerLayout: true,
    medalHelper: true,
    about: false,
    forceWide: false,
    latestVersionLink: "https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview.user.js",
    currentVersion: GM_info.script.version,
};
export function loadSettings()
{
    for (const key in fixedSettings)
    {
        settings[key] = fixedSettings[key];
        GM_setValue(key, fixedSettings[key]);
    }
    for (const key in settings)
    {
        let value = GM_getValue(key);
        if (value === undefined)
        {
            value = settings[key];
            GM_setValue(key, settings[key]);
        }
        else if (settings[key] !== undefined && value.constructor === Object)
        {
            value = Object.assign(settings[key], value);
        }
        Object.defineProperty(settings, key, {
            get()
            {
                return value;
            },
            set(newValue)
            {
                value = newValue;
                GM_setValue(key, newValue);
            },
        });
        // if (settings[key] !== undefined && value.constructor === Object)
        // {
        //     settings[key] = Object.assign(settings[key], value);
        // }
        // else
        // {
        //     settings[key] = value;
        // }
    }
}
export function saveSettings(newSettings)
{
    // for (const key in settings)
    // {
    //     GM_setValue(key, newSettings[key]);
    // }
}
export function onSettingsChange()
{
    // for (const key in settings)
    // {
    //     GM_addValueChangeListener(key, change);
    // }
    console.warn("此功能已弃用.");
}