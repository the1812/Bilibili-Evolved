(async () =>
{
    const html = await import("aboutHtml");
    document.body.insertAdjacentHTML("beforeend", html);
    const nameSorter = (a, b) => a.charCodeAt(0) - b.charCodeAt(0);
    const clientType = GM_info.script.name.match(/Bilibili Evolved \((.*)\)/)[1];
    const issueApi = "https://api.github.com/repos/the1812/Bilibili-Evolved/issues?state=all&direction=asc&per_page=100&page=1";
    new Vue({
        el: ".bilibili-evolved-about",
        data: {
            version: settings.currentVersion,
            clientType,
            branch: /Preview|Local/.test(clientType) ? "preview" : "master",
            authors: [
                {
                    name: "Grant Howard",
                    link: "https://github.com/the1812",
                },
                {
                    name: "Coulomb-G",
                    link: "https://github.com/Coulomb-G",
                },
            ],
            contributors: [
                {
                    name: "PleiadeSubaru",
                    link: "https://github.com/Etherrrr",
                },
            ].sort(nameSorter),
            participants: [

            ].sort(nameSorter),
            supporters: [
                "*飞",
                "N*v",
                "*博睿",
                "*杨",
                "*泽鹏",
            ].sort(nameSorter),
        }
    });
})();