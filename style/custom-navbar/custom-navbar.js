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
        this.showPopup = false;
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
        this.html = /*html*/`<a href="https://www.bilibili.com/"><i class="custom-navbar-iconfont custom-navbar-icon-logo"></i></a>`;
    }
}
class Home extends NavbarComponent
{
    constructor()
    {
        super();
        this.html = /*html*/`<a href="https://www.bilibili.com/">主站</a>`;
        this.popupHtml = /*html*/`
        <ul id="custom-navbar-home-popup">
            <li class="category-item" v-for="item of info">
                {{item[0]}}<span>{{item[1]}}</span>
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
            动画: regionCount[1],
            番剧: regionCount[13],
            国创: regionCount[167],
            音乐: regionCount[3],
            舞蹈: regionCount[129],
            游戏: regionCount[4],
            生活: regionCount[160],
            鬼畜: regionCount[119],
            时尚: regionCount[155],
            广告: regionCount[165],
            娱乐: regionCount[5],
            影视: regionCount[181],
            科技: regionCount[36],
            数码: regionCount[188],
            放映厅: regionCount[177] + regionCount[23],
            // TODO: regionCount[11]?
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
        new Home,
        new Blank,
    ];
    new Vue({
        el: navbar,
        data: {
            components,
        },
        methods: {
            togglePopup(component)
            {
                component.showPopup = !component.showPopup;
            }
        }
    });
})();