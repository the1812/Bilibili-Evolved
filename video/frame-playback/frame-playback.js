import html from 'framePlaybackHtml';
resources.applyStyle("framePlaybackStyle");
const main = async () =>
{
    if (document.querySelector(".frame-playback"))
    {
        return;
    }
    const video = await SpinQuery.select(() => document.querySelector("video"));
    const time = await SpinQuery.select(() => document.querySelector(".bilibili-player-video-time"));
    time.insertAdjacentHTML("afterend", html);
    const quality = parseInt(await SpinQuery.select(() => document.querySelector(".bilibili-player-video-quality-menu .bui-select-item-active")));
    const fps = (() =>
    {
        switch (quality)
        {
            // 60fps
            case 116:
            case 74:
                return 60000 / 1001;
            // 30fps
            default:
                return 30000 / 1001;
        }
    })();
    const frameTime = 1 / fps;
    document.querySelector(".prev-frame").addEventListener("click", () => video.currentTime -= frameTime);
    document.querySelector(".next-frame").addEventListener("click", () => video.currentTime += frameTime);
};
Observer.videoChange(main);