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
                        const match = $(it)
                            .attr("href")
                            .match(/av[\d]+/);
                        if (match && match[0])
                        {
                            return "https://www.bilibili.com/" + match[0];
                        }
                        else
                        {
                            return "javascript:;";
                        }
                    });
                items.each((index, it) => $(it).attr("href", watchlaterList[index]).attr("target", "_blank"));
            }
        };
        waitForQuery()(
            () => $(".av-item>a"),
            it => it.length > 0,
            items => redirectLinks(items)
        );
        waitForQuery()(
            () => $(".av-about>a"),
            it => it.length > 0,
            items => redirectLinks(items)
        );
        waitForQuery()(
            () => $("div.watch-later-m>ul>div>li>a"),
            it => it.length > 0,
            items => redirectLinks(items)
        );
        waitForQuery()(
            () => $(".read-more.mr"),
            it => it.length > 0,
            it => it.remove()
        );
        waitForQuery()(
            () => $(".read-more-grp>.read-more"),
            it => it.length > 0,
            it => it.css({
                float: "none",
                width: "auto"
            })
        );
        waitForQuery()(
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
        );
    };
})();
