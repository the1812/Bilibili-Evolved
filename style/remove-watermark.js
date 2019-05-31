const id = "remove-live-watermark";
const load = () =>
{
    if (document.getElementById(id) === null)
    {
        resources.applyStyleFromText(`
            .bilibili-live-player-video-logo
            {
                display: none !important;
            }
        `, id);
    }
};
load();
export default {
    reload: load,
    unload: () =>
    {
        const style = document.getElementById(id);
        style && style.remove();
    },
};