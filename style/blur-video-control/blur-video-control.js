const blur = async () =>
{
    const containers = await SpinQuery.count(
        ".bui-slider .bui-track.bui-track-video-progress,.bilibili-player-video-control-bottom",
        2);
    containers.forEach(container =>
    {
        if (!container.classList.contains("video-control-blur-container"))
        {
            container.classList.add("video-control-blur-container");
            container.insertAdjacentHTML("afterbegin", /*html*/`<div class="video-control-blur-layer"></div>`);
        }
    });
};
resources.applyStyle("blurVideoControlStyle");
Observer.videoChange(blur);

export default {
    reload: () =>
    {
        document.querySelectorAll(".video-control-blur-layer").forEach(it => it.style.display = "block");
        resources.applyStyle("blurVideoControlStyle");
    },
    unload: () =>
    {
        document.querySelectorAll(".video-control-blur-layer").forEach(it => it.style.display = "none");
        resources.removeStyle("blurVideoControlStyle");
    },
};