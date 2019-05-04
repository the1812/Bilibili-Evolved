const style = `#entryOld, .main-container .entry-old { display: none !important; }`;
const id = "hide-old-entry-style";
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