SpinQuery.any(
    () => $(".head-content.bili-wrapper>div.search:not(.filter-item)"),
    textBox =>
    {
        const rightNavbar = $(document.querySelector(".nav-con.fr"));
        textBox.detach().insertAfter(rightNavbar);
    },
);
if (settings.preserveRank)
{
    SpinQuery.select(
        () => document.querySelector(".nav-wrapper .searchform,.nav-con #nav_searchform"),
        searchForm =>
        {
            searchForm.classList.add("preserve-rank");
            if (!searchForm.querySelector("a.icons-enabled"))
            {
                searchForm.insertAdjacentHTML("afterbegin", /*html*/`
                    <a  title="排行榜"
                        class="icons-enabled"
                        href="https://www.bilibili.com/ranking"
                        target="_blank">
                        <i class="icon-rank"></i>
                    </a>
                `);
            }
        }
    );
}
else
{
    SpinQuery.select(
        () => document.querySelector(".nav-wrapper .searchform,.nav-con #nav_searchform"),
        searchForm =>
        {
            searchForm.classList.remove("preserve-rank");
            const rankIcon = searchForm.querySelector("a.icons-enabled");
            rankIcon && rankIcon.remove();
        }
    );
}
SpinQuery.any(
    () => $("#banner_link"),
    () => resources.removeStyle("tweetsStyle"),
);
if (!settings.showBanner)
{
    resources.applyStyle("noBannerStyle");
}
else
{
    resources.removeStyle("noBannerStyle");
}