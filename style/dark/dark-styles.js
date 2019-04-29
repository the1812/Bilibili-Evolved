SpinQuery.any(
    () => $(".custom-scrollbar"),
    it => it.removeClass("custom-scrollbar")
);
const load = () =>
{
    resources.applyStyle("scrollbarStyle");
    SpinQuery.any(
        () => $(".custom-scrollbar"),
        it => it.removeClass("custom-scrollbar")
    );
    if (settings.hideBanner)
    {
        resources.applyImportantStyle("darkStyleNavBar");
    }
    resources.applyStyle("darkStyle");
    resources.applyImportantStyle("darkStyleImportant");
};
load();
export default {
    reload: load,
    unload: () =>
    {
        resources.removeStyle("scrollbarStyle");
        resources.removeStyle("darkStyleNavBar");
        resources.removeStyle("darkStyle");
        resources.removeStyle("darkStyleImportant");
    },
};