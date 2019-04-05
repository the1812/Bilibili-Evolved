if (isIframe())
{
    return;
}
const supportedUrls = [
    "/www.bilibili.com",
];
if (!supportedUrls.some(it => document.URL.includes(it)))
{
    return;
}
(async () =>
{
    const html = await import("customNavbarHtml");
    document.body.insertAdjacentHTML("beforeend", html);
    const navbar = document.querySelector(".custom-navbar");
    for (const [className, enabled] of Object.entries(settings.customNavbarSettings))
    {
        if (enabled === true)
        {
            navbar.classList.add(className);
        }
    }
})();