if (isIframe())
{
    return;
}
const attributes = {
    widget: {
        content: /*html*/`
        <div class="gui-settings-flat-button" id="custom-navbar-settings">
            <i class="mdi mdi-24px mdi-auto-fix"></i>
            <span>顶栏次序</span>
        </div>`,
        condition: () => false, // TODO: remove this line after complete
        success: async () =>
        {
            const settingsPanel = await SpinQuery.select(".custom-navbar-settings");
            // const customNavbar = document.querySelector(".custom-navbar");
            document.querySelector("#custom-navbar-settings").addEventListener("click", () =>
            {
                settingsPanel.classList.toggle("show");
                document.querySelector(".gui-settings-mask").click();
            });
            new Vue({
                el: ".custom-navbar-settings",
                data: {
                },
            });
        },
    },
    unload: () =>
    {
        const navbar = document.querySelector(".custom-navbar");
        if (navbar !== null)
        {
            navbar.style.display = "none";
        }
        resources.removeStyle("customNavbarStyle");
    },
    reload: () =>
    {
        const navbar = document.querySelector(".custom-navbar");
        if (navbar !== null)
        {
            navbar.style.display = "flex";
        }
        resources.applyImportantStyle("customNavbarStyle");
    },
};
const classHandler = (key, value, element) =>
{
    element.classList[value ? "add" : "remove"](key);
}
const darkHandler = value =>
{
    document.querySelector(".custom-navbar").classList[value ? "add" : "remove"]("dark");
    document.querySelector(".custom-navbar-settings").classList[value ? "add" : "remove"]("dark");
};
addSettingsListener("allNavbarFill", value => classHandler("all-navbar-fill", value, document.body));
classHandler("all-navbar-fill", settings.allNavbarFill, document.body);
const supportedUrls = [
    "/www.bilibili.com",
    "/t.bilibili.com",
    "/search.bilibili.com",
    "/space.bilibili.com",
    "/account.bilibili.com",
    "/pay.bilibili.com",
    "/member.bilibili.com",
    "/big.bilibili.com",
    "/message.bilibili.com",
];
const unsupportedUrls = [
    "/t.bilibili.com/lottery/h5/index/#/result",
]
if (!supportedUrls.some(it => document.URL.includes(it))
    || unsupportedUrls.some(it => document.URL.includes(it)))
{
    return attributes;
}

let userInfo = {};
let orders = {

};
class NavbarComponent
{
    constructor()
    {
        this.html = ``;
        this.popupHtml = ``;
        this.flex = `0 0 auto`;
        this.disabled = false;
        this.requestedPopup = false;
        this.onPopup = null;
        this.href = null;
        this.notifyCount = 0;
        this.touch = settings.touchNavBar;
    }
    get name()
    {
        return "undefined";
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
    get name()
    {
        return "blank";
    }
}
class Logo extends NavbarComponent
{
    constructor()
    {
        super();
        this.href = `https://www.bilibili.com/`;
        this.html = /*html*/`<i class="custom-navbar-iconfont custom-navbar-icon-logo"></i>`;
        this.touch = false;
    }
    get name()
    {
        return "logo";
    }
}
class SimpleLink extends NavbarComponent
{
    constructor(name, link, linkName)
    {
        super();
        this.linkName = linkName;
        this.html = name;
        this.href = link;
        this.touch = false;
    }
    get name()
    {
        return this.linkName + "-link";
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
            <li><a target="_blank" href="https://member.bilibili.com/v2#/upload/text/apply">专栏投稿</a></li>
            <li><a target="_blank" href="https://member.bilibili.com/v2#/upload/audio/">音频投稿</a></li>
            <li><a target="_blank" href="https://member.bilibili.com/v2#/upload/video/frame">视频投稿</a></li>
            <li><a target="_blank" href="https://member.bilibili.com/v2#/upload-manager/article">投稿管理</a></li>
            <li><a target="_blank" href="https://member.bilibili.com/v2#/home">创作中心</a></li>
        </ul>
        `;
    }
    get name()
    {
        return "upload";
    }
}
class Messages extends NavbarComponent
{
    constructor()
    {
        super();
        this.href = "https://message.bilibili.com/";
        this.html = "消息";
        this.popupHtml = /*html*/`
        <ul id="message-list">
            <li><a data-name="reply_me" target="_blank" href="https://message.bilibili.com/#/reply">回复我的</a></li>
            <li><a data-name="at_me" target="_blank" href="https://message.bilibili.com/#/at">@我的</a></li>
            <li><a data-name="praise_me" target="_blank" href="https://message.bilibili.com/#/love">收到的赞</a></li>
            <li><a data-name="notify_me" target="_blank" href="https://message.bilibili.com/#/system">系统通知</a></li>
        </ul>
        `;
        this.requestedPopup = true;
        this.init();
    }
    get name()
    {
        return "messages";
    }
    async init()
    {
        const json = await Ajax.getJsonWithCredentials("https://message.bilibili.com/api/notify/query.notify.count.do");
        const list = await SpinQuery.select("#message-list");
        const items = [...list.querySelectorAll("a[data-name]")];
        const names = items.map(it => it.getAttribute("data-name"));

        if (json.code !== 0)
        {
            return;
        }
        const notifyElement = await SpinQuery.select(`.custom-navbar li[data-name='${this.name}'] .notify-count`);
        let totalCount = names.reduce((acc, it) => acc + json.data[it], 0);
        if (totalCount === 0)
        {
            return;
        }
        notifyElement.innerHTML = totalCount;
        names.forEach((name, index) =>
        {
            const count = json.data[name];
            if (count > 0)
            {
                items[index].setAttribute("data-count", count);
            }
            else
            {
                items[index].removeAttribute("data-count");
            }
        });
        items.forEach(item =>
        {
            item.addEventListener("click", () =>
            {
                const count = item.getAttribute("data-count");
                item.removeAttribute("data-count");
                totalCount -= count;
                notifyElement.innerHTML = totalCount || "";
            });
        })
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
            <li class="category-item" v-for="item of info" v-bind:class="{ main: item[1].count }">
                <a v-bind:href="item[1].link">
                    <svg aria-hidden="true">
                        <use v-bind:href="'#header-icon-' + item[1].icon" v-bind:xlink:href="'#header-icon-' + item[1].icon"></use>
                    </svg>
                    <div>{{item[0]}}</div>
                    <span>{{item[1].count}}</span>
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
    get name()
    {
        return "category";
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
                icon: "douga",
                count: regionCount[1], link: `https://www.bilibili.com/v/douga/`,
                subRegions: {
                    "MAD·AMV": `https://www.bilibili.com/v/douga/mad/`,
                    "MMD·3D": `https://www.bilibili.com/v/douga/mmd/`,
                    "短片·手书·配音": `https://www.bilibili.com/v/douga/voice/`,
                    "综合": `https://www.bilibili.com/v/douga/other/`,
                },
            },
            番剧: {
                icon: "anime",
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
                icon: "guochuang",
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
                icon: "music",
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
                icon: "dance",
                count: regionCount[129], link: `https://www.bilibili.com/v/dance/`, subRegions: { "宅舞": "https://www.bilibili.com/v/dance/otaku/", "三次元舞蹈": "https://www.bilibili.com/v/dance/three_d/", "舞蹈教程": "https://www.bilibili.com/v/dance/demo/" },
            },
            游戏: {
                icon: "game",
                count: regionCount[4], link: `https://www.bilibili.com/v/game/`, subRegions: { "单机游戏": "https://www.bilibili.com/v/game/stand_alone/", "电子竞技": "https://www.bilibili.com/v/game/esports/", "手机游戏": "https://www.bilibili.com/v/game/mobile/", "网络游戏": "https://www.bilibili.com/v/game/online/", "桌游棋牌": "https://www.bilibili.com/v/game/board/", "GMV": "https://www.bilibili.com/v/game/gmv/", "音游": "https://www.bilibili.com/v/game/music/", "Mugen": "https://www.bilibili.com/v/game/mugen/", "游戏赛事": "https://www.bilibili.com/v/game/match/" },
            },
            科技: {
                icon: "technology",
                count: regionCount[36], link: `https://www.bilibili.com/v/technology/`, subRegions: { "趣味科普人文": "https://www.bilibili.com/v/technology/fun/", "野生技术协会": "https://www.bilibili.com/v/technology/wild/", "演讲·公开课": "https://www.bilibili.com/v/technology/speech_course/", "星海": "https://www.bilibili.com/v/technology/military/", "机械": "https://www.bilibili.com/v/technology/mechanical/", "汽车": "https://www.bilibili.com/v/technology/automobile/" },
            },
            数码: { icon: "digital", count: regionCount[188], link: `https://www.bilibili.com/v/digital/`, subRegions: { "手机平板": "https://www.bilibili.com/v/digital/mobile/", "电脑装机": "https://www.bilibili.com/v/digital/pc/", "摄影摄像": "https://www.bilibili.com/v/digital/photography/", "影音智能": "https://www.bilibili.com/v/digital/intelligence_av/" }, },
            生活: {
                icon: "life",
                count: regionCount[160], link: `https://www.bilibili.com/v/life/`, subRegions: { "搞笑": "https://www.bilibili.com/v/life/funny/", "日常": "https://www.bilibili.com/v/life/daily/", "美食圈": "https://www.bilibili.com/v/life/food/", "动物圈": "https://www.bilibili.com/v/life/animal/", "手工": "https://www.bilibili.com/v/life/handmake/", "绘画": "https://www.bilibili.com/v/life/painting/", "运动": "https://www.bilibili.com/v/life/sports/", "其他": "https://www.bilibili.com/v/life/other/" },
            },
            鬼畜: {
                icon: "kichiku",
                count: regionCount[119], link: `https://www.bilibili.com/v/kichiku/`, subRegions: { "鬼畜调教": "https://www.bilibili.com/v/kichiku/guide/", "音MAD": "https://www.bilibili.com/v/kichiku/mad/", "人力VOCALOID": "https://www.bilibili.com/v/kichiku/manual_vocaloid/", "教程演示": "https://www.bilibili.com/v/kichiku/course/" },
            },
            时尚: { icon: "fashion", count: regionCount[155], link: `https://www.bilibili.com/v/fashion/`, subRegions: { "美妆": "https://www.bilibili.com/v/fashion/makeup/", "服饰": "https://www.bilibili.com/v/fashion/clothing/", "健身": "https://www.bilibili.com/v/fashion/aerobics/", "T台": "https://www.bilibili.com/v/fashion/catwalk/", "风尚标": "https://www.bilibili.com/v/fashion/trends/" }, },
            广告: { icon: "ad", count: regionCount[165], link: `https://www.bilibili.com/v/ad/ad/`, },
            娱乐: {
                icon: "ent",
                count: regionCount[5], link: `https://www.bilibili.com/v/ent/`, subRegions: { "综艺": "https://www.bilibili.com/v/ent/variety/", "明星": "https://www.bilibili.com/v/ent/star/", "Korea相关": "https://www.bilibili.com/v/ent/korea/" },
            },
            影视: {
                icon: "cinephile",
                count: regionCount[181], link: `https://www.bilibili.com/v/cinephile/`, subRegions: { "影视杂谈": "https://www.bilibili.com/v/cinephile/cinecism/", "影视剪辑": "https://www.bilibili.com/v/cinephile/montage/", "短片": "https://www.bilibili.com/v/cinephile/shortfilm/", "预告·资讯": "https://www.bilibili.com/v/cinephile/trailer_info/", "特摄": "https://www.bilibili.com/v/cinephile/tokusatsu/" },
            },
            放映厅: { icon: "cinema", count: regionCount[177] + regionCount[23] + regionCount[11], link: `https://www.bilibili.com/cinema/`, subRegions: { "纪录片": "https://www.bilibili.com/documentary/", "电影": "https://www.bilibili.com/movie/", "电视剧": "https://www.bilibili.com/tv/" }, },
            专栏: { icon: "read", count: ``, link: `https://www.bilibili.com/read/home`, },
            直播: {
                icon: "zhibo",
                count: ``, link: `https://live.bilibili.com`, subRegions: { "全部直播": "https://live.bilibili.com/all?visit_id=5icxsa0kmts0", "游戏直播": "https://live.bilibili.com/p/eden/area-tags?parentAreaId=2&areaId=0&visit_id=5icxsa0kmts0#/2/0", "手游直播": "https://live.bilibili.com/p/eden/area-tags?parentAreaId=3&areaId=0&visit_id=5icxsa0kmts0#/3/0", "娱乐直播": "https://live.bilibili.com/p/eden/area-tags?parentAreaId=1&areaId=0&visit_id=5icxsa0kmts0#/1/0", "电台直播": "https://live.bilibili.com/p/eden/area-tags?parentAreaId=5&areaId=0&visit_id=5icxsa0kmts0#/5/0", "绘画直播": "https://live.bilibili.com/p/eden/area-tags?parentAreaId=4&areaId=0&visit_id=5icxsa0kmts0#/4/0" },
            },
            小黑屋: { icon: "blackroom", count: ``, link: `https://www.bilibili.com/blackroom/`, },
            话题: { icon: "topic", count: ``, link: `https://www.bilibili.com/blackboard/topic_list.html`, },
            活动: { icon: "activit", count: ``, link: `https://www.bilibili.com/blackboard/x/act_list`, },
        };
    }
}
class UserInfo extends NavbarComponent
{
    constructor()
    {
        super();
        this.href = "https://space.bilibili.com";
        this.html = /*html*/`
            <div class="user-face-container">
                <img src='data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"></svg>' class="user-face"></img>
                <img src='data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"></svg>' class="user-pendant"></img>
            </div>
        `;
        this.popupHtml = /*html*/`
            <div class="user-info-panel">
                <div v-if="isLogin" class="logged-in">
                    <a class="name" target="_blank" href="https://space.bilibili.com/">{{uname}}</a>
                    <div class="row">
                        <a target="_blank" title="等级" href="https://account.bilibili.com/site/record?type=exp" class="level">LV<strong>{{level_info.current_level}}</strong></a>
                        <a target="_blank" href="https://account.bilibili.com/account/big" class="type">{{userType}}</a>
                        <div class="level-progress">
                            <div class="level-progress-thumb" v-bind:style="levelProgressStyle"></div>
                        </div>
                        <span class="level-progress-label">{{level_info.current_exp}} / {{level_info.next_exp}}</span>
                    </div>
                    <div class="row">
                        <div class="coins-container">
                            <a target="_blank" href="https://account.bilibili.com/site/coin" title="硬币" class="coins">{{money}}</a>
                            <a target="_blank" href="https://pay.bilibili.com/bb_balance.html" title="B币" class="b-coins">{{wallet.bcoin_balance}}</a>
                        </div>
                        <div class="verifications">
                            <a target="_blank" v-bind:class="{verified: email_verified }" title="邮箱验证" href="https://passport.bilibili.com/account/security#/bindmail">
                                <i class="mdi mdi-email"></i>
                            </a>
                            <a target="_blank" v-bind:class="{verified: mobile_verified }" title="手机验证" href="https://passport.bilibili.com/account/security#/bindphone">
                                <i class="mdi mdi-cellphone-android"></i>
                            </a>
                        </div>
                    </div>
                    <div class="row operations">
                        <a target="_blank" href="https://account.bilibili.com/account/home">
                            <i class="mdi mdi-account"></i>个人中心
                        </a>
                        <a target="_blank" href="https://member.bilibili.com/v2#/upload-manager/article">
                            <i class="mdi mdi-square-edit-outline"></i>投稿管理
                        </a>
                    </div>
                    <div class="row operations">
                        <a target="_blank" href="https://pay.bilibili.com/">
                            <i class="mdi mdi-wallet"></i>B币钱包
                        </a>
                        <a target="_blank" href="https://link.bilibili.com/p/center/index">
                            <i class="mdi mdi-video-input-antenna"></i>直播中心
                        </a>
                    </div>
                    <div class="row operations">
                        <a target="_blank" href="https://show.bilibili.com/orderlist">
                            <i class="mdi mdi-ticket"></i>订单中心
                        </a>
                        <a href="https://account.bilibili.com/login?act=exit">
                            <i class="mdi mdi-logout"></i>退出登录
                        </a>
                    </div>
                </div>
                <div v-else class="not-logged-in">
                    <a href="https://passport.bilibili.com/login" class="login">登录</a>
                    <a href="https://passport.bilibili.com/register/phone.html" class="sign-up">注册</a>
                </div>
            </div>
        `;
        this.requestedPopup = true;
        this.init();
    }
    get name()
    {
        return "user-info";
    }
    async init()
    {
        const panel = await SpinQuery.select(".custom-navbar .user-info-panel");
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
        const face = await SpinQuery.select(".custom-navbar .user-face-container .user-face");
        if (userInfo.isLogin)
        {
            const faceUrl = userInfo.face.replace("http", "https");
            // face.setAttribute("src", faceUrl);
            const faceBaseSize = 68;
            const dpis = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4];
            face.setAttribute("srcset", dpis.map(dpi =>
            {
                return `${faceUrl}@${parseInt(faceBaseSize * dpi)}w_${parseInt(faceBaseSize * dpi)}h.jpg ${dpi}x`;
            }).join(","));
            // face.style.backgroundImage = `url('${userInfo.face}@68w_68h.jpg')`;
            if (userInfo.pendant.image)
            {
                const pendant = await SpinQuery.select(".custom-navbar .user-face-container .user-pendant");
                const pendantUrl = userInfo.pendant.image.replace("http", "https");
                // pendant.setAttribute("src", pendantUrl);
                const pendantBaseSize = 116;
                pendant.setAttribute("srcset", dpis.reduce((acc, dpi) =>
                {
                    return acc + `, ${pendantUrl}@${parseInt(pendantBaseSize * dpi)}w_${parseInt(pendantBaseSize * dpi)}h.png ${dpi}x`;
                }, ""));
                // pendant.style.backgroundImage = `url('${userInfo.pendant.image}@116w_116h.jpg')`;
            }
        }
        else
        {
            face.setAttribute("src", "https://static.hdslb.com/images/akari.jpg");
            // face.style.backgroundImage = `url('https://static.hdslb.com/images/akari.jpg')`;
        }
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
                <input type="text" placeholder="搜索" name="keyword">
                <input type="hidden" name="from_source" value="banner_search">
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
                if (json.data.name.startsWith("av"))
                {
                    form.querySelector(".recommended-target").setAttribute("href", `https://www.bilibili.com/${json.data.name}`);
                }
                else
                {
                    form.querySelector(".recommended-target").setAttribute("href", `https://search.bilibili.com/all?keyword=${json.data.name}`);
                }
            }
            else
            {
                console.error("[自定义顶栏] 获取搜索推荐词失败");
            }
        }
    }
    get name()
    {
        return "search";
    }
}
class Iframe extends NavbarComponent
{
    constructor(name, link, { src, width, height, lazy, iframeName })
    {
        super();
        this.iframeName = iframeName;
        this.html = name;
        this.href = link;
        this.popupHtml = /*html*/`
            <iframe src="${src}" frameborder="0" width="${width}" height="${height}"></iframe>
        `;
        this.noPadding = true;
        this.requestedPopup = lazy ? false : true;
        this.touch = false;
        this.transparent = true;
    }
    get name()
    {
        return "iframe-" + this.iframeName;
    }
}
class NotifyIframe extends Iframe
{
    constructor(...args)
    {
        super(...args);
        this.touch = settings.touchNavBar;
        this.getNotifyCount();
    }
    getApiUrl()
    {
        return null;
    }
    getCount()
    {
        return 0;
    }
    async getNotifyCount()
    {
        const notifyElement = await SpinQuery.select(`.custom-navbar li[data-name='${this.name}'] .notify-count`);
        const json = await Ajax.getJsonWithCredentials(this.getApiUrl());
        const count = this.getCount(json);
        if (json.code === 0 && count !== 0)
        {
            notifyElement.innerHTML = count;
            this.onPopup = () =>
            {
                notifyElement.innerHTML = '';
            };
        }
    }
}
class Activities extends NotifyIframe
{
    constructor()
    {
        super("动态", "https://t.bilibili.com/", {
            src: `https://t.bilibili.com/pages/nav/index`,
            width: `380px`,
            height: `422px`,
            lazy: true,
        });
    }
    getApiUrl()
    {
        const updateNumber = document.cookie.replace(new RegExp(`(?:(?:^|.*;\\s*)bp_t_offset_${userInfo.mid}\\s*\\=\\s*([^;]*).*$)|^.*$`), "$1");
        return `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_num?rsp_type=1&uid=${userInfo.mid}&update_num_dy_id=${updateNumber}&type_list=8,512,64`;
    }
    getCount(json)
    {
        return json.data.update_num;
    }
    get name()
    {
        return "activities";
    }
}
// class Messages extends NotifyIframe
// {
//     constructor()
//     {
//         super("消息", "https://message.bilibili.com/", {
//             src: `https://message.bilibili.com/pages/nav/index`,
//             width: `110px`,
//             height: `210px`,
//             lazy: false,
//         });
//     }
//     getApiUrl()
//     {
//         return "https://message.bilibili.com/api/notify/query.notify.count.do";
//     }
//     getCount(json)
//     {
//         return Object.values(json.data).reduce((a, b) => a + b, 0);
//     }
// }
class VideoList extends NavbarComponent
{
    constructor({ mainUrl, name, apiUrl, listName, listMap })
    {
        super();
        this.href = mainUrl;
        this.listName = listName;
        this.html = name;
        this.requestedPopup = false;
        this.popupHtml = /*html*/`
            <ol class="video-list ${listName}">
                <li class="loading">加载中...</li>
            </ol>
        `;
        this.onPopup = async () =>
        {
            if (!listMap)
            {
                return;
            }
            const videoListElement = await SpinQuery.select(`.video-list.${listName}`);
            if (videoListElement === null)
            {
                return;
            }
            const json = await Ajax.getJsonWithCredentials(apiUrl);
            if (json.code !== 0)
            {
                logError(`加载${name}信息失败. 错误码: ${json.code} ${json.message}`);
                return;
            }
            const videoList = listMap(json).join("");
            videoListElement.insertAdjacentHTML("beforeend", videoList + /*html*/`
                <li class="more"><a target="_blank" href="${mainUrl}">查看更多</a></li>
            `);
            videoListElement.classList.add("loaded");
        };
    }
    get name()
    {
        return "list-" + this.listName;
    }
}
class WatchlaterList extends VideoList
{
    constructor()
    {
        super({
            name: "稍后再看",
            mainUrl: "https://www.bilibili.com/watchlater/#/list",
            apiUrl: "https://api.bilibili.com/x/v2/history/toview/web",
            listName: "watchlater",
            listMap: json =>
            {
                return json.data.list.slice(0, 6).map(item =>
                {
                    const pages = item.pages.map(it => it.cid);
                    const page = item.cid === 0 ? 1 : pages.indexOf(item.cid) + 1;
                    const href = settings.watchLaterRedirect ?
                        `https://www.bilibili.com/video/av${item.aid}?p=${page}` :
                        `https://www.bilibili.com/watchlater/#/av${item.aid}/p${page}`;
                    return /*html*/`<li>
                        <a target="_blank" href="${href}">${item.title}</a>
                    </li>`;
                });
            },
        });
    }
}
class FavoritesList extends VideoList
{
    constructor()
    {
        super({
            name: "收藏",
            mainUrl: `https://space.bilibili.com/${userInfo.mid}/favlist`,
            apiUrl: "https://api.bilibili.com/medialist/gateway/coll/resource/recent",
            listName: "favorites",
            listMap: json =>
            {
                return json.data.map(item =>
                {
                    return /*html*/`<li>
                        <a target="_blank" href="https://www.bilibili.com/video/av${item.id}">${item.title}</a>
                    </li>`;
                });
            },
        });
    }
}
class HistoryList extends VideoList
{
    constructor()
    {
        super({
            name: "历史",
            mainUrl: "https://www.bilibili.com/account/history",
            apiUrl: "https://api.bilibili.com/x/v2/history?pn=1&ps=6",
            listName: "history",
            listMap: json =>
            {
                return json.data.map(item =>
                {
                    let parameter = [];
                    let description = "";
                    const page = item.page.page;
                    const progress = item.progress >= 0 ? item.progress / item.duration : 1;
                    if (page !== 1)
                    {
                        parameter.push(`p=${page}`);
                        description += `看到第${page}话`;
                    }
                    if (item.progress > 0 && item.progress < item.duration)
                    {
                        parameter.push(`t=${item.progress}`);
                        description += ` ${Math.floor(progress * 100)}%`;
                    }
                    else if (item.progress === 0)
                    {
                        description += ` 刚开始看`;
                    }
                    else
                    {
                        description += " 100%";
                    }
                    return /*html*/`<li class="history-item">
                        <a target="_blank" href="https://www.bilibili.com/video/av${item.aid}?${parameter.join("&")}">
                            <span class="title">${item.title}</span>
                            <span class="description">${description}</span>
                            <div class="progress" style="transform: scaleX(${progress})"></div>
                        </a>
                    </li>`;
                });
            },
        });
    }
}

(async () =>
{
    const html = await import("customNavbarHtml");
    const json = await Ajax.getJsonWithCredentials("https://api.bilibili.com/x/web-interface/nav");
    userInfo = json.data;
    document.body.insertAdjacentHTML("beforeend", html);
    addSettingsListener("useDarkStyle", darkHandler);
    darkHandler(settings.useDarkStyle);
    ["Fill", "Shadow", "Compact", "Blur"].forEach(item =>
    {
        addSettingsListener("customNavbar" + item, value => classHandler(item.toLowerCase(), value, document.querySelector(".custom-navbar")));
        classHandler(item.toLowerCase(), settings["customNavbar" + item], document.querySelector(".custom-navbar"));
    });
    SpinQuery.condition(() => document.getElementById("banner_link"),
        banner => banner === null ? null : banner.style.backgroundImage,
        banner =>
        {
            Observer.attributes(banner, () =>
            {
                const blurLayers = document.querySelectorAll(".custom-navbar .blur-layer");
                blurLayers.forEach(blurLayer =>
                {
                    blurLayer.style.backgroundImage = banner.style.backgroundImage;
                    blurLayer.setAttribute("data-image", banner.style.backgroundImage);
                });
            });
        });

    const components = [
        new Logo,
        new Category,
        new SimpleLink("排行", "https://www.bilibili.com/ranking", "ranking"),
        new SimpleLink("画友", "https://h.bilibili.com", "drawing"),
        new SimpleLink("音频", "https://www.bilibili.com/audio/home/?type=10", "music"),
        new Iframe("游戏中心", "https://game.bilibili.com/", {
            src: `https://www.bilibili.com/page-proxy/game-nav.html`,
            width: `680px`,
            height: `260px`,
            lazy: true,
            iframeName: "games",
        }),
        new Iframe("直播", "https://live.bilibili.com", {
            src: `https://live.bilibili.com/blackboard/dropdown-menu.html`,
            width: `528px`,
            height: `266px`,
            lazy: true,
            iframeName: "lives",
        }),
        new SimpleLink("会员购", "https://show.bilibili.com/platform/home.html?msource=pc_web", "shop"),
        new SimpleLink("漫画", "https://manga.bilibili.com", "manga"),
        new Blank,
        new SearchBox,
        new UserInfo,
    ];
    if (userInfo.isLogin)
    {
        components.push(
            new Messages,
            new Activities,
            new WatchlaterList,
            new FavoritesList,
            new HistoryList,
        );
    }
    components.push(new Upload);
    new Vue({
        el: ".custom-navbar",
        data: {
            components,
        },
        methods: {
            requestPopup(component)
            {
                if (!component.requestedPopup)
                {
                    this.$set(component, `requestedPopup`, true);
                    component.onPopup && component.onPopup();
                }
            }
        },
    });
})();
return attributes;