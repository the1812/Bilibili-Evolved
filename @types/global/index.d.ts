declare global
{
    function GM_addValueChangeListener(name: string, valueChangeListener: (name: string, oldValue: any, newValue: any, remote: boolean) => void): number;
    function GM_setClipboard(data: any, info: string | { type?: string, mimetype?: string }): void;
    function GM_setValue(name: string, value: any): void;
    function GM_getValue<T>(name: string, defaultValue?: T): T;
    type RunAtOptions = "document-start" | "document-end" | "document-idle" | "document-body" | "context-menu";
    interface MonkeyInfo
    {
        script: {
            author: string;
            copyright: string;
            description: string;
            excludes: string[];
            homepage: string;
            icon: string;
            icon64: string;
            includes: string[];
            lastUpdated: number;
            matches: string[];
            downloadMode: string;
            name: string;
            namespace: string;
            options: {
                awareOfChrome: boolean;
                compat_arrayleft: boolean;
                compat_foreach: boolean;
                compat_forvarin: boolean;
                compat_metadata: boolean;
                compat_prototypes: boolean;
                compat_uW_gmonkey: boolean;
                noframes: boolean;
                override: {
                    excludes: false;
                    includes: false;
                    orig_excludes: string[];
                    orig_includes: string[];
                    use_excludes: string[];
                    use_includes: string[];
                };
                run_at: RunAtOptions;
            };
            position: number;
            resources: string[];
            "run-at": RunAtOptions;
            system: boolean;
            unwrap: boolean;
            version: string;
        }
        scriptMetaStr: string;
        scriptSource: string;
        scriptUpdateURL: string;
        scriptWillUpdate: boolean;
        scriptHandler: string;
        isIncognito: boolean;
        version: string;
    }
    const GM_info: MonkeyInfo;
    const unsafeWindow: Window;
    class SpinQuery
    {
        static condition<T>(query: () => T, condition: (queryResult: T) => boolean, success: (queryResult: T) => void, failed: () => void): void;
        static condition<T>(query: () => T, condition: (queryResult: T) => boolean): Promise<T>;
        static select<T>(query: () => T, action: (queryResult: T) => void, failed: () => void): void;
        static select<T>(query: () => T): Promise<T>;
        static select<T>(query: string): HTMLElement | null;
        static any<T>(query: () => T, action: (queryResult: T) => void, failed: () => void): void;
        static any<T>(query: () => T): Promise<T>;
        static any<T>(query: string): any;
        static count<T>(query: () => T, count: number, success: (queryResult: T) => void, failed: () => void): void;
        static count<T>(query: () => T, count: number): Promise<T>;
        static unsafeJquery(action: () => void, failed: () => void): void;
        static unsafeJquery(): Promise<void>;
    }
    class Toast
    {
        show(): void;
        dismiss(): void;
        static show(message: string, title: string, duration?: number): void;
        static info(message: string, title: string, duration?: number): void;
        static success(message: string, title: string, duration?: number): void;
        static error(message: string, title: string, duration?: number): void;
    }
    class Resource
    {
        text: string;
        key: string;
        dependencies: Array<Resource>;
        styles: Array<Resource>;
        displayName: string;
        dropdown: object;
        downloaded: boolean;
        constructor(url: string, styles?: Resource[]);
        download(): Promise<string>;
        getStyle(id: string): string;
        getPriorStyle(): any;
        applyStyle(id: string, important: boolean): void;
        static all: object;
        static displayNames: object;
        static manifest: object;
        static root: string;
    }
    class ResourceManager
    {
        import(compnentName: string): any;
        getDefaultStyleId(key: string): string;
        applyStyle(key: string, id?: string): void;
        removeStyle(key: string): void;
        applyImportantStyle(key: string, id?: string): void;
        applyStyleFromText(text: string): void;
        applyImportantStyleFromText(text: string): void;
        getStyle(key: string, id?: string): void;
    }
    const resources: ResourceManager;
    class DoubleClickEvent
    {
        constructor(handler: (e: MouseEvent) => void, singleClickHandler: (e: MouseEvent) => void);
        bind(element: Element): void;
        unbind(element: Element): void;
    }
    class Ajax
    {
        static send(xhr: XMLHttpRequest, body: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array>): Promise<string>;
        static getText(url: string): Promise<string>;
        static getTextWithCredentials(url: string): Promise<string>;
        static getJson(url: string): Promise<any>;
        static getJsonWithCredentials(url: string): Promise<any>;
        static getBlob(url: string): Promise<Blob>;
        static getBlobWithCredentials(url: string): Promise<Blob>;
        static postText(url: string, body: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array>): Promise<string>;
        static postTextWithCredentials(url: string, body: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array>): Promise<string>;
    }
    type Observable = string | Node | Node[] | NodeList;
    class Observer
    {
        constructor(element: Element, callback: MutationCallback);
        start(): Observer;
        stop(): Observer;
        options: MutationObserverInit;
        static observe(observable: Observable, callback: MutationCallback, options: MutationObserverInit): Observer[];
        static childList(observable: Observable, callback: MutationCallback): Observer[];
        static childListSubtree(observable: Observable, callback: MutationCallback): Observer[];
        static attributes(observable: Observable, callback: MutationCallback): Observer[];
        static attributesSubtree(observable: Observable, callback: MutationCallback): Observer[];
        static all(observable: Observable, callback: MutationCallback): Observer[];
        static videoChange(callback: MutationCallback): Promise<Observer[] | null>;
    }
    interface BilibiliEvolvedSettings
    {
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
        autoPlay: boolean,
        showDeadVideoTitle: boolean,
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
            popup: boolean,
            skin: boolean,
        },
        customNavbar: boolean,
        customNavbarSettings: {
            fill: boolean,
            shadow: boolean,
        },
        favoritesRedirect: boolean,
        outerWatchlater: boolean,
        cache: {} | { version: string } | undefined,
        latestVersionLink: string,
        currentVersion: string,
    }
    const settings: BilibiliEvolvedSettings;
    function logError(message: Error | string): void;
    function loadSettings(): void
    function saveSettings(newSettings: BilibiliEvolvedSettings): void;
    function onSettingsChange(change: (key: string, oldValue: any, newValue: any) => void): void;
    function downloadText(url: string, load: (text: string) => void, error: (text: string) => void): void;
    function downloadText(url: string): Promise<string>;
    function raiseEvent(element: Element, eventName: string): void;
    function loadLazyPanel(selector: string): Promise<void>;
    function contentLoaded(callback: () => void): void;
    function fixed(number: number, precision?: number): string;
    function isEmbeddedPlayer(): boolean;
    function isIframe(): boolean;
    function getI18nKey(): string;
}
export { };