(() =>
{
    return (settings, resources) =>
    {
        $("body").append(resources.data.aboutDom.text);
        const version = GM_info.script.name.replace("Bilibili Evolved", "").replace(/^[\(\) ]+|[\(\) ]+$/g, '') + " · " + settings.currentVersion;
        $(".bilibili-evolved-version").text(version);
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
                    <a target="_blank" href="${component.homepage}">
                        <div class="component-name">${component.name}</div>
                        <div class="component-info">${component.version} · ${component.license}</div>
                    </a>
                </li>
            `);
        });

        function init()
        {
            $("#about-close").on("click", () =>
            {
                $(".bilibili-evolved-about").toggleClass("opened");
            });
            $(".gui-settings").on("click", e =>
            {
                if (e.shiftKey === true)
                {
                    $(".bilibili-evolved-about").toggleClass("opened");
                }
            });
        }
        return {
            widget: {
                success: init
            }
        };
    };
})();