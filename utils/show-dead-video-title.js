(() =>
{
    return (settings, resources) =>
    {
        function showTitle()
        {
            const deadVideos = $(".fav-video-list>li.disabled").removeClass("disabled");
            deadVideos.each((_, it) =>
            {
                const $it = $(it);
                const aid = $it.attr("data-aid");
                const title = $it.find("img").attr("alt");
                $it.find("a.cover")
                    .attr("target", "_blank")
                    .attr("href", `//www.bilibili.com/video/av${aid}`);
                $it.find("a.title")
                    .attr("title", title)
                    .attr("target", "_blank")
                    .attr("href", `//www.bilibili.com/video/av${aid}`)
                    .text(title);
            });
        }
        SpinQuery.any(() => $(".fav-content"), () =>
        {
            Observer.childListSubtree(".fav-content", showTitle);
        });
    };
})();