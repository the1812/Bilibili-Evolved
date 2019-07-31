const style = `.bilibili-player-video-top { display: none !important; }`;
const id = "remove-top-mask-style";
const reload = () => resources.applyStyleFromText(/*html*/`<style id="${id}">${style}</style>`);
const unload = () =>
{
    const styleElement = document.getElementById(id);
    if (styleElement)
    {
        styleElement.remove();
    }
}
reload();
export default {
    reload,
    unload,
};