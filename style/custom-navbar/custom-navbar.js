if (isIframe())
{
    return;
}
const supportedUrls = [
    "/www.bilibili.com",
];
if (!supportedUrls.some(it => document.URL.includes(it)))
{
    return;
}

class NavbarComponent
{
    constructor()
    {
        this.html = ``;
        this.popupHtml = ``;
        this.flex = `0 0 auto`;
        this.disabled = false;
        this.href = ``;
    }
}
class Blank extends NavbarComponent
{
    constructor()
    {
        super();
        this.flex = "1 0 auto";
        this.disabled = true;
    }
}
class Logo extends NavbarComponent
{
    constructor()
    {
        super();
        this.href = `https://www.bilibili.com/`;
        this.html = /*html*/`<i class="custom-navbar-iconfont custom-navbar-icon-logo"></i>`;
    }
}
class SimpleLink extends NavbarComponent
{
    constructor(name, link)
    {
        super();
        this.html = name;
        this.href = link;
    }
}
class Category extends NavbarComponent
{
    constructor()
    {
        super();
        this.html = `主站`;
        this.popupHtml = /*html*/`
        <ul id="custom-navbar-home-popup">
            <li class="category-item" v-for="item of info">
                <a v-bind:href="item[1].link">
                    {{item[0]}}<span>{{item[1].count}}</span>
                </a>
            </li>
        </ul>
        `;
        this.getOnlineInfo().then(info =>
        {
            new Vue({
                el: "#custom-navbar-home-popup",
                data: {
                    info: Object.entries(info),
                },
            });
        });
    }
    async getOnlineInfo()
    {
        const json = await Ajax.getJson("https://api.bilibili.com/x/web-interface/online");
        if (parseInt(json.code) !== 0)
        {
            throw new Error(`[自定义顶栏] 分区投稿信息获取失败: ${json.message}`);
        }
        const regionCount = json.data.region_count;
        await SpinQuery.select("#custom-navbar-home-popup");
        return {
            动画: { count: regionCount[1], link: `https://www.bilibili.com/v/douga/` },
            番剧: { count: regionCount[13], link: `https://www.bilibili.com/anime/` },
            国创: { count: regionCount[167], link: `https://www.bilibili.com/guochuang/` },
            音乐: { count: regionCount[3], link: `https://www.bilibili.com/v/music/` },
            舞蹈: { count: regionCount[129], link: `https://www.bilibili.com/v/dance/` },
            游戏: { count: regionCount[4], link: `https://www.bilibili.com/v/game/` },
            科技: { count: regionCount[36], link: `https://www.bilibili.com/v/technology/` },
            数码: { count: regionCount[188], link: `https://www.bilibili.com/v/digital/` },
            生活: { count: regionCount[160], link: `https://www.bilibili.com/v/life/` },
            鬼畜: { count: regionCount[119], link: `https://www.bilibili.com/v/kichiku/` },
            时尚: { count: regionCount[155], link: `https://www.bilibili.com/v/fashion/` },
            广告: { count: regionCount[165], link: `https://www.bilibili.com/v/ad/ad/` },
            娱乐: { count: regionCount[5], link: `https://www.bilibili.com/v/ent/` },
            影视: { count: regionCount[181], link: `https://www.bilibili.com/v/cinephile/` },
            放映厅: { count: regionCount[177] + regionCount[23], link: `https://www.bilibili.com/cinema/` },
            // TODO: regionCount[11]?
            专栏: { count: ``, link: `https://www.bilibili.com/read/home` },
            直播: { count: ``, link: `https://live.bilibili.com` },
            小黑屋: { count: ``, link: `https://www.bilibili.com/blackroom/` },
            话题: { count: ``, link: `https://www.bilibili.com/blackboard/topic_list.html` },
            活动: { count: ``, link: `https://www.bilibili.com/blackboard/x/act_list` },
        };
    }
}

(async () =>
{
    const html = await import("customNavbarHtml");
    document.body.insertAdjacentHTML("beforeend", html);
    const navbar = document.querySelector(".custom-navbar");
    for (const [className, enabled] of Object.entries(settings.customNavbarSettings))
    {
        if (enabled === true)
        {
            navbar.classList.add(className);
        }
    }
    if (settings.useDarkStyle)
    {
        navbar.classList.add("dark");
    }
    const components = [
        new Logo,
        new Category,
        new SimpleLink("画友", "https://h.bilibili.com"),
        new SimpleLink("音频", "https://www.bilibili.com/audio/home/?type=10"),
        new SimpleLink("会员购", "https://show.bilibili.com/platform/home.html?msource=pc_web"),
        new SimpleLink("漫画", "https://manga.bilibili.com"),
        new Blank,
    ];
    new Vue({
        el: navbar,
        data: {
            components,
        },
    });
})();