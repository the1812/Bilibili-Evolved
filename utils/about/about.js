(() =>
{
    return (settings, resources) =>
    {
        $("body").append(resources.data.aboutDom.text);
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