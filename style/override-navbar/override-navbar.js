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
                    // insert after only "first" right-nav. There will be 2 in Edge...
                    .insertAfter($(document.querySelector(".nav-con.fr")));
            }
        ).start();
    };
})();