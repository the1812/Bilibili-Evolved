(() =>
{
    return (settings, resources) =>
    {
        if (settings.customControlBackgroundOpacity > 0)
        {
            if (!settings.touchVideoPlayer)
            {
                resources.applyImportantStyleFromText(`
<style id="control-background-non-touch">
.bilibili-player-video-control-bottom
{
    margin: 0 !important;
    padding: 7px 0 0 !important;
}
</style>
            `);
            }
        }
    };
})();