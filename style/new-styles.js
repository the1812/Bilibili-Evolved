(() =>
{
    return (settings, resources) =>
    {
        resources.applyStyle("scrollbarStyle", "bilibili-scrollbar-style");
        SpinQuery.any(
            () => $(".custom-scrollbar"),
            it => it.removeClass("custom-scrollbar")
        );
        SpinQuery.any(() => $(".bili-wrapper,#link-navbar-vm,.link-navbar"), () =>
        {
            const navbar =
                document.getElementsByClassName("bili-wrapper")[0] ||
                document.getElementById("link-navbar-vm") ||
                document.getElementsByClassName("link-navbar")[0];
            let stardustStyles = false;
            if (navbar instanceof Element)
            {
                const height = parseInt(window.getComputedStyle(navbar).height);
                stardustStyles =
                    height === 50 /* stardust player & live room */ ||
                    height === 0 ||
                    height === 56;/* photos */
            }

            if (stardustStyles)
            {
                resources.applyStyle("style", "bilibili-new-style");
            }
            else
            {
                resources.applyStyle("oldStyle", "bilibili-new-style");
            }
        });
        return {
            ajaxReload: false
        };
    };
})();
