function showTitle()
{
    const deadVideos = $(".disabled[data-aid]").removeClass("disabled");
    deadVideos.each(async (_, it) =>
    {
        const $it = $(it);
        const aid = $it.attr("data-aid");
        let title = $it.find("img").attr("alt");
        if (title === "已失效视频")
        {
            const response = JSON.parse(await Ajax.getText(`https://api.bilibili.com/x/player/pagelist?aid=${aid}`));
            if (response.code === 0)
            {
                const titles = response.data.map(it => it.part);
                [title] = titles;
            }
            else
            {
                console.warn("[显示失效视频信息] Page List API 未成功.");
                console.warn(response);
            }
        }
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
        // $it.find(".i-watchlater")
        //     .css("display", "none");
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
// SpinQuery.any(() => $(".fav-content"), () =>
// {
//     Observer.childListSubtree(".fav-content", showTitle);
// });
SpinQuery.any(() => $("#app>.s-space"), () =>
{
    Observer.childListSubtree("#app>.s-space", showTitle);
});