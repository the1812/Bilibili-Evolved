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
            const watchlaterList = items
                .map(it =>
                {
                    const href = it.getAttribute("href");
                    if (href && href.match(/.*watchlater.*|javascript:;/g))
                    {
                        return getRedirectLink(href);
                    }
                    return "javascript:;";
                });
            items.forEach((it, index) => $(it)
                .attr("href", watchlaterList[index])
                .attr("target", "_blank"));
        };
        const redirectSelectors = (...selectors) =>
        {
            for (const selector of selectors)
            {
                SpinQuery.select(
                    () => document.querySelectorAll(selector),
                    it => redirectLinks([...it]),
                );
            }
        };
        SpinQuery.any(
            () => $(".watch-later-list"),
            () =>
            {
                (Observer.childListSubtree || Observer.subtree)("#viewlater-app", () =>
                {
                    SpinQuery.condition(
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
                    );
                    SpinQuery.any(
                        () => $("#viewlater-app .s-btn[href='#/']"),
                        it => it.remove(),
                    );
                    redirectSelectors(".av-pic", ".av-about>a");
                });
            }
        );
        SpinQuery.any(
            () => $("li.nav-item[report-id*=watchlater]"),
            () =>
            {
                (Observer.childListSubtree || Observer.subtree)("li.nav-item[report-id*=watchlater]", () =>
                {
                    redirectSelectors(".av-item>a", ".av-about>a", "div.watch-later-m>ul>div>li>a");
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
