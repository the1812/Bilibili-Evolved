function darkStyle(settings)
{
    const styles = `<style id='bilibili-new-style-dark'>
    ${getStyle("darkStyle", settings)}</style>`;
    $("#bilibili-new-style-dark").remove();
    $("body").after(styles);
}
