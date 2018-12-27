(() =>
{
    return (settings, resources) =>
    {
        if (document.URL === `https://h.bilibili.com/`)
        {
            return;
        }
        SpinQuery.any(
            () => $(".custom-scrollbar"),
            it => it.removeClass("custom-scrollbar")
        );
        SpinQuery.any(
            () => $("#banner_link"),
            () => resources.removeStyle("tweetsStyle"),
        );
        const newStyles = {
            selectors: [
                "div.nav-con.fl",
                "#link-navbar-vm",
                ".link-navbar",
                ".nav-header-wrapper",
                ".z_top .z_header"
            ],
            get allSelectors()
            {
                return this.selectors.reduce((acc, s) => acc + "," + s);
            },
            get navbar()
            {
                let result = null;
                for (const selector of this.selectors)
                {
                    result = result || document.querySelector(selector);
                }
                return result;
            },
            supports(navbar)
            {
                if (navbar instanceof Element)
                {
                    const height = parseInt(window.getComputedStyle(navbar).height);
                    const supportHeights = [
                        60, /* show */
                        50, /* stardust player */
                        0,  /* live room */
                        56  /* photos */
                    ];
                    return supportHeights.indexOf(height) !== -1;
                }
                return false;
            }
        };
        SpinQuery.any(() => $(newStyles.allSelectors), () =>
        {
            const navbar = newStyles.navbar;
            if (newStyles.supports(navbar))
            {
                resources.applyStyle("style", "bilibili-style-optimization");
            }
            else
            {
                resources.applyStyle("oldStyle", "bilibili-style-optimization");
            }
        });
    };
})();
