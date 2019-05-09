export const settings = {
    useDarkStyle: false,
    compactLayout: false,
    // showBanner: true,
    hideBanner: false,
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
    customNavbar: true,
    customNavbarFill: true,
    allNavbarFill: true,
    customNavbarShadow: true,
    customNavbarCompact: false,
    customNavbarBlur: false,
    customNavbarOrder: {
        blank1: 0,
        logo: 1,
        category: 2,
        rankingLink: 3,
        drawingLink: 4,
        musicLink: 5,
        gamesIframe: 6,
        livesIframe: 7,
        shopLink: 8,
        mangaLink: 9,
        blank2: 10,
        search: 11,
        userInfo: 12,
        messages: 13,
        activities: 14,
        watchlaterList: 15,
        favoritesList: 16,
        historyList: 17,
        upload: 18,
        blank3: 19
    },
    customNavbarHidden: [],
    customNavbarBoundsPadding: 5,
    playerShadow: false,
    narrowDanmaku: true,
    favoritesRedirect: true,
    outerWatchlater: true,
    hideOldEntry: true,
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
    useNewStyle: false,
    overrideNavBar: false,
    latestVersionLink: "https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview.user.js",
    currentVersion: GM_info.script.version,
};
export const settingsChangeHandlers = {};
export function addSettingsListener(key, handler)
{
    if (!settingsChangeHandlers[key])
    {
        settingsChangeHandlers[key] = [handler];
    }
    else
    {
        settingsChangeHandlers[key].push(handler);
    }
}
export function removeSettingsListener(key, handler)
{
    const handlers = settingsChangeHandlers[key];
    if (!handlers)
    {
        return;
    }
    handlers.splice(handlers.indexOf(handler), 1);
}
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

                const handlers = settingsChangeHandlers[key];
                if (handlers)
                {
                    handlers.forEach(h => h(newValue, value));
                }
                const input = document.querySelector(`input[key=${key}]`);
                if (input !== null)
                {
                    if (input.type === "checkbox")
                    {
                        input.checked = newValue;
                    }
                    else if (input.type === "text")
                    {
                        input.value = newValue;
                    }
                }
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