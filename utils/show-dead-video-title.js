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
                const title = $it.find("img").attr("alt");
                $it.find("a.title").attr("title", title).text(title);
            });
        }
        SpinQuery.any(() => $(".fav-content"), () =>
        {
            Observer.childListSubtree(".fav-content", showTitle);
        });
    };
})();