if (isIframe())
{
    return;
}
const supportedUrls = [
    "/www.bilibili.com",
    "/t.bilibili.com",
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
        this.requestedPopup = false;
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
class Upload extends NavbarComponent
{
    constructor()
    {
        super();
        this.href = "https://member.bilibili.com/v2#/upload/video/frame";
        this.html = /*html*/`
        <svg style="width:22px;height:22px" viewBox="0 0 24 24">
            <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
        </svg>
        <div id="upload-button">投稿</div>`;
        this.popupHtml = /*html*/`
        <ul id="upload-actions">
            <li><a href="https://member.bilibili.com/v2#/upload/text/apply">专栏投稿</a></li>
            <li><a href="https://member.bilibili.com/v2#/upload/audio/">音频投稿</a></li>
            <li><a href="https://member.bilibili.com/v2#/upload/video/frame">视频投稿</a></li>
            <li><a href="https://member.bilibili.com/v2#/upload-manager/article">投稿管理</a></li>
            <li><a href="https://member.bilibili.com/v2#/home">创作中心</a></li>
        </ul>
        `;
    }
}
class Category extends NavbarComponent
{
    constructor()
    {
        super();
        this.html = `主站`;
        this.requestedPopup = true;
        this.popupHtml = /*html*/`
        <ul id="custom-navbar-home-popup">
            <li class="category-item" v-for="item of info">
                <a v-bind:href="item[1].link">
                    {{item[0]}}<span>{{item[1].count}}</span>
                </a>
                <div class="popup" v-if="item[1].subRegions">
                    <a v-for="region of Object.entries(item[1].subRegions)" v-bind:href="region[1]">
                        {{region[0]}}
                    </a>
                </div>
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
            动画: {
                count: regionCount[1], link: `https://www.bilibili.com/v/douga/`,
                subRegions: {
                    "MAD·AMV": `https://www.bilibili.com/v/douga/mad/`,
                    "MMD·3D": `https://www.bilibili.com/v/douga/mmd/`,
                    "短片·手书·配音": `https://www.bilibili.com/v/douga/voice/`,
                    "综合": `https://www.bilibili.com/v/douga/other/`,
                },
            },
            番剧: {
                count: regionCount[13], link: `https://www.bilibili.com/anime/`,
                subRegions: {
                    "连载动画": `https://www.bilibili.com/v/anime/serial/`,
                    "完结动画": `https://www.bilibili.com/v/anime/finish/`,
                    "资讯": `https://www.bilibili.com/v/anime/information/`,
                    "官方延伸": `https://www.bilibili.com/v/anime/offical/`,
                    "新番时间表": `https://www.bilibili.com/anime/timeline/`,
                },
            },
            国创: {
                count: regionCount[167], link: `https://www.bilibili.com/guochuang/`,
                subRegions: {
                    "国产动画": `https://www.bilibili.com/v/guochuang/chinese/`,
                    "国产原创相关": `https://www.bilibili.com/v/guochuang/original/`,
                    "布袋戏": `https://www.bilibili.com/v/guochuang/puppetry/`,
                    "资讯": `https://www.bilibili.com/v/guochuang/information/`,
                    "新番时间表": `https://www.bilibili.com/guochuang/timeline/`,
                    "国产动画索引": `https://www.bilibili.com/guochuang/index/`,
                },
            },
            音乐: {
                count: regionCount[3], link: `https://www.bilibili.com/v/music/`,
                subRegions: {
                    "原创音乐": "https://www.bilibili.com/v/music/original/",
                    "翻唱": "https://www.bilibili.com/v/music/cover/",
                    "VOCALOID·UTAU": "https://www.bilibili.com/v/music/vocaloid/",
                    "电音": "https://www.bilibili.com/v/music/electronic/",
                    "演奏": "https://www.bilibili.com/v/music/perform/",
                    "MV": "https://www.bilibili.com/v/music/mv/",
                    "音乐现场": "https://www.bilibili.com/v/music/live/",
                    "音乐综合": "https://www.bilibili.com/v/music/other/",
                    "音频": "https://www.bilibili.com/audio/home?musicType=music",
                },
            },
            舞蹈: {
                count: regionCount[129], link: `https://www.bilibili.com/v/dance/`, subRegions: { "宅舞": "https://www.bilibili.com/v/dance/otaku/", "三次元舞蹈": "https://www.bilibili.com/v/dance/three_d/", "舞蹈教程": "https://www.bilibili.com/v/dance/demo/" },
            },
            游戏: {
                count: regionCount[4], link: `https://www.bilibili.com/v/game/`, subRegions: { "单机游戏": "https://www.bilibili.com/v/game/stand_alone/", "电子竞技": "https://www.bilibili.com/v/game/esports/", "手机游戏": "https://www.bilibili.com/v/game/mobile/", "网络游戏": "https://www.bilibili.com/v/game/online/", "桌游棋牌": "https://www.bilibili.com/v/game/board/", "GMV": "https://www.bilibili.com/v/game/gmv/", "音游": "https://www.bilibili.com/v/game/music/", "Mugen": "https://www.bilibili.com/v/game/mugen/", "游戏赛事": "https://www.bilibili.com/v/game/match/" },
            },
            科技: {
                count: regionCount[36], link: `https://www.bilibili.com/v/technology/`, subRegions: { "趣味科普人文": "https://www.bilibili.com/v/technology/fun/", "野生技术协会": "https://www.bilibili.com/v/technology/wild/", "演讲·公开课": "https://www.bilibili.com/v/technology/speech_course/", "星海": "https://www.bilibili.com/v/technology/military/", "机械": "https://www.bilibili.com/v/technology/mechanical/", "汽车": "https://www.bilibili.com/v/technology/automobile/" },
            },
            数码: { count: regionCount[188], link: `https://www.bilibili.com/v/digital/`, subRegions: { "手机平板": "https://www.bilibili.com/v/digital/mobile/", "电脑装机": "https://www.bilibili.com/v/digital/pc/", "摄影摄像": "https://www.bilibili.com/v/digital/photography/", "影音智能": "https://www.bilibili.com/v/digital/intelligence_av/" }, },
            生活: {
                count: regionCount[160], link: `https://www.bilibili.com/v/life/`, subRegions: { "搞笑": "https://www.bilibili.com/v/life/funny/", "日常": "https://www.bilibili.com/v/life/daily/", "美食圈": "https://www.bilibili.com/v/life/food/", "动物圈": "https://www.bilibili.com/v/life/animal/", "手工": "https://www.bilibili.com/v/life/handmake/", "绘画": "https://www.bilibili.com/v/life/painting/", "运动": "https://www.bilibili.com/v/life/sports/", "其他": "https://www.bilibili.com/v/life/other/" },
            },
            鬼畜: {
                count: regionCount[119], link: `https://www.bilibili.com/v/kichiku/`, subRegions: { "鬼畜调教": "https://www.bilibili.com/v/kichiku/guide/", "音MAD": "https://www.bilibili.com/v/kichiku/mad/", "人力VOCALOID": "https://www.bilibili.com/v/kichiku/manual_vocaloid/", "教程演示": "https://www.bilibili.com/v/kichiku/course/" },
            },
            时尚: { count: regionCount[155], link: `https://www.bilibili.com/v/fashion/`, subRegions: { "美妆": "https://www.bilibili.com/v/fashion/makeup/", "服饰": "https://www.bilibili.com/v/fashion/clothing/", "健身": "https://www.bilibili.com/v/fashion/aerobics/", "T台": "https://www.bilibili.com/v/fashion/catwalk/", "风尚标": "https://www.bilibili.com/v/fashion/trends/" }, },
            广告: { count: regionCount[165], link: `https://www.bilibili.com/v/ad/ad/`, },
            娱乐: {
                count: regionCount[5], link: `https://www.bilibili.com/v/ent/`, subRegions: { "综艺": "https://www.bilibili.com/v/ent/variety/", "明星": "https://www.bilibili.com/v/ent/star/", "Korea相关": "https://www.bilibili.com/v/ent/korea/" },
            },
            影视: {
                count: regionCount[181], link: `https://www.bilibili.com/v/cinephile/`, subRegions: { "影视杂谈": "https://www.bilibili.com/v/cinephile/cinecism/", "影视剪辑": "https://www.bilibili.com/v/cinephile/montage/", "短片": "https://www.bilibili.com/v/cinephile/shortfilm/", "预告·资讯": "https://www.bilibili.com/v/cinephile/trailer_info/", "特摄": "https://www.bilibili.com/v/cinephile/tokusatsu/" },
            },
            放映厅: { count: regionCount[177] + regionCount[23] + regionCount[11], link: `https://www.bilibili.com/cinema/`, subRegions: { "纪录片": "https://www.bilibili.com/documentary/", "电影": "https://www.bilibili.com/movie/", "电视剧": "https://www.bilibili.com/tv/" }, },
            专栏: { count: ``, link: `https://www.bilibili.com/read/home`, },
            直播: {
                count: ``, link: `https://live.bilibili.com`, subRegions: { "全部直播": "https://live.bilibili.com/all?visit_id=5icxsa0kmts0", "游戏直播": "https://live.bilibili.com/p/eden/area-tags?parentAreaId=2&areaId=0&visit_id=5icxsa0kmts0#/2/0", "手游直播": "https://live.bilibili.com/p/eden/area-tags?parentAreaId=3&areaId=0&visit_id=5icxsa0kmts0#/3/0", "娱乐直播": "https://live.bilibili.com/p/eden/area-tags?parentAreaId=1&areaId=0&visit_id=5icxsa0kmts0#/1/0", "电台直播": "https://live.bilibili.com/p/eden/area-tags?parentAreaId=5&areaId=0&visit_id=5icxsa0kmts0#/5/0", "绘画直播": "https://live.bilibili.com/p/eden/area-tags?parentAreaId=4&areaId=0&visit_id=5icxsa0kmts0#/4/0" },
            },
            小黑屋: { count: ``, link: `https://www.bilibili.com/blackroom/`, },
            话题: { count: ``, link: `https://www.bilibili.com/blackboard/topic_list.html`, },
            活动: { count: ``, link: `https://www.bilibili.com/blackboard/x/act_list`, },
        };
    }
}
class UserInfo extends NavbarComponent
{
    constructor()
    {
        super();
        this.html = /*html*/`
            <div class="user-face"></div>
        `;
        this.popupHtml = /*html*/`
            <div class="user-info-panel">
                <div v-if="isLogin" class="logged-in">
                    <span class="name">{{uname}}</span>
                    <span class="type">{{userType}}</span>
                    <div class="row">
                        <span class="level">LV<strong>{{level_info.current_level}}</strong></span>
                        <div class="level-progress">
                            <div class="level-progress-thumb" v-bind:style="levelProgressStyle"></div>
                        </div>
                        <span class="level-progress-label">{{level_info.current_exp}} / {{level_info.next_exp}}</span>
                    </div>
                    <div class="row">
                        <span class="coins">{{money}}</span>
                        <span class="b-coins">{{wallet.bcoin_balance}}</span>
                        <div class="verifications">
                            <a target="_blank" href="https://passport.bilibili.com/account/security#/bindmail">
                                <i class="mdi mdi-email" v-bind:class="{verified: email_verified }"></i>
                            </a>
                            <a target="_blank" href="https://passport.bilibili.com/account/security#/bindphone">
                                <i class="mdi mdi-cellphone-android" v-bind:class="{verified: mobile_verified }"></i>
                            </a>
                        </div>
                    </div>
                    <div class="row operations">
                        <a target="_blank" href="https://account.bilibili.com/account/home">个人中心</a>
                        <a target="_blank" href="https://member.bilibili.com/v2#/upload-manager/article">投稿管理</a>
                    </div>
                    <div class="row operations">
                        <a target="_blank" href="https://pay.bilibili.com/">B币钱包</a>
                        <a target="_blank" href="https://link.bilibili.com/p/center/index">直播中心</a>
                    </div>
                    <div class="row operations">
                        <a target="_blank" href="https://show.bilibili.com/orderlist">订单中心</a>
                        <a href="https://account.bilibili.com/login?act=exit">退出登录</a>
                    </div>
                </div>
                <div v-else class="not-logged-in">

                </div>
            </div>
        `;
        // Login https://passport.bilibili.com/login
        // Sign up https://passport.bilibili.com/register/phone.html
        this.requestedPopup = true;
        this.init();
    }
    async init()
    {
        const panel = await SpinQuery.select(".user-info-panel");
        const face = await SpinQuery.select(".user-face");
        const json = await Ajax.getJsonWithCredentials("https://api.bilibili.com/x/web-interface/nav");
        // if (json.code !== 0 || json.code !== -101)
        // {
        //     logError("[自定义顶栏] 获取用户登录信息失败.");
        //     return;
        // }
        const userInfo = json.data;
        face.style.backgroundImage = `url('${userInfo.face}')`;
        new Vue({
            el: panel,
            data: {
                ...userInfo,
            },
            computed: {
                userType()
                {
                    if (!this.isLogin)
                    {
                        return "未登录";
                    }
                    if (this.level_info.current_level === 0)
                    {
                        return "注册会员";
                    }
                    if (this.vipStatus === 1)
                    {
                        if (this.vipType === 1)
                        {
                            return this.vip_theme_type ? "小会员" : "大会员";
                        }
                        else if (this.vipType === 2)
                        {
                            return this.vip_theme_type ? "年度小会员" : "年度大会员";
                        }
                    }
                    return "正式会员";
                },
                levelProgressStyle()
                {
                    const progress = (this.level_info.next_exp - this.level_info.current_exp) / (this.level_info.next_exp - this.level_info.current_min);
                    return {
                        transform: `scaleX(${progress})`
                    };
                }
            },
        });
    }
}
class SearchBox extends NavbarComponent
{
    constructor()
    {
        super();
        this.disabled = true;
        this.html = /*html*/`
            <form id="custom-navbar-search" autocomplete="off" target="_blank" method="get" action="https://search.bilibili.com/all">
                <input type="hidden" name="from_source" value="banner_search">
                <input type="text" placeholder="搜索" name="keyword">
                <a style="display: none" target="_blank" class="recommended-target"></a>
                <button type="submit" title="搜索">
                    <svg style="width:22px;height:22px" viewBox="0 0 24 24">
                        <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                    </svg>
                </button>
            </form>
        `;
        this.init();
    }
    async init()
    {
        const form = await SpinQuery.select("#custom-navbar-search");
        const keyword = form.querySelector("input[name='keyword']");
        form.addEventListener("submit", e =>
        {
            if (keyword.value === "")
            {
                if (!settings.hideTopSearch)
                {
                    form.querySelector(".recommended-target").click();
                }
                e.preventDefault();
                return false;
            }
            return true;
        });
        if (!settings.hideTopSearch)
        {
            const json = await Ajax.getJson("https://api.bilibili.com/x/web-interface/search/default");
            if (json.code === 0)
            {
                keyword.setAttribute("placeholder", json.data.show_name);
                form.querySelector(".recommended-target").setAttribute("href", `https://www.bilibili.com/${json.data.name}`)
            }
            else
            {
                console.error("[自定义顶栏] 获取搜索推荐词失败");
            }
        }
    }
}
class Iframe extends NavbarComponent
{
    constructor(name, link, { src, width, height, lazy })
    {
        super();
        this.html = name;
        this.href = link;
        this.popupHtml = /*html*/`
            <iframe src="${src}" frameborder="0" width="${width}" height="${height}"></iframe>
        `;
        this.noPadding = true;
        this.requestedPopup = lazy ? false : true;
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
        new SimpleLink("排行", "https://www.bilibili.com/ranking"),
        new SimpleLink("画友", "https://h.bilibili.com"),
        new SimpleLink("音频", "https://www.bilibili.com/audio/home/?type=10"),
        new Iframe("游戏中心", "https://game.bilibili.com/", {
            src: `https://www.bilibili.com/page-proxy/game-nav.html`,
            width: `680px`,
            height: `260px`,
            lazy: true,
        }),
        new Iframe("直播", "https://live.bilibili.com", {
            src: `https://live.bilibili.com/blackboard/dropdown-menu.html`,
            width: `528px`,
            height: `266px`,
            lazy: true,
        }),
        new SimpleLink("会员购", "https://show.bilibili.com/platform/home.html?msource=pc_web"),
        new SimpleLink("漫画", "https://manga.bilibili.com"),
        new Blank,
        new SearchBox,
        new UserInfo,
        new Iframe("消息", "https://message.bilibili.com/", {
            src: `https://message.bilibili.com/pages/nav/index`,
            width: `110px`,
            height: `210px`,
            lazy: false,
        }),
        new Iframe("动态", "https://t.bilibili.com/", {
            src: `https://t.bilibili.com/pages/nav/index`,
            width: `380px`,
            height: `422px`,
            lazy: true,
        }),
        new Upload,
    ];
    new Vue({
        el: navbar,
        data: {
            components,
        },
        methods: {
            requestPopup(component)
            {
                if (!component.requestedPopup)
                {
                    this.$set(component, `requestedPopup`, true);
                }
            }
        },
    });
})();