(() =>
{
    return (settings, resources) =>
    {
        new SpinQuery(
            () => $(".nav-search-keyword"),
            it => it.length > 0 && it.attr("placeholder").length > 0,
            textBox => textBox.attr("placeholder", "搜索")
        ).start();
        SpinQuery.any(
            () => $(".custom-scrollbar"),
            it => it.removeClass("custom-scrollbar")
        );
        const navbar = document.getElementsByClassName("bili-wrapper")[0];
        let stardustStyles = false;
        if (navbar instanceof Element)
        {
            stardustStyles = parseInt(window.getComputedStyle(navbar).height) === 50;
        }
        let styles = "";
        if (stardustStyles)
        {
            styles = resources.getStyle("style", "bilibili-new-style");
        }
        else
        {
            styles = resources.getStyle("oldStyle", "bilibili-new-style");
        }
        $("#bilibili-new-style").remove();
        $("body").after(styles);

        if (settings.overrideNavBar)
        {
            new SpinQuery(
                () => $(".search").not(".filter-item"),
                it => it.length > 0 && $(".nav-con.fr").length > 0,
                textBox =>
                {
                    textBox.detach()
                        .insertAfter(".nav-con.fr");
                }
            ).start();
            SpinQuery.any(
                () => $("input.search-keyword"),
                textBox => textBox.attr("placeholder", "搜索")
            );
            const navBarStyles = resources.getStyle("navbarOverrideStyle", "bilibili-nav-bar-override");
            $("body").after(navBarStyles);

            if (!settings.showBanner)
            {
                const bannerStyles = resources.getStyle("noBannerStyle", "bilibili-banner-override");
                $("body").after(bannerStyles);
            }
        }
    };
})();
