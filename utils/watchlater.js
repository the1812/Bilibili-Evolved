(() =>
{
    return () =>
    {
        const redirectLinks = items =>
        {
            if (items.attr("href").indexOf("watchlater") !== 0)
            {
                const watchlaterList = items
                    .map((_, it) =>
                    {
                        const href = $(it).attr("href");
                        if (href)
                        {
                            const match = href.match(/av[\d]+/);
                            if (match && match[0])
                            {
                                return "https://www.bilibili.com/" + match[0];
                            }
                        }
                        return "javascript:;";
                    });
                items.each((index, it) => $(it)
                    .attr("href", watchlaterList[index])
                    .attr("target", "_blank"));
            }
        };
        Observer.subtree("li.nav-item[report-id*=watchlater]", () =>
        {
            SpinQuery.any(
                () => $(".av-item>a"),
                items => redirectLinks(items)
            );
            SpinQuery.any(
                () => $(".av-about>a"),
                items => redirectLinks(items)
            );
            SpinQuery.any(
                () => $("div.watch-later-m>ul>div>li>a"),
                items => redirectLinks(items)
            );
            SpinQuery.any(
                () => $(".read-more.mr"),
                it => it.remove()
            );
            SpinQuery.any(
                () => $(".read-more-grp>.read-more"),
                it => it.css({
                    float: "none",
                    width: "auto"
                })
            );
            new SpinQuery(
                () => document.URL.match(/av[\d]+/),
                it => it && document.URL.indexOf("watchlater") !== -1,
                it =>
                {
                    const id = it[0];
                    if (id)
                    {
                        window.location.replace(`https://www.bilibili.com/${id}`);
                    }
                }
            ).start();
        });
        return {
            ajaxReload: true
        };
    };
})();
