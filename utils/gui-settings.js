(() => {
    return (settings, resources) =>
    {
        waitForQuery()(
            () => $(".member-bottom"),
            it => it.length > 0,
            it =>
            {
                if ($(".gui-settings").length === 0)
                {
                    it.append(`<span class='gui-settings'>设置</span>`);
                    $(".gui-settings").on("click", () =>
                    {
                        $(".gui-settings-panel").css("display", "flex");
                    });
                }
                const style = resources.getStyle("guiSettingsStyle", "gui-settings-style");
                $("body").after(style);
                const settingsBox = resources.data.guiSettingsDom;
                if (settingsBox)
                {
                    $("body").append(settingsBox);
                    $(".gui-settings-close path").prop("d", "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z");
                    $(".gui-settings-ok path").prop("d", "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z");
                    for (const key in settings)
                    {
                        $(`input[type='checkbox'][data='${key}']`).prop("checked", settings[key]);
                    }
                }
            }
        );
    };
})();
