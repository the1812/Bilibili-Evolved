(() =>
{
    return (settings, resources) =>
    {
        SpinQuery.any(
            () => $(".head-content.bili-wrapper>div.search:not(.filter-item)"),
            textBox =>
            {
                textBox.detach().insertAfter(".nav-con.fr");
            },
        );
        if (settings.preserveRank)
        {
            SpinQuery.any(
                () => $(".nav-wrapper .searchform,.nav-con #nav_searchform"),
                searchForm =>
                {
                    searchForm.addClass("preserve-rank");
                    if (searchForm.find("a.icons-enabled").length === 0)
                    {
                        searchForm.prepend(`
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
            SpinQuery.any(
                () => $(".nav-wrapper .searchform,.nav-con #nav_searchform"),
                searchForm =>
                {
                    searchForm.removeClass("preserve-rank");
                    searchForm.find("a.icons-enabled").remove();
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
    };
})();