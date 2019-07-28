const style = `<style id="narrow-danmaku-style">
@media screen and (max-width: 1200px)
{
    .bilibili-player.mode-webfullscreen .bilibili-player-video-control-wrap .bilibili-player-video-control-bottom-center .bilibili-player-video-sendbar .bilibili-player-video-inputbar
    {
        display: flex !important;
    }
}
</style>`;
resources.applyStyleFromText(style);
export default {
    reload: () => resources.applyStyleFromText(style),
    unload: () => document.getElementById("narrow-danmaku-style").remove(),
};