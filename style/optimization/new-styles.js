if (document.URL === `https://h.bilibili.com/`)
{
    return;
}
if (document.querySelector(`.z_header`) !== null)
{
    resources.removeStyle("tweetsStyle");
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
// const newStyles = {
//     selectors: [
//         "div.nav-con.fl",
//         "#link-navbar-vm",
//         ".link-navbar",
//         ".nav-header-wrapper",
//         ".z_top .z_header",
//         ".stardust-video .nav-menu"
//     ],
//     get allSelectors()
//     {
//         return this.selectors.reduce((acc, s) => acc + "," + s);
//     },
//     get navbar()
//     {
//         let result = null;
//         for (const selector of this.selectors)
//         {
//             result = result || document.querySelector(selector);
//         }
//         return result;
//     },
//     supports(navbar)
//     {
//         if (navbar instanceof Element)
//         {
//             const height = parseInt(window.getComputedStyle(navbar).height);
//             const supportHeights = [
//                 60, /* show */
//                 50, /* stardust player */
//                 0,  /* live room */
//                 56  /* photos */
//             ];
//             return supportHeights.indexOf(height) !== -1;
//         }
//         return false;
//     }
// };
// SpinQuery.any(() => $(newStyles.allSelectors), () =>
// {
//     const navbar = newStyles.navbar;
//     if (newStyles.supports(navbar))
//     {
//         resources.applyStyle("style", "bilibili-style-optimization");
//     }
//     else
//     {
//         resources.applyStyle("oldStyle", "bilibili-style-optimization");
//     }
// });
if ([
    "h.bilibili.com",
    "live.bilibili.com",
    "link.bilibili.com"
].some(it => document.URL.includes(it)))
{
    resources.applyStyle("style", "bilibili-style-optimization");
}
else
{
    Promise.race([
        SpinQuery.select(() => document.querySelector(".bili-header-m"))
            .then(header => header !== null && header.classList.contains("stardust-video")),
        SpinQuery.select(() => document.querySelector("body>#Header")).then(header => header !== null)
    ]).then(supportsNewStyle => resources.applyStyle(supportsNewStyle ? "style" : "oldStyle", "bilibili-style-optimization"));
}