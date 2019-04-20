function favoritesRedirect() {
    const videoLinks = document.querySelectorAll("li[data-aid]>a");
    videoLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === null || !href.includes("medialist")) {
            return;
        }
        const aid = link.parentElement.getAttribute("data-aid");
        link.setAttribute("href", `https://www.bilibili.com/video/av${aid}`);
    });
}
(async () => {
    const spaceApp = await SpinQuery.select("#app>.s-space");
    if (spaceApp !== null) {
        Observer.childListSubtree("#app>.s-space", favoritesRedirect);
    }
})();
