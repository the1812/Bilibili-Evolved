(() =>
{
    return () =>
    {
        const getRedirectLink = text =>
        {
            const match = text.match(/(av[\d]+)\/p([\d]+)/);
            if (match)
            {
                return `https://www.bilibili.com/video/${match[1]}/?p=${match[2]}`;
            }
            else
            {
                return "javascript:;";
            }
        };
        const redirectLinks = items =>
        {
            if (items.attr("href").match(/.*watchlater.*|javascript:;/g))
            {
                const watchlaterList = items
                    .map((_, it) =>
                    {
                        const href = $(it).attr("href");
                        if (href)
                        {
                            return getRedirectLink(href);
                        }
                        return "javascript:;";
                    });
                items.each((index, it) => $(it)
                    .attr("href", watchlaterList[index])
                    .attr("target", "_blank"));
            }
        };
        SpinQuery.any(
            () => $(".watch-later-list"),
            () =>
            {
                (Observer.childListSubtree || Observer.subtree)(".watch-later-list", () =>
                {
                    new SpinQuery(
                        () => document.URL.match(/(av[\d]+)\/p([\d]+)/),
                        it => it && document.URL.indexOf("watchlater") !== -1,
                        () =>
                        {
                            const url = getRedirectLink(document.URL);
                            if (url !== null)
                            {
                                window.location.replace(url);
                            }
                        }
                    ).start();
                    SpinQuery.any(
                        () => $(".av-pic"),
                        it => redirectLinks(it),
                    );
                });
            }
        );
        SpinQuery.any(
            () => $("li.nav-item[report-id*=watchlater]"),
            () =>
            {
                (Observer.childListSubtree || Observer.subtree)("li.nav-item[report-id*=watchlater]", () =>
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
                });
            }
        );
    };
})();
