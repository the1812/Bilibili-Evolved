function touchNavBar()
{
    waitForQuery()(
        () => $("ul.fr>li.nav-item").not(".profile-info"),
        it => it.length === 6,
        navItems =>
        {
            const navTouch = (_, nav) =>
            {
                const $nav = $(nav);
                $nav.css("cursor", "pointer");
                const a = $nav.find("a.t");
                a.removeAttr("href");
            };
            navItems.each(navTouch);
        }
    );
}
