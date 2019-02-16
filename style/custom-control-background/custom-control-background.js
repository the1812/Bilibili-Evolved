if (settings.customControlBackgroundOpacity > 0)
{
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
}