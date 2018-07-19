(() =>
{
    return (settings) =>
    {
        waitForQuery()(
            () => $("ul.fr>li.nav-item").not(".profile-info"),
            it => it.length === 6,
            navItems =>
            {
                if (settings.touchNavBar)
                {
                    const enableTouch = (_, nav) =>
                    {
                        const $nav = $(nav);
                        $nav.css("cursor", "pointer");
                        const a = $nav.find("a.t");
                        a.attr("removed-href", a.attr("href"));
                        a.removeAttr("href");
                    };
                    navItems.each(enableTouch);
                }
                else
                {
                    const tryRestoreHref = (_, nav) =>
                    {
                        const $nav = $(nav);
                        $nav.css("cursor", "pointer");
                        const a = $nav.find("a.t");
                        const href = a.attr("removed-href");
                        if (href)
                        {
                            a.attr("href", href);
                        }
                    };
                    navItems.each(tryRestoreHref);
                }
            }
        );
    };
})();
