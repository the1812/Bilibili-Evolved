declare global {
  interface MonkeyXhrResponse {
    finalUrl: string
    readyState: number
    status: number
    statusText: string
    responseHeaders: any
    response: any
    responseXML: Document
    responseText: string
  }
  interface MonkeyXhrBasicDetails {
    method: 'GET' | 'POST' | 'HEAD'
    url: string
    headers?: { [name: string]: string },
    data?: string
    binary?: boolean
    timeout?: number
    context?: any
    responseType?: 'arraybuffer' | 'blob' | 'json'
    overrideMimeType?: string
    anonymous?: boolean
    fetch?: boolean
    username?: string
    password?: string
  }
  interface MonkeyXhrDetails extends MonkeyXhrBasicDetails {
    onabort?: (response: MonkeyXhrResponse) => void
    onerror?: (response: MonkeyXhrResponse) => void
    onloadstart?: (response: MonkeyXhrResponse) => void
    onprogress?: (response: MonkeyXhrResponse) => void
    onreadystatechange?: (response: MonkeyXhrResponse) => void
    ontimeout?: (response: MonkeyXhrResponse) => void
    onload?: (response: MonkeyXhrResponse) => void
  }
  type RunAtOptions = "document-start" | "document-end" | "document-idle" | "document-body" | "context-menu"
  type DanmakuOption = '无' | 'XML' | 'ASS'
  type DashCodec = 'AVC/H.264' | 'HEVC/H.265'
  type Pattern = string
  interface RpcOption {
    secretKey: string
    baseDir: string
    dir: string
    host: string
    port: string
    method: 'get' | 'post'
    skipByDefault: boolean
    maxDownloadLimit: string
    [key: string]: any
  }
  interface RpcOptionProfile extends RpcOption {
    name: string
  }
  interface SearchHistoryItem {
    keyword: string
    count: number
    date: string
  }
  interface CustomStyle {
    style: string
    name: string
    displayName: string
    enabled: boolean
    mode?: 'default' | 'instant' | 'important'
  }
  interface MonkeyInfo {
    script: {
      author: string
      copyright: string
      description: string
      excludes: string[]
      homepage: string
      icon: string
      icon64: string
      includes: string[]
      lastUpdated: number
      matches: string[]
      downloadMode: string
      name: string
      namespace: string
      options: {
        awareOfChrome: boolean
        compat_arrayleft: boolean
        compat_foreach: boolean
        compat_forvarin: boolean
        compat_metadata: boolean
        compat_prototypes: boolean
        compat_uW_gmonkey: boolean
        noframes: boolean
        override: {
          excludes: false
          includes: false
          orig_excludes: string[]
          orig_includes: string[]
          use_excludes: string[]
          use_includes: string[]
        }
        run_at: RunAtOptions
      }
      position: number
      resources: string[]
      "run-at": RunAtOptions
      system: boolean
      unwrap: boolean
      version: string
    }
    scriptMetaStr: string
    scriptSource: string
    scriptUpdateURL: string
    scriptWillUpdate: boolean
    scriptHandler: string
    isIncognito: boolean
    version: string
  }
  interface CustomNavbarComponents {
    blank1: number
    logo: number
    category: number
    rankingLink: number
    drawingLink: number
    musicLink: number
    gamesIframe: number
    livesIframe: number
    shopLink: number
    mangaLink: number
    blank2: number
    search: number
    userInfo: number
    messages: number
    activities: number
    bangumi: number
    watchlaterList: number
    favoritesList: number
    historyList: number
    upload: number
    blank3: number
  }
  type CustomNavbarOrders = { [key in keyof CustomNavbarComponents]: number }
  interface SimpleHomeCategoryOrders {
    anime: number
    bangumi: number
    china: number
    manga: number
    music: number
    dance: number
    game: number
    tech: number
    digital: number
    life: number
    kichiku: number
    fashion: number
    ads: number
    entertainment: number
    column: number
    movie: number
    tv: number
    film: number
    documentary: number
    [key: string]: number
  }
  const unsafeWindow: Window
  const UserAgent: string
  const EmptyImageUrl: string
  interface Window {
    aid: string | undefined
    cid: string | undefined
    pageno: string | number | undefined
    $: JQueryStatic
    [key: string]: any
  }
  class SpinQuery {
    static condition<T>(query: () => T, condition: (queryResult: T) => boolean, success: (queryResult: T) => void, failed?: () => void): void
    static condition<T>(query: () => T, condition: (queryResult: T) => boolean): Promise<T>
    static select<T>(query: () => T, action: (queryResult: T) => void, failed?: () => void): void
    static select<T>(query: () => T): Promise<T>
    static select(query: string): Promise<HTMLElement | null>
    static select(query: string, action: (queryResult: HTMLElement) => void, failed?: () => void): void
    static any<T>(query: () => T, action: (queryResult: T) => void, failed?: () => void): void
    static any<T>(query: () => T): Promise<T>
    static any(query: string): Promise<JQuery>
    static any(query: string, action: (queryResult: JQuery) => void, failed?: () => void): void
    static count<T>(query: () => T, count: number, success: (queryResult: T) => void, failed?: () => void): void
    static count<T>(query: () => T, count: number): Promise<T>
    static count(query: string, count: number): Promise<NodeListOf<Element>>
    static count(query: string, count: number, success: (queryResult: NodeListOf<Element>) => void, failed?: () => void): Promise<void>
    static unsafeJquery(action: () => void, failed?: () => void): void
    static unsafeJquery(): Promise<void>
  }
  class Toast {
    show(): void
    dismiss(): void
    element: HTMLElement
    key: string
    static show(message: string, title: string, duration?: number): Toast
    static info(message: string, title: string, duration?: number): Toast
    static success(message: string, title: string, duration?: number): Toast
    static error(message: string, title: string, duration?: number): Toast
  }
  class Resource {
    text: string
    key: string
    dependencies: Array<Resource>
    styles: Array<Resource>
    displayName: string
    dropdown: object
    downloaded: boolean
    constructor(url: string, styles?: Resource[])
    download(): Promise<string>
    getStyle(id: string): string
    getPriorStyle(): any
    applyStyle(id: string, important: boolean): void
    static all: object
    static displayNames: object
    static manifest: object
    static root: string
  }
  class ResourceManager {
    import(compnentName: string): any
    getDefaultStyleId(key: string): string
    applyStyle(key: string, id?: string): void
    removeStyle(key: string): void
    applyImportantStyle(key: string, id?: string): void
    applyStyleFromText(text: string, id: string): void
    applyImportantStyleFromText(text: string, id: string): void
    getStyle(key: string, id?: string): void
    toggleStyle(content: string, id: string): void
    toggleStyle(key: string): void
    applyDropdownOptions(): Promise<void>
  }
  const resources: ResourceManager
  class DoubleClickEvent {
    constructor(handler: (e: MouseEvent) => void, singleClickHandler: (e: MouseEvent) => void)
    bind(element: Element): void
    unbind(element: Element): void
  }
  class Ajax {
    static send(xhr: XMLHttpRequest, body: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array>): Promise<string>
    static getText(url: string): Promise<string>
    static getTextWithCredentials(url: string): Promise<string>
    static getJson(url: string): Promise<any>
    static getJsonWithCredentials(url: string): Promise<any>
    static getBlob(url: string): Promise<Blob>
    static getBlobWithCredentials(url: string): Promise<Blob>
    static postText(url: string, body: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array>): Promise<string>
    static postTextWithCredentials(url: string, body: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array>): Promise<string>
    static postJson(url: string, json: any): Promise<any>
    static postJsonWithCredentials(url: string, json: any): Promise<any>
    static monkey(details: MonkeyXhrBasicDetails): Promise<any>
  }
  type Observable = string | Node | Node[] | NodeList
  class Observer {
    constructor(element: Element, callback: MutationCallback)
    start(): Observer
    stop(): Observer
    forEach(callback: (observer: Observer) => void): void
    add(element: Element): Observer
    options: MutationObserverInit
    static observe(observable: Observable, callback: MutationCallback, options: MutationObserverInit): Observer
    static childList(observable: Observable, callback: MutationCallback): Observer
    static childListSubtree(observable: Observable, callback: MutationCallback): Observer
    static attributes(observable: Observable, callback: MutationCallback): Observer
    static attributesSubtree(observable: Observable, callback: MutationCallback): Observer
    static all(observable: Observable, callback: MutationCallback): Observer
    static videoChange(callback: MutationCallback): Promise<void>
  }
  interface BilibiliEvolvedSettings {
    useDarkStyle: boolean,
    useNewStyle: boolean,
    compactLayout: boolean,
    hideBanner: boolean,
    overrideNavBar: boolean,
    expandDanmakuList: boolean,
    expandDescription: boolean,
    watchLaterRedirect: boolean,
    touchNavBar: boolean,
    touchVideoPlayer: boolean,
    customControlBackgroundOpacity: number,
    customControlBackground: boolean,
    darkScheduleStart: string,
    darkScheduleEnd: string,
    darkSchedule: boolean,
    blurVideoControl: boolean,
    toast: boolean,
    fullTweetsTitle: boolean,
    fullPageTitle: boolean,
    removeVideoTopMask: boolean,
    removeLiveWatermark: boolean,
    harunaScale: boolean,
    removeAds: boolean,
    showBlockedAdsTip: boolean,
    hideTopSearch: boolean,
    touchVideoPlayerDoubleTapControl: boolean,
    touchVideoPlayerAnimation: boolean,
    customStyleColor: string,
    preserveRank: boolean,
    blurBackgroundOpacity: number,
    useDefaultPlayerMode: boolean,
    applyPlayerModeOnPlay: boolean,
    defaultPlayerMode: string,
    useDefaultVideoQuality: boolean,
    defaultVideoQuality: string,
    useDefaultDanmakuSettings: boolean,
    enableDanmaku: boolean,
    rememberDanmakuSettings: boolean,
    danmakuSettings: {
      subtitlesPreserve: boolean,
      smartMask: boolean,
    },
    defaultPlayerLayout: string,
    defaultBangumiLayout: string,
    useDefaultPlayerLayout: boolean,
    skipChargeList: boolean,
    comboLike: boolean,
    autoLightOff: boolean,
    useCache: boolean,
    autoContinue: boolean,
    allowJumpContinue: boolean,
    autoPlay: boolean,
    showDeadVideoTitle: boolean,
    deadVideoTitleProvider: '稍后再看' | 'BiliPlus',
    useBiliplusRedirect: boolean,
    biliplusRedirect: boolean,
    framePlayback: boolean,
    useCommentStyle: boolean,
    imageResolution: boolean,
    imageResolutionScale: string,
    toastInternalError: boolean,
    i18n: boolean,
    i18nLanguage: string,
    playerFocus: boolean,
    playerFocusOffset: number,
    oldTweets: boolean,
    simplifyLiveroom: boolean,
    simplifyLiveroomSettings: {
      vip: boolean,
      fansMedal: boolean,
      title: boolean,
      userLevel: boolean,
      guard: boolean,
      systemMessage: boolean,
      welcomeMessage: boolean,
      giftMessage: boolean,
      guardPurchase: boolean,
      giftPanel: boolean,
      kanban: boolean,
      eventsBanner: boolean,
      popup: boolean,
      skin: boolean,
      [key: string]: boolean,
    },
    customNavbar: boolean,
    customNavbarFill: boolean,
    customNavbarTransparent: boolean,
    customNavbarShadow: boolean,
    customNavbarCompact: boolean,
    customNavbarBlur: boolean,
    customNavbarBlurOpacity: number,
    customNavbarOrder: CustomNavbarOrders,
    customNavbarHidden: Array<keyof CustomNavbarComponents>,
    customNavbarBoundsPadding: number,
    playerShadow: boolean,
    narrowDanmaku: boolean,
    favoritesRedirect: boolean,
    outerWatchlater: boolean,
    hideOldEntry: boolean,
    hideBangumiReviews: boolean,
    videoScreenshot: boolean,
    cache: {} | { version: string } | undefined,
    filenameFormat: string,
    sideBarOffset: number,
    noLiveAutoplay: boolean,
    hideHomeLive: boolean,
    noMiniVideoAutoplay: boolean,
    useDefaultVideoSpeed: boolean,
    defaultVideoSpeed: string,
    hideCategory: boolean,
    foldComment: boolean,
    downloadVideoDefaultDanmaku: DanmakuOption,
    aria2RpcOption: RpcOption,
    aria2RpcOptionSelectedProfile: string,
    aria2RpcOptionProfiles: RpcOptionProfile[],
    searchHistory: SearchHistoryItem[],
    seedsToCoins: boolean,
    autoSeedsToCoins: boolean,
    lastSeedsToCoinsDate: number,
    autoDraw: boolean,
    keymap: boolean,
    doubleClickFullscreen: boolean,
    doubleClickFullscreenPreventSingleClick: boolean
    simplifyHome: boolean,
    simplifyHomeStyle: '清爽' | '极简',
    ajaxHook: boolean,
    scriptLoadingMode: '同时' | '延后' | '同时(自动)' | '延后(自动)' | '自动',
    scriptDownloadMode: 'bundle' | 'legacy'
    guiSettingsDockSide: '左侧' | '右侧'
    fullActivityContent: boolean,
    feedsFilter: boolean,
    feedsFilterPatterns: Pattern[],
    feedsFilterTypes: number[],
    feedsFilterSideCards: number[],
    activityImageSaver: boolean,
    scriptBlockPatterns: Pattern[],
    customNavbarSeasonLogo: boolean,
    selectableColumnText: boolean,
    downloadVideoFormat: 'flv' | 'dash',
    downloadVideoDashCodec: DashCodec,
    enableDashDownload: boolean,
    watchlaterExpireWarnings: boolean,
    watchlaterExpireWarningDays: number,
    superchatTranslate: boolean,
    miniPlayerTouchMove: boolean,
    hideBangumiSponsors: boolean,
    hideRecommendLive: boolean,
    hideRelatedVideos: boolean,
    defaultMedalID: number,
    autoMatchMedal: boolean,
    customStyles: CustomStyle[],
    simpleHomeCategoryOrders: SimpleHomeCategoryOrders,
    keymapJumpSeconds: number,
    urlParamsClean: boolean,
    collapseLiveSideBar: boolean,
    latestVersionLink: string,
    currentVersion: string,
  }
  const GM_info: MonkeyInfo
  function GM_xmlhttpRequest(details: MonkeyXhrDetails): { abort: () => void }
  function GM_setClipboard(data: any, info: string | { type?: string, mimetype?: string }): void
  function GM_setValue(name: keyof BilibiliEvolvedSettings, value: any): void
  function GM_getValue<T>(name: keyof BilibiliEvolvedSettings, defaultValue?: T): T
  const GM: {
    info: MonkeyInfo
    xmlHttpRequest: typeof GM_xmlhttpRequest
    setClipboard: typeof GM_setClipboard
    setValue: (name: keyof BilibiliEvolvedSettings, value: any) => Promise<void>
    getValue: <T>(name: keyof BilibiliEvolvedSettings, defaultValue?: T) => Promise<T>
  }
  const settings: BilibiliEvolvedSettings
  const customNavbarDefaultOrders: CustomNavbarOrders
  const aria2RpcDefaultOption: RpcOption
  const languageNameToCode: { [key: string]: string }
  const languageCodeToName: { [key: string]: string }
  function logError(message: Error | string): void
  function loadSettings(): void
  function addSettingsListener(key: keyof BilibiliEvolvedSettings, handler: (newValue: any, oldValue: any) => void, initCall?: boolean): void
  function removeSettingsListener(key: keyof BilibiliEvolvedSettings, handler: (newValue: any, oldValue: any) => void): void
  function raiseEvent(element: Element, eventName: string): void
  function loadLazyPanel(selector: string): Promise<void>
  function loadDanmakuSettingsPanel(): Promise<void>
  function contentLoaded(callback: () => void): void
  function fullyLoaded(callback: () => void): void
  function fixed(number: number, precision?: number): string
  function isEmbeddedPlayer(): boolean
  function isIframe(): boolean
  function getI18nKey(): string
  function dq(selector: string): Element | null
  function dq(element: Element, selector: string): Element | null
  function dqa(selector: string): Element[]
  function dqa(element: Element, selector: string): Element[]
  function html(strings: TemplateStringsArray, ...values: unknown[]): string
  const formatFileSize: (bytes: number, fixed?: number) => string
  const formatDuration: (time: number, fixed?: number) => string
  const ascendingSort: <T>(itemProp: (item: T) => number) => (a: T, b: T) => number
  const descendingSort: <T>(itemProp: (item: T) => number) => (a: T, b: T) => number
  const getDpiSourceSet: (src: string, baseSize: number | string | { width?: number | string, height?: number | string }, extension?: string) => string
  const isOffline: () => boolean
  const getUID: () => string
  const getCsrf: () => string
  const formatCount: (count: number | string) => string
  const escapeFilename: (filename: string, replacement?: string) => string
  const dashExtensions: string[]
  const dashFragmentExtension: string
  type ScriptVersion = 'Stable' | 'Preview' | 'Offline' | 'Preview Offline' | 'Local' | 'Local preview' | 'Local stable' | 'Local offline' | 'Local preview offline'
  const scriptVersion: ScriptVersion
}
export { }