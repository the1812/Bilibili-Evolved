(() =>
{
    return (settings, resources) =>
    {
        if ($(".gui-settings-icon-panel").length === 0)
        {
            $("body").append(`
                <div class='gui-settings-icon-panel icons-enabled'>
                    <div class='gui-settings-widgets' title='附加功能'>
                        <i class="icon-widgets"></i>
                    </div>
                    <div class='gui-settings' title='设置'>
                        <i class="icon-settings"></i>
                    </div>
                </div>`);
            $(".gui-settings").on("click", () =>
            {
                $(".gui-settings-box,.gui-settings-mask").addClass("opened");
            });
            $(".gui-settings-widgets").on("click", () =>
            {
                $(".gui-settings-widgets-box,.gui-settings-mask").addClass("opened");
            });
        }
    };
})();