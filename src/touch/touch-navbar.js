SpinQuery.count(
    () => document.querySelectorAll("ul.fr>li.nav-item:not(.profile-info)"),
    6,
    navItems =>
    {
        navItems.forEach(nav =>
        {
            nav.style.cursor = "pointer";
            const a = nav.querySelector("a.t");
            a.removeAttribute("href");
        });
    }
);