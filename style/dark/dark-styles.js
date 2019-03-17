if (settings.useDarkStyle)
{
    resources.applyStyle("scrollbarStyle");
    SpinQuery.any(
        () => $(".custom-scrollbar"),
        it => it.removeClass("custom-scrollbar")
    );
    if (!settings.useNewStyle && ($("#banner_link").length === 0 ||
        $("#banner_link").length > 0 &&
        settings.overrideNavBar &&
        !settings.showBanner))
    {
        resources.applyImportantStyle("darkStyleNavBar");
    }
    resources.applyStyle("darkStyle");
    resources.applyImportantStyle("darkStyleImportant");
}
else
{
    resources.removeStyle("scrollbarStyle");
    resources.removeStyle("darkStyleNavBar");
    resources.removeStyle("darkStyle");
    resources.removeStyle("darkStyleImportant");
}