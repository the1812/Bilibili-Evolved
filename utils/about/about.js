(async () =>
{
    const html = await import("aboutHtml");
    document.body.insertAdjacentHTML("beforeend", html);

})();