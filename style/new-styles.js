function newStyle(settings)
{
    waitForQuery()(
        () => $(".nav-search-keyword"),
        it => it.length > 0,
        textBox => textBox.attr("placeholder", "搜索")
    );
    waitForQuery()(
        () => $(".custom-scrollbar"),
        it => it.length > 0,
        it => it.removeClass("custom-scrollbar")
    );
    const navbar = document.getElementsByClassName("bili-wrapper")[0];
    let stardustStyles = false;
    if (navbar instanceof Element)
    {
        stardustStyles = parseInt(window.getComputedStyle(navbar).height) === 50;
    }
    let styles = "";
    if (stardustStyles)
    {
        styles = getStyle("style", settings);
    }
    else
    {
        styles = getStyle("oldStyle", settings);
    }
    styles = `<style id='bilibili-new-style'>${styles}</style>`;
    $("#bilibili-new-style").remove();
    $("body").after(styles);
}
