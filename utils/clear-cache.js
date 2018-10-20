(() =>
{
    return (settings, resources) =>
    {
        return {
            settingsWidget: {
                after: () => $("input[key=useCache]").parent().parent(),
                content: `<li class="indent-center">
                        <button
                            class="gui-settings-button"
                            title="清除缓存"
                            id="clear-cache">
                            清除缓存
                        </button>
                        </li>`,
                success: () =>
                {
                    $("#clear-cache").on("click", () =>
                    {
                        settings.cache = {};
                        Toast.show("已删除全部缓存.", "清除缓存", 5000);
                    });
                    if (typeof offlineData !== "undefined")
                    {
                        $("button#clear-cache").parent().addClass("hidden");
                    }
                }
            }
        };
    };
})();