import html from 'framePlaybackHtml';
resources.applyStyle("framePlaybackStyle");
const main = async () =>
{
    const video = await SpinQuery.select(() => document.querySelector("video"));
    const time = await SpinQuery.select(() => document.querySelector(".bilibili-player-video-time"));

    if (document.querySelector(".frame-playback"))
    {
        return;
    }
    time.insertAdjacentHTML("afterend", html);

    await SpinQuery.select(() => document.querySelector(".bilibili-player-video-quality-menu .bui-select-item-active"));
    let frameTime = 0;
    Observer.attributesSubtree(".bilibili-player-video-quality-menu ul.bui-select-list", () =>
    {
        const quality = parseInt(document.querySelector(".bilibili-player-video-quality-menu .bui-select-item-active"));
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
        frameTime = 1 / fps;
        console.log(frameTime);
    });
    document.querySelector(".prev-frame").addEventListener("click", () => video.currentTime -= frameTime);
    document.querySelector(".next-frame").addEventListener("click", () => video.currentTime += frameTime);
};
Observer.videoChange(main);