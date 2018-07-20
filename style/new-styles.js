(() =>
{
    return (settings, resources) =>
    {
        waitForQuery()(
            () => $(".nav-search-keyword"),
            it => it.length > 0,
            textBox => textBox.attr("placeholder", "搜索")
        );
        waitForQuery()(
            () => $(".custom-scrollbar"),
            it => it.length > 0,
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
            waitForQuery()(
                () => $(".search"),
                it => it.length > 0 && $(".nav-con.fr").length > 0,
                textBox =>
                {
                    textBox.detach()
                        .insertAfter(".nav-con.fr");
                }
            );
            waitForQuery()(
                () => $("input.search-keyword"),
                it => it.length > 0,
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
