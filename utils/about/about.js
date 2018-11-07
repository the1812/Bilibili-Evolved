(() =>
{
    return (settings, resources) =>
    {
        $("body").append(resources.data.aboutDom.text);
        $(".bilibili-evolved-version-name").text(GM_info.script.name.replace("Bilibili Evolved", "").trim());
        $(".bilibili-evolved-version-number").text(settings.currentVersion);
        const openSourceComponents = [
            {
                name: "jQuery",
                homepage: "https://jquery.com/",
                license: "MIT",
                version: "3.2.1"
            },
            {
                name: "JSZip",
                homepage: "https://stuk.github.io/jszip/",
                license: "MIT",
                version: "3.1.5"
            }
        ];
        openSourceComponents.forEach(component =>
        {
            $(".open-source-components").append(`
                <li>
                    <a href="${component.homepage}">
                        <span class="component-name">${component.name}</span>
                        <span class="component-info">${component.version} · ${component.license}</span>
                    </a>
                </li>
            `);
        });

        function init()
        {
            resources.applyStyle("aboutStyle");
            $("#about-link").on("click", () =>
            {
                $(".bilibili-evolved-about").toggleClass("opened");
            });
        }
        return {
            settingsWidget: {
                after: () => $(".gui-settings-content"),
                content: `
                    <div class="about gui-settings-footer">
                        <span id="about-version">${GM_info.script.name}, version ${settings.currentVersion}</span>
                        <span id="about-link">About</span>
                    </div>`,
                success: init
            }
        };
    };
})();