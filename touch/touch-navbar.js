SpinQuery.count(
    () => $("ul.fr>li.nav-item").not(".profile-info"),
    6,
    navItems =>
    {
        const enableTouch = (_, nav) =>
        {
            const $nav = $(nav);
            $nav.css("cursor", "pointer");
            const a = $nav.find("a.t");
            a.removeAttr("href");
        };
        navItems.each(enableTouch);
    }
);