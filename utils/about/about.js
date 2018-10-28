(() =>
{
    return (settings, resources) =>
    {
        $("body").append(resources.data.aboutDom.text);
        function init()
        {

        }
        return {
            settingsWidget: {
                after: () => $(".gui-settings-content"),
                content: `
                    <div class="about gui-settings-footer">
                        <span id="about-version">Bilibili Evolved ${settings.currentVersion}</span>
                        <span id="about-link">About</span>
                    </div>`,
                success: init
            }
        };
    };
})();