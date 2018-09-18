(() =>
{
    return (_, resources) =>
    {
        SpinQuery.count(
            () => $(".bui-slider .bui-track.bui-track-video-progress,.bilibili-player-area .bilibili-player-video-control"),
            2,
            containers =>
            {
                if (!containers.hasClass("video-control-blur-container"))
                {
                    containers.addClass("video-control-blur-container");
                    containers.prepend(`<div class="video-control-blur-layer"></div>`);
                    resources.applyStyle("blurVideoControlStyle", "bilibili-blur-video-control");
                }
            });

        return {
            ajaxReload: true
        };
    };
})();