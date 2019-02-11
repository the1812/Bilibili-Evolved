declare global
{
    class SpinQuery
    {
        static condition<T>(query: () => T, condition: (queryResult: T) => boolean, success: (queryResult: T) => void, failed: () => void): void;
        static condition<T>(query: () => T, condition: (queryResult: T) => boolean): Promise<T>;
        static select<T>(query: () => T, action: (queryResult: T) => void, failed: () => void): void;
        static select<T>(query: () => T): Promise<T>;
        static any<T>(query: () => T, action: (queryResult: T) => void, failed: () => void): void;
        static any<T>(query: () => T): Promise<T>;
        static count<T>(query: () => T, count: number, success: (queryResult: T) => void, failed: () => void): void;
        static count<T>(query: () => T, count: number): Promise<T>;
        static unsafeJquery(action: () => void, failed: () => void): void;
        static unsafeJquery(): Promise;
    }
    class Toast
    {
        show(): void;
        dismiss(): void;
        static show(message: string, title: string): void;
        static info(message: string, title: string): void;
        static success(message: string, title: string): void;
        static error(message: string, title: string): void;
        static show(message: string, title: string, duration: number): void;
        static info(message: string, title: string, duration: number): void;
        static success(message: string, title: string, duration: number): void;
        static error(message: string, title: string, duration: number): void;
    }
    class ResourceManager
    {
        import(compnentName: string): any;
        getDefaultStyleId(key: string): string;
        applyStyle(key: string, id: string): void;
        removeStyle(key: string): void;
        applyImportantStyle(key: string, id: string): void;
        applyStyleFromText(text: string): void;
        applyImportantStyleFromText(text: string): void;
        getStyle(key: string, id: string): void;
    }
    const resources: ResourceManager;
    class DoubleClickEvent
    {
        constructor(handler: (e: MouseEvent) => void, singleClickHandler: (e: MouseEvent) => void = null);
        bind(element: Element): void;
        unbind(element: Element): void;
    }
    class Ajax
    {
        static send(xhr: XMLHttpRequest, body: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array>): Promise<string>;
        static getText(url: string): Promise<string>;
        static getTextWithCredentials(url: string): Promise<string>;
        static postText(url: string, body: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array>): Promise<string>;
        static postTextWithCredentials(url: string, body: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array>): Promise<string>;
    }
    class Observer
    {
        constructor(element: Element, callback: MutationCallback);
        start(): Observer;
        stop(): Observer;
        static observe(selector: string, callback: MutationCallback, options: MutationObserverInit): Observer[];
        static childList(selector: string, callback: MutationCallback): Observer[];
        static childListSubtree(selector: string, callback: MutationCallback): Observer[];
        static attributesSubtree(selector: string, callback: MutationCallback): Observer[];
        static all(selector: string, callback: MutationCallback): Observer[];
        static async videoChange(callback: MutationCallback): Observer[] | null;
    }
    interface Settings
    {
        useDarkStyle: boolean,
        useNewStyle: boolean,
        compactLayout: boolean,
        showBanner: boolean,
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
        rememberDanmakuBlock: boolean,
        danmakuBlockSettings: {
            scroll: boolean,
            top: boolean,
            bottom: boolean,
            color: boolean,
            special: boolean,
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
        useCommentStyle: boolean,
        toastInternalError: boolean,
        cache: {} | { version: string } | undefined,
        latestVersionLink: string,
        currentVersion: string,
    };
    const settings: Settings;
    function logError(message: Error | string): void;
    function loadSettings(): void
    function saveSettings(newSettings: Settings): void;
    function onSettingsChange(change: (key: string, oldValue: any, newValue: any) => void): void;
    function downloadText(url: string, load: (text: string) => void, error: (text: string) => void): void;
    function downloadText(url: string): Promise<string>;
    function raiseEvent(element: Element, eventName: string): void;
    async function loadLazyPanel(selector: string): void;
    function contentLoaded(callback: () => void): void;
    function fixed(number: number, precision: number = 1): string;
}
export { };