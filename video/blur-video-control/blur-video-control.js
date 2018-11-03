(() =>
{
    return (_, resources) =>
    {
        Observer.subtree("#bofqi", () =>
        {
            SpinQuery.any(
                () => $(".bui-slider .bui-track.bui-track-video-progress,.bilibili-player-video-control-bottom"),
                containers =>
                {
                    if (!containers.hasClass("video-control-blur-container"))
                    {
                        containers.addClass("video-control-blur-container");
                        containers.prepend(`<div class="video-control-blur-layer"></div>`);
                        resources.applyStyle("blurVideoControlStyle");
                    }
                });
        });
    };
})();