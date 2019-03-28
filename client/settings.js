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
    toastInternalError: false,
    i18n: false,
    i18nLanguage: "日本語",
    playerFocus: false,
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
    for (const key in settings)
    {
        const value = GM_getValue(key, settings[key]);
        if (settings[key] !== undefined && value.constructor === Object)
        {
            settings[key] = Object.assign(settings[key], value);
        }
        else
        {
            settings[key] = value;
        }
    }
    for (const key in fixedSettings)
    {
        settings[key] = fixedSettings[key];
    }
}
export function saveSettings(newSettings)
{
    for (const key in settings)
    {
        GM_setValue(key, newSettings[key]);
    }
}
export function onSettingsChange(change)
{
    for (const key in settings)
    {
        GM_addValueChangeListener(key, change);
    }
}