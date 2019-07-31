document.body.style.setProperty("--custom-control-background-opacity", settings.customControlBackgroundOpacity);
addSettingsListener("customControlBackgroundOpacity", value =>
{
    document.body.style.setProperty("--custom-control-background-opacity", value);
});
const load = () => {
    resources.applyStyle("customControlBackgroundStyle");
    if (!settings.touchVideoPlayer)
    {
        resources.applyImportantStyleFromText(/*html*/`
            <style id="control-background-non-touch">
            .bilibili-player-video-control-bottom
            {
                margin: 7px 0 0 0 !important;
                padding: 8px 0 0 !important;
            }
            </style>
            `);
    }
};
load();
export default {
    reload: load,
    unload: () => {
        resources.removeStyle("customControlBackgroundStyle");
        const nonTouchStyle = document.getElementById("control-background-non-touch");
        nonTouchStyle && nonTouchStyle.remove();
    },
};