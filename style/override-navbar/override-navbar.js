(() =>
{
    return (settings, resources) =>
    {
        new SpinQuery(
            () => $(".head-content.bili-wrapper>div.search").not(".filter-item"),
            it => it.length > 0 && $(".nav-con.fr").length > 0,
            textBox =>
            {
                textBox.detach()
                    .insertAfter(".nav-con.fr");
            }
        ).start();
    };
})();