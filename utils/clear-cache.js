(() =>
{
    return (settings, resources) =>
    {
        return {
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