(() =>
{
    return (settings, resources) =>
    {
        function showTitle()
        {
            const deadVideos = $(".fav-video-list>li.disabled,.video-list>li.disabled").removeClass("disabled");
            deadVideos.each((_, it) =>
            {
                const $it = $(it);
                const aid = $it.attr("data-aid");
                const title = $it.find("img").attr("alt");
                const link = (() =>
                {
                    if (settings.useBiliplusRedirect)
                    {
                        return `https://www.biliplus.com/video/av${aid}`;
                    }
                    else
                    {
                        return `//www.bilibili.com/video/av${aid}`;
                    }
                })();
                $it.find(".i-watchlater")
                    .css("display", "none");
                $it.find("a.cover")
                    .attr("target", "_blank")
                    .attr("href", link);
                $it.find("a.title")
                    .attr("title", title)
                    .attr("target", "_blank")
                    .attr("href", link)
                    .text(title);
            });
        }
        SpinQuery.any(() => $(".fav-content"), () =>
        {
            Observer.childListSubtree(".fav-content", showTitle);
        });
        SpinQuery.any(() => $("#app>.s-space"), () =>
        {
            Observer.childListSubtree("#app>.s-space", showTitle);
        });
    };
})();