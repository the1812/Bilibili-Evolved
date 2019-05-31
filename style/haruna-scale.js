const id = "haruna-scale";
const load = () =>
{
    if (document.getElementById(id) === null)
    {
        resources.applyStyleFromText(`
            .haruna-ctnr,
            .avatar-btn
            {
                transform: scale(${1 / window.devicePixelRatio}) !important;
            }
        `, id);
    }
};
load();
export default {
    reload: load,
    unload: () => {
        const style = document.getElementById(id);
        style && style.remove();
    },
};