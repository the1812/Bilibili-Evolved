(() =>
{
    return (settings, resources) =>
    {
        return {
            settingsWidget: {
                category: "其他",
                content: `<div>
                        <button
                            class="gui-settings-button"
                            title="清除缓存"
                            id="clear-cache">
                            清除缓存
                        </button>
                        </div>`,
                success: () =>
                {
                    $("#clear-cache").on("click", () =>
                    {
                        settings.cache = {};
                        saveSettings(settings);
                        Toast.success("已删除全部缓存.", "清除缓存", 5000);
                    });
                    if (typeof offlineData !== "undefined")
                    {
                        $("button#clear-cache").parent().addClass("hidden");
                    }
                }
            },
            widget:
            {
                content: `
                    <button
                        class="gui-settings-flat-button"
                        id="clear-cache">
                        <i class="icon-clear"></i>
                        <span>清除缓存</span>
                    </button>`,
                success: () =>
                {
                    $("#clear-cache").on("click", () =>
                    {
                        settings.cache = {};
                        saveSettings(settings);
                        Toast.success("已删除全部缓存.", "清除缓存", 5000);
                    });
                    if (typeof offlineData !== "undefined")
                    {
                        $("button#clear-cache").remove();
                    }
                }
            },
        };
    };
})();