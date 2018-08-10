(() =>
{
    return (settings, resources) =>
    {
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

        if (stardustStyles)
        {
            resources.applyStyle("style", "bilibili-new-style");
        }
        else
        {
            resources.applyStyle("oldStyle", "bilibili-new-style");
        }

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
            resources.applyStyle("navbarOverrideStyle", "bilibili-nav-bar-override");

            if (!settings.showBanner)
            {
                resources.applyStyle("noBannerStyle", "bilibili-banner-override");
            }
        }
        return {
            ajaxReload: false
        };
    };
})();
