if (isIframe()) {
  return;
}
document.body.style.setProperty("--navbar-bounds-padding", `0 ${settings.customNavbarBoundsPadding}%`);
document.body.style.setProperty("--navbar-blur-opacity", settings.customNavbarBlurOpacity || 0.7);
addSettingsListener("customNavbarBlurOpacity", value => {
  document.body.style.setProperty("--navbar-blur-opacity", value);
});
let showWidget = true;
const attributes = {
  widget: {
    content: /*html*/`
      <div class="gui-settings-flat-button" id="custom-navbar-settings">
        <i class="mdi mdi-24px mdi-auto-fix"></i>
        <span>顶栏布局</span>
      </div>`,
    condition: () => showWidget,
    success: async () => {
      await SpinQuery.select(".custom-navbar-settings");
      await import("slip");
      const { debounce } = await import("debounce");
      // const customNavbar = document.querySelector(".custom-navbar");
      const button = document.querySelector("#custom-navbar-settings");
      button.addEventListener("click", async () => {
        const settingsPanel = dq(".custom-navbar-settings");
        if (settingsPanel) {
          settingsPanel.classList.toggle("show");
          document.querySelector(".gui-settings-mask").click();
        }
      });
      button.addEventListener("mouseover", () => {
        const displayNames = {
          blank1: "弹性空白1",
          logo: "Logo",
          category: "主站",
          rankingLink: "排行",
          drawingLink: "相簿",
          musicLink: "音频",
          gamesIframe: "游戏中心",
          livesIframe: "直播",
          shopLink: "会员购",
          mangaLink: "漫画",
          blank2: "弹性空白2",
          search: "搜索框",
          userInfo: "用户信息",
          messages: "消息",
          activities: "动态",
          bangumiLink: '订阅',
          watchlaterList: "稍后再看",
          favoritesList: "收藏",
          historyList: "历史",
          upload: "投稿入口",
          blank3: "弹性空白3",
        };
        Vue.component("order-item", {
          props: ["item"],
          template: /*html*/`
            <li v-on:mouseenter="viewBorder(true)"
                v-on:mouseleave="viewBorder(false)"
                v-bind:class="{hidden: hidden()}">
              <i class="mdi mdi-menu"></i>
              {{item.displayName}}
              <button v-on:click="toggleHidden()">
                  <i v-if="hidden()" class="mdi mdi-eye-off"></i>
                  <i v-else class="mdi mdi-eye"></i>
              </button>
            </li>
          `,
          methods: {
            hidden () {
              return settings.customNavbarHidden.includes(this.item.name);
            },
            viewBorder (view) {
              const navbarItem = document.querySelector(`.custom-navbar li[data-name='${this.item.name}']`);
              if (navbarItem !== null) {
                navbarItem.classList[view ? "add" : "remove"]("view-border");
              }
            },
            toggleHidden () {
              const isHidden = this.hidden();
              if (isHidden === false) {
                settings.customNavbarHidden.push(this.item.name);
                settings.customNavbarHidden = settings.customNavbarHidden;
              }
              else {
                const index = settings.customNavbarHidden.indexOf(this.item.name);
                if (index === -1) {
                  return;
                }
                settings.customNavbarHidden.splice(index, 1);
                settings.customNavbarHidden = settings.customNavbarHidden;
              }
              this.$forceUpdate();
              const navbarItem = document.querySelector(`.custom-navbar li[data-name='${this.item.name}']`);
              if (navbarItem !== null) {
                navbarItem.style.display = isHidden ? "flex" : "none";
              }
            }
          }
        });

        const updateBoundsPadding = debounce(value => {
          settings.customNavbarBoundsPadding = value;
          document.body.style.setProperty("--navbar-bounds-padding", `0 ${value}%`);
        }, 200);
        new Vue({
          el: ".custom-navbar-settings",
          mounted () {
            const list = document.querySelector(".custom-navbar-settings .order-list");
            const reorder = ({ sourceItem, targetItem, orderBefore, orderAfter }) => {
              if (orderBefore === orderAfter) {
                return;
              }
              const entires = Object.entries(settings.customNavbarOrder);
              const names = entires.sort((a, b) => a[1] - b[1]).map(it => it[0]);
              if (orderBefore < orderAfter) {
                for (let i = orderBefore + 1; i <= orderAfter; i++) {
                  const name = names[i];
                  settings.customNavbarOrder[name] = i - 1;
                  document.querySelector(`.custom-navbar li[data-name='${name}']`).style.order = i - 1;
                }
              }
              else {
                for (let i = orderBefore - 1; i >= orderAfter; i--) {
                  const name = names[i];
                  settings.customNavbarOrder[name] = i + 1;
                  document.querySelector(`.custom-navbar li[data-name='${name}']`).style.order = i + 1;
                }
              }
              settings.customNavbarOrder[names[orderBefore]] = orderAfter;
              document.querySelector(`.custom-navbar li[data-name='${names[orderBefore]}']`).style.order = orderAfter;
              settings.customNavbarOrder = settings.customNavbarOrder;
              list.insertBefore(sourceItem, targetItem);
            };
            new Slip(list);
            list.addEventListener("slip:beforewait", e => {
              if (e.target.classList.contains("mdi-menu")) {
                e.preventDefault();
              }
            }, false);
            list.addEventListener("slip:beforeswipe", e => e.preventDefault(), false);
            list.addEventListener("slip:reorder", e => {
              reorder({
                sourceItem: e.target,
                targetItem: e.detail.insertBefore,
                orderBefore: e.detail.originalIndex,
                orderAfter: e.detail.spliceIndex,
              });
              return false;
            }, false);
          },
          computed: {
            orderList () {
              const orders = Object.entries(settings.customNavbarOrder);
              return orders.sort((a, b) => a[1] - b[1]).map(it => {
                return {
                  displayName: displayNames[it[0]],
                  name: it[0],
                  order: it[1],
                };
              });
            },
          },
          data: {
            boundsPadding: settings.customNavbarBoundsPadding,
          },
          watch: {
            boundsPadding (value) {
              updateBoundsPadding(value);
            },
          },
          methods: {
            close () {
              document.querySelector(".custom-navbar-settings").classList.remove("show");
            },
            restoreDefault () {
              if (typeof customNavbarDefaultOrders === "undefined") {
                Toast.error("未找到默认值设定, 请更新您的脚本.");
                return;
              }
              if (confirm("确定要恢复默认顶栏布局吗? 恢复后页面将刷新.")) {
                this.boundsPadding = 5;
                settings.customNavbarOrder = customNavbarDefaultOrders;
                location.reload();
              }
            },
          },
        });
      }, { once: true });
    },
  },
  unload: () => {
    const navbar = document.querySelectorAll(".custom-navbar,.custom-navbar-settings");
    navbar.forEach(it => it.style.display = "none");
    resources.removeStyle("customNavbarStyle");
  },
  reload: () => {
    const navbar = document.querySelectorAll(".custom-navbar,.custom-navbar-settings");
    navbar.forEach(it => it.style.display = "flex");
    resources.applyImportantStyle("customNavbarStyle");
  },
};
const classHandler = (key, value, element) => {
  element.classList[value ? "add" : "remove"](key);
}
const darkHandler = value => {
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
  "/app.bilibili.com",
  "/passport.bilibili.com",
];
const unsupportedUrls = [
  "/t.bilibili.com/lottery/h5/index/#/result",
  "/member.bilibili.com/video/upload",
]
if (!supportedUrls.some(it => document.URL.includes(it))
  || unsupportedUrls.some(it => document.URL.includes(it))) {
  showWidget = false;
  return attributes;
}

let userInfo = {};
let orders = {

};
class NavbarComponent {
  constructor () {
    this.html = ``;
    this.popupHtml = ``;
    this.flex = `0 0 auto`;
    this.disabled = false;
    this.requestedPopup = false;
    this.onPopup = null;
    this.href = null;
    this.notifyCount = 0;
    this.touch = settings.touchNavBar;
    this.active = false;
  }
  get name () {
    return "undefined";
  }
  get order () {
    return settings.customNavbarOrder[this.name];
  }
  get hidden () {
    return settings.customNavbarHidden.includes(this.name);
  }
  async setNotifyCount(count) {
    const notifyElement = await SpinQuery.select(`.custom-navbar li[data-name='${this.name}'] .notify-count`)
    if (!notifyElement) {
      return
    }
    notifyElement.innerHTML = count
  }
}
class Blank extends NavbarComponent {
  constructor (number) {
    super();
    this.number = number;
    this.flex = "1 0 auto";
    this.disabled = true;
  }
  get name () {
    return "blank" + this.number;
  }
}
class Logo extends NavbarComponent {
  constructor () {
    super();
    this.href = `https://www.bilibili.com/`;
    this.html = /*html*/`<i class="custom-navbar-iconfont custom-navbar-icon-logo"></i>`;
    this.touch = false;
  }
  get name () {
    return "logo";
  }
}
class SimpleLink extends NavbarComponent {
  constructor (name, link, linkName) {
    super();
    this.linkName = linkName;
    this.html = name;
    this.href = link;
    this.touch = false;
    this.active = document.URL.startsWith(link);
  }
  get name () {
    return this.linkName + "Link";
  }
}
class Upload extends NavbarComponent {
  constructor () {
    super();
    this.href = "https://member.bilibili.com/v2#/upload/video/frame";
    this.html = /*html*/`
      <svg style="width:16px;height:16px;padding:3px;" viewBox="0 0 785 886">
        <path d="M582,374L582,566C582,585.333 576.167,600.833 564.5,612.5C552.833,624.167 537.333,630 518,630L262,630C242.667,630 227.167,624.167 215.5,612.5C203.833,600.833 198,585.333 198,566L198,374L32,374C22,374 14.1667,371.167 8.5,365.5C2.83333,359.833 0,352 0,342C0,338.667 1.16666,334.5 3.5,329.5C5.83333,324.5 8.66666,320 12,316L371,9C377.667,3.00006 385.167,6.10352e-005 393.5,0C401.833,6.10352e-005 409.333,3.00006 416,9L774,316C780,322.667 783.333,330.167 784,338.5C784.667,346.833 783.333,354.333 780,361L764,370C760,372.667 754.667,374 748,374ZM70,758L710,758C729.333,758 744.833,763.833 756.5,775.5C768.167,787.167 774,802.667 774,822C774,841.333 768.167,856.833 756.5,868.5C744.833,880.167 729.333,886 710,886L70,886C50.6667,886 35.1667,880.167 23.5,868.5C11.8333,856.833 6,841.333 6,822C6,802.667 11.8333,787.167 23.5,775.5C35.1667,763.833 50.6667,758 70,758Z" />
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
  get name () {
    return "upload";
  }
}
class Messages extends NavbarComponent {
  // TODO: try alt api: https://api.bilibili.com/x/msgfeed/unread
  constructor () {
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
    this.active = document.URL.startsWith("https://message.bilibili.com/");
    this.init();
  }
  get name () {
    return "messages";
  }
  async init () {
    const json = await Ajax.getJsonWithCredentials("https://message.bilibili.com/api/notify/query.notify.count.do");
    const list = await SpinQuery.select("#message-list");
    const items = [...list.querySelectorAll("a[data-name]")];
    const names = items.map(it => it.getAttribute("data-name"));

    if (json.code !== 0) {
      return;
    }
    let totalCount = names.reduce((acc, it) => acc + json.data[it], 0);
    if (!totalCount) {
      return;
    }
    await this.setNotifyCount(totalCount);
    names.forEach((name, index) => {
      const count = json.data[name];
      if (count > 0) {
        items[index].setAttribute("data-count", count);
      }
      else {
        items[index].removeAttribute("data-count");
      }
    });
    items.forEach(item => {
      item.addEventListener("click", () => {
        const count = item.getAttribute("data-count");
        item.removeAttribute("data-count");
        totalCount -= count;
        notifyElement.innerHTML = totalCount || "";
      });
    })
  }
}
class Category extends NavbarComponent {
  constructor () {
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
    this.getOnlineInfo().then(info => {
      new Vue({
        el: "#custom-navbar-home-popup",
        data: {
          info: Object.entries(info),
        },
      });
    });
  }
  get name () {
    return "category";
  }
  async getOnlineInfo () {
    const json = await Ajax.getJson("https://api.bilibili.com/x/web-interface/online");
    if (parseInt(json.code) !== 0) {
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
class UserInfo extends NavbarComponent {
  constructor () {
    super();
    this.noPadding = true;
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
          <a class="type" target="_blank" href="https://account.bilibili.com/account/big">{{userType}}</a>
          <div class="level-info row">
            <a target="_blank" title="等级" href="https://account.bilibili.com/site/record?type=exp"
              class="level">
              <i class="custom-navbar-iconfont-extended" v-bind:class="'custom-navbar-icon-lv' + level_info.current_level"></i>
            </a>
            <span class="level-progress-label">{{level_info.current_exp}} / {{level_info.next_exp}}</span>
          </div>
          <div class="level-progress separator">
            <div class="level-progress-thumb" v-bind:style="levelProgressStyle"></div>
          </div>
          <div class="items">
            <a class="item" target="_blank" title="手机验证"
              href="https://passport.bilibili.com/account/security#/bindphone">
              <div class="circle">
                <i class="mdi mdi-circle"></i>
                <i class="mdi mdi-cellphone-android"></i>
              </div>
              <i v-if="mobile_verified" class="mdi mdi-check"></i>
              <i v-else class="mdi mdi-close"></i>
            </a>
            <a class="item" target="_blank" title="邮箱验证"
              href="https://passport.bilibili.com/account/security#/bindmail">
              <div class="circle">
                <i class="mdi mdi-circle"></i>
                <i class="mdi mdi-email"></i>
              </div>
              <i v-if="email_verified" class="mdi mdi-check"></i>
              <i v-else class="mdi mdi-close"></i>
            </a>
            <a class="item" target="_blank" href="https://account.bilibili.com/site/coin" title="硬币">
              <i class="custom-navbar-iconfont-extended custom-navbar-icon-coin"></i>
              <span>{{money}}</span>
            </a>
            <a class="item" target="_blank" href="https://pay.bilibili.com/bb_balance.html" title="B币">
              <i class="mdi mdi-alpha-b-circle"></i>
              <span>{{wallet.bcoin_balance}}</span>
            </a>
          </div>
          <div class="separator"></div>
          <a class="operation" target="_blank" href="https://account.bilibili.com/account/home">
            <span class="icon">
              <div class="circle">
                <i class="mdi mdi-circle"></i>
                <i class="mdi mdi-account"></i>
              </div>
            </span>
            个人中心
          </a>
          <a class="operation" target="_blank" href="https://member.bilibili.com/v2#/upload-manager/article">
            <span class="icon">
              <div class="circle">
                <i class="mdi mdi-circle"></i>
                <i class="mdi mdi-square-edit-outline"></i>
              </div>
            </span>
            投稿管理
          </a>
          <a class="operation" target="_blank" href="https://pay.bilibili.com/">
            <span class="icon">
              <div class="circle">
                <i class="mdi mdi-circle"></i>
                <i class="mdi mdi-wallet"></i>
              </div>
            </span>
            B币钱包
          </a>
          <a class="operation" target="_blank" href="https://link.bilibili.com/p/center/index">
            <span class="icon">
              <div class="circle">
                <i class="mdi mdi-circle"></i>
                <i class="mdi mdi-video-input-antenna"></i>
              </div>
            </span>
            直播中心
          </a>
          <a class="operation" target="_blank" href="https://show.bilibili.com/orderlist">
            <span class="icon">
              <div class="circle">
                <i class="mdi mdi-circle"></i>
                <i class="mdi mdi-ticket"></i>
              </div>
            </span>
            订单中心
          </a>
          <a class="logout grey-button" href="https://account.bilibili.com/login?act=exit">退出登录</a>
        </div>
        <div v-else class="not-logged-in">
          <h1 class="welcome">欢迎来到 bilibili</h1>
          <a href="https://passport.bilibili.com/register/phone.html" class="signup grey-button">注册</a>
          <a href="https://passport.bilibili.com/login" class="login theme-button">登录</a>
        </div>
      </div>
    `;
    this.requestedPopup = true;
    this.init();
  }
  get name () {
    return "userInfo";
  }
  async init () {
    const panel = await SpinQuery.select(".custom-navbar .user-info-panel");
    new Vue({
      el: panel,
      data: {
        ...userInfo,
      },
      computed: {
        userType () {
          if (!this.isLogin) {
            return "未登录";
          }
          if (this.level_info.current_level === 0) {
            return "注册会员";
          }
          if (this.vipStatus === 1) {
            if (this.vipType === 1) {
              return this.vip_theme_type ? "小会员" : "大会员";
            }
            else if (this.vipType === 2) {
              return this.vip_theme_type ? "年度小会员" : "年度大会员";
            }
          }
          return "正式会员";
        },
        levelProgressStyle () {
          const progress = (this.level_info.current_exp - this.level_info.current_min) / (this.level_info.next_exp - this.level_info.current_min);
          return {
            transform: `scaleX(${progress})`
          };
        }
      },
    });
    const face = await SpinQuery.select(".custom-navbar .user-face-container .user-face");
    if (userInfo.isLogin) {
      const faceUrl = userInfo.face.replace("http", "https");
      // face.setAttribute("src", faceUrl);
      const faceBaseSize = 68;
      const dpis = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4];
      face.setAttribute("srcset", dpis.map(dpi => {
        return `${faceUrl}@${parseInt(faceBaseSize * dpi)}w_${parseInt(faceBaseSize * dpi)}h.jpg ${dpi}x`;
      }).join(","));
      // face.style.backgroundImage = `url('${userInfo.face}@68w_68h.jpg')`;
      if (userInfo.pendant.image) {
        const pendant = await SpinQuery.select(".custom-navbar .user-face-container .user-pendant");
        const pendantUrl = userInfo.pendant.image.replace("http", "https");
        // pendant.setAttribute("src", pendantUrl);
        const pendantBaseSize = 116;
        pendant.setAttribute("srcset", dpis.reduce((acc, dpi) => {
          return acc + `, ${pendantUrl}@${parseInt(pendantBaseSize * dpi)}w_${parseInt(pendantBaseSize * dpi)}h.png ${dpi}x`;
        }, ""));
        // pendant.style.backgroundImage = `url('${userInfo.pendant.image}@116w_116h.jpg')`;
      }
    }
    else {
      face.setAttribute("src", "https://static.hdslb.com/images/akari.jpg");
      // face.style.backgroundImage = `url('https://static.hdslb.com/images/akari.jpg')`;
    }
  }
}
class SearchBox extends NavbarComponent {
  constructor () {
    super();
    this.disabled = true;
    this.html = /*html*/`
      <form id="custom-navbar-search" autocomplete="off" target="_blank" method="get" action="https://search.bilibili.com/all">
        <input type="text" placeholder="搜索" name="keyword">
        <input type="hidden" name="from_source" value="banner_search">
        <a style="display: none" target="_blank" class="recommended-target"></a>
        <button type="submit" title="搜索" tabindex="-1">
          <svg style="width:22px;height:22px" viewBox="0 0 24 24">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
        </button>
      </form>
      <div class="popup search-list" :class="{empty: items.length === 0}">
        <div class="search-list-item" tabindex="0" v-for="(item, index) of items" v-html="item.html" @keydown.enter="submit(item.value)" @click="submit(item.value)" @keydown.down.prevent="nextItem(index)" @keydown.up.prevent="previousItem(index)"></div>
        <div tabindex="0" v-if="items.length > 0 && isHistory" class="search-list-item clear-history" @click="clearSearchHistory()" @keydown.enter="clearSearchHistory()" @keydown.down.prevent="nextItem(items.length)" @keydown.up.prevent="previousItem(items.length)">清除搜索历史</div>
      </div>
    `;
    this.init();
  }
  async init () {
    const form = await SpinQuery.select("#custom-navbar-search");
    const keywordInput = form.querySelector("input[name='keyword']");
    form.addEventListener("submit", e => {
      if (keywordInput.value === "") {
        if (!settings.hideTopSearch) {
          form.querySelector(".recommended-target").click();
        }
        e.preventDefault();
        return false;
      }
      const historyItem = settings.searchHistory.find(item => item.keyword === keywordInput.value)
      if (historyItem) {
        historyItem.count++
      } else {
        settings.searchHistory.push({
          count: 1,
          keyword: keywordInput.value
        })
      }
      settings.searchHistory = settings.searchHistory // save history
      return true;
    });
    if (!settings.hideTopSearch) {
      const json = await Ajax.getJson("https://api.bilibili.com/x/web-interface/search/default");
      if (json.code === 0) {
        keywordInput.setAttribute("placeholder", json.data.show_name);
        let href;
        if (json.data.url !== "") {
          href = json.data.url;
        }
        else if (json.data.name.startsWith("av")) {
          href = `https://www.bilibili.com/${json.data.name}`;
        }
        else {
          href = `https://search.bilibili.com/all?keyword=${json.data.name}`;
        }
        form.querySelector(".recommended-target").setAttribute("href", href);
      }
      else {
        console.error("[自定义顶栏] 获取搜索推荐词失败");
      }
    }
    const searchList = new Vue({
      el: dq('.popup.search-list'),
      data: {
        items: [],
        isHistory: true,
      },
      methods: {
        submit (value) {
          keywordInput.value = value
          form.submit()
          // submit method will not trigger submit event
          // see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit
          raiseEvent(form, 'submit')
        },
        nextItem (index) {
          const item = dq(`.custom-navbar .search-list-item:nth-child(${index + 2})`)
          if (item) {
            item.focus()
          }
        },
        previousItem (index) {
          const item = dq(`.custom-navbar .search-list-item:nth-child(${index})`)
          if (item) {
            item.focus()
          } else {
            keywordInput.focus()
            return
          }
        },
        clearSearchHistory() {
          settings.searchHistory = []
          this.items = []
        }
      },
    })
    const { debounce } = await import('debounce');
    let lastQueuedRequest = ''
    const updateSuggest = async () => {
      const text = keywordInput.value
      searchList.isHistory = text === ''
      if (searchList.isHistory) {
        searchList.items = settings.searchHistory.sort((a, b) => b.count - a.count).map(item => {
          return {
            value: item.keyword,
            html: item.keyword,
          }
        })
      } else {
        const url = `https://s.search.bilibili.com/main/suggest?func=suggest&suggest_type=accurate&sub_type=tag&main_ver=v1&highlight=&userid=${userInfo.mid}&bangumi_acc_num=1&special_acc_num=1&topic_acc_num=1&upuser_acc_num=3&tag_num=10&special_num=10&bangumi_num=10&upuser_num=3&term=${text}`
        lastQueuedRequest = url
        const json = await Ajax.getJson(url)
        if (json.code !== 0 || lastQueuedRequest !== url) {
          return
        }
        const results = json.result.tag
        if (results === undefined) {
          searchList.items = []
          return
        }
        searchList.items = results.map(item => {
          return {
            value: item.value,
            html: item.name.replace(/suggest_high_light/g, 'suggest-highlight')
          }
        })
      }
    }
    updateSuggest()
    const debouncedSuggest = debounce(updateSuggest, 200)
    let composing = false
    keywordInput.addEventListener('compositionstart', () => composing = true)
    keywordInput.addEventListener('compositionend', () => {
      composing = false
      raiseEvent(keywordInput, 'input')
    })
    keywordInput.addEventListener('input', () => {
      if (!composing) {
        debouncedSuggest()
      }
    })
    keywordInput.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' && searchList.items.length > 0) {
        e.preventDefault()
        dq('.custom-navbar .search-list-item:first-child').focus()
      }
    })
  }
  get name () {
    return "search";
  }
}
class Iframe extends NavbarComponent {
  constructor (name, link, { src, width, height, lazy, iframeName }) {
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
  get name () {
    return this.iframeName + "Iframe";
  }
}
class NotifyIframe extends Iframe {
  constructor (...args) {
    super(...args);
    this.touch = settings.touchNavBar;
    this.getNotifyCount();
  }
  getApiUrl () {
    return null;
  }
  getCount () {
    return 0;
  }
  async getNotifyCount () {
    const notifyElement = await SpinQuery.select(`.custom-navbar li[data-name='${this.name}'] .notify-count`);
    const json = await Ajax.getJsonWithCredentials(this.getApiUrl());
    const count = this.getCount(json);
    if (json.code === 0 && count) {
      notifyElement.innerHTML = count;
      this.onPopup = () => {
        notifyElement.innerHTML = '';
      };
    }
  }
}
class Activities extends NavbarComponent {
  constructor () {
    super();
    this.noPadding = true;
    this.href = settings.oldTweets ? "https://www.bilibili.com/account/dynamic" : "https://t.bilibili.com/";
    this.html = "动态";
    this.popupHtml = /*html*/`
      <div class="activity-popup">
        <activity-tabs :tab.sync="selectedTab" :items="tabs"></activity-tabs>
        <div class="activity-popup-content">
          <video-activity v-if="selectedTab === '视频'"></video-activity>
          <bangumi-activity v-if="selectedTab === '番剧'"></bangumi-activity>
          <column-activity v-if="selectedTab === '专栏'"></column-activity>
          <photos-activity v-if="selectedTab === '图片'"></photos-activity>
          <live-activity v-if="selectedTab === '直播'"></live-activity>
          <a class="view-more" target="_blank" :href="viewMoreUrl">查看更多<i class="mdi mdi-18px mdi-more"></i></a>
        </div>
      </div>
    `;
    this.active = document.URL.replace(/\?.*$/, "") === "https://t.bilibili.com/";
    this.onPopup = this.init
  }
  static get latestID () {

  }
  static set latestID (id) {

  }
  async init () {
    Vue.component('dpi-img', {
      template: /*html*/`<img :width="width" :height="height" :srcset="srcset">`,
      props: ['size', 'src'],
      computed: {
        srcset () {
          return getDpiSourceSet(this.src, this.size)
        },
        width () {
          if (typeof this.size === 'object' && 'width' in this.size) {
            return this.size.width
          }
          return null
        },
        height () {
          if (typeof this.size === 'object' && 'height' in this.size) {
            return this.size.height
          }
          return null
        }
      },
    })
    this.popupVM = new Vue({
      el: await SpinQuery.select('.activity-popup'),
      data: {
        tabs: [
          '视频',
          '番剧',
          '专栏',
          '图片',
          '直播',
        ],
        selectedTab: '视频',
      },
      components: {
        'activity-tabs': {
          props: ['items', 'tab'],
          template: /*html*/`
            <ul class="activity-tabs">
              <li v-for="item of items" class="activity-tab" :class="{selected: item === tab}" @click="changeTab(item)">{{item}}</li>
              <a class="view-all" target="_blank" href="https://t.bilibili.com/">全部动态</a>
            </ul>
          `,
          methods: {
            changeTab(item) {
              this.$emit('update:tab', item)
            }
          },
        },
        'video-activity': {
          components: {
            'video-card': {
              props: ['card', 'watchlaterInit'],
              data() {
                return {
                  watchlater: this.watchlaterInit,
                }
              },
              methods: {
                async toggleWatchlater() {
                  try {
                    const { toggleWatchlater } = await import('../../video/watchlater-api')
                    if (this.watchlater === false) {
                      await toggleWatchlater(this.card.aid, true)
                    } else {
                      await toggleWatchlater(this.card.aid, false)
                    }
                    this.watchlater = !this.watchlater
                  } catch (error) {
                    logError(`稍后再看操作失败: ${error}`)
                  }
                },
              },
              template: /*html*/`
                <a class="video-activity-card" target="_blank" :href="card.videoUrl">
                  <div class="cover-container">
                    <dpi-img class="cover" :size="{width: 172}" :src="card.coverUrl"></dpi-img>
                    <div class="time">{{card.time}}</div>
                    <div @click.stop.prevent="toggleWatchlater()" class="watchlater"><i class="mdi" :class="{'mdi-clock-outline': !watchlater, 'mdi-check-circle': watchlater}"></i>{{watchlater ? '已添加' : '稍后再看'}}</div>
                  </div>
                  <h1 class="title" :title="card.description">{{card.title}}</h1>
                  <a class="up" target="_blank" :href="card.upUrl" :title="card.upName">
                    <dpi-img class="face" :size="24" :src="card.faceUrl"></dpi-img>
                    <span class="name">{{card.upName}}</span>
                  </a>
                </a>
              `,
            },
          },
          template: /*html*/`
            <div class="video-activity" :class="{loading}">
              <div v-if="loading" class="loading">
                <i class="mdi mdi-18px mdi-loading mdi-spin"></i>加载中...
              </div>
              <div v-if="!loading" class="video-activity-column">
                <video-card v-for="card of leftCards" :key="card.id" :card="card" :watchlaterInit="card.watchlater"></video-card>
              </div>
              <div v-if="!loading" class="video-activity-column">
                <video-card v-for="card of rightCards" :key="card.id" :card="card" :watchlaterInit="card.watchlater"></video-card>
              </div>
            </div>
          `,
          data() {
            return {
              leftCards: [],
              rightCards: [],
              loading: true,
            }
          },
          async mounted() {
            try {
              const json = await Ajax.getJsonWithCredentials(`https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${userInfo.mid}&type_list=8`)
              if (json.code !== 0) {
                throw new Error(json.message)
              }
              const { getWatchlaterList } = await import('../../video/watchlater-api')
              const watchlaterList = await getWatchlaterList()
              const cards = json.data.cards.map(card => {
                const cardJson = JSON.parse(card.card)
                let topics
                if (card.display && card.display.topic_info) {
                  topics = card.display.topic_info.topic_details.map(it => {
                    return it.topic_name
                  })
                }
                return {
                  coverUrl: cardJson.pic,
                  title: cardJson.title,
                  timeNumber: cardJson.duration,
                  time: formatDuration(cardJson.duration),
                  description: cardJson.desc,
                  aid: cardJson.aid,
                  videoUrl: `https://www.bilibili.com/av${cardJson.aid}`,
                  faceUrl: card.desc.user_profile.info.face,
                  upName: card.desc.user_profile.info.uname,
                  upUrl: `https://space.bilibili.com/${card.desc.user_profile.info.uid}`,
                  id: card.desc.dynamic_id_str,
                  topics,
                  watchlater: watchlaterList.includes(cardJson.aid),
                }
              })
              this.leftCards = cards.filter((_, index) => index % 2 === 0)
              this.rightCards = cards.filter((_, index) => index % 2 === 1)
              if (this.leftCards.length !== this.rightCards.length) {
                this.leftCards.pop()
              }
            } catch (error) {
              logError(`加载视频动态失败, error = ${error}`)
            } finally {
              this.loading = false
            }
          },
        },
        'bangumi-activity': {
          template: /*html*/`
            <div class="bangumi-activity" :class="{loading}">
              <div v-if="loading" class="loading">
                <i class="mdi mdi-18px mdi-loading mdi-spin"></i>加载中...
              </div>
              <a v-else class="bangumi-card" v-for="card of cards" :key="card.id" target="_blank" :href="card.url">
                <dpi-img class="ep-cover" :size="{width: 100}" :src="card.epCoverUrl"></dpi-img>
                <h1 class="ep-title">{{card.epTitle}}</h1>
                <div class="title">{{card.title}}</div>
              </a>
            </div>
          `,
          data() {
            return {
              cards: [],
              loading: true,
            }
          },
          async mounted() {
            try {
              const json = await Ajax.getJsonWithCredentials(`https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${userInfo.mid}&type_list=512`)
              if (json.code !== 0) {
                throw new Error(json.message)
              }
              this.cards = json.data.cards.map(card => {
                const cardJson = JSON.parse(card.card)
                return {
                  title: cardJson.apiSeasonInfo.title,
                  coverUrl: cardJson.apiSeasonInfo.cover,
                  epCoverUrl: cardJson.cover,
                  epTitle: cardJson.new_desc,
                  url: cardJson.url,
                  id: card.desc.dynamic_id_str,
                }
              })
            } catch (error) {
              logError(`加载番剧动态失败, error = ${error}`)
            } finally {
              this.loading = false
            }
          },
        },
        // 'column-activity': {},
        // 'photos-activity': {},
        // 'live-activity': {},
      },
      computed: {
        viewMoreUrl() {
          switch (this.selectedTab) {
            case '视频':
              return 'https://t.bilibili.com/?tab=8'
            case '番剧':
              return 'https://t.bilibili.com/?tab=512'
            default: return null
          }
        },
      },
    })
  }
  get name () {
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
class VideoList extends NavbarComponent {
  constructor ({ mainUrl, name, apiUrl, listName, listMap }) {
    super();
    this.href = mainUrl;
    this.listName = listName;
    this.html = name;
    this.noPadding = true;
    this.requestedPopup = false;
    this.popupHtml = /*html*/`
      <ol class="video-list ${listName}">
          <li class="loading">加载中...</li>
      </ol>
    `;
    this.onPopup = async () => {
      if (!listMap) {
        return;
      }
      const videoListElement = await SpinQuery.select(`.video-list.${listName}`);
      if (videoListElement === null) {
        return;
      }
      const json = await Ajax.getJsonWithCredentials(apiUrl);
      if (json.code !== 0) {
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
  get name () {
    return this.listName + "List";
  }
}
class WatchlaterList extends VideoList {
  constructor () {
    super({
      name: "稍后再看",
      mainUrl: "https://www.bilibili.com/watchlater/#/list",
      apiUrl: "https://api.bilibili.com/x/v2/history/toview/web",
      listName: "watchlater",
      listMap: json => {
        return json.data.list.slice(0, 6).map(item => {
          const href = (() => {
            if (item.pages === undefined) {
              return settings.watchLaterRedirect ?
                `https://www.bilibili.com/video/av${item.aid}` :
                `https://www.bilibili.com/watchlater/#/av${item.aid}`;
            }
            const pages = item.pages.map(it => it.cid);
            const page = item.cid === 0 ? 1 : pages.indexOf(item.cid) + 1;
            return settings.watchLaterRedirect ?
              `https://www.bilibili.com/video/av${item.aid}?p=${page}` :
              `https://www.bilibili.com/watchlater/#/av${item.aid}/p${page}`;
          })();
          return /*html*/`<li><a target="_blank" href="${href}">${item.title}</a></li>`;
        });
      },
    });
    this.active = document.URL.startsWith("https://www.bilibili.com/watchlater/");
  }
}
class FavoritesList extends VideoList {
  constructor () {
    super({
      name: "收藏",
      mainUrl: `https://space.bilibili.com/${userInfo.mid}/favlist`,
      apiUrl: "https://api.bilibili.com/medialist/gateway/coll/resource/recent",
      listName: "favorites",
      listMap: json => {
        return json.data.map(item => {
          return /*html*/`
            <li>
              <a target="_blank" href="https://www.bilibili.com/video/av${item.id}">${item.title}</a>
            </li>`;
        });
      },
    });
    this.active = document.URL.replace(/\?.*$/, "") === `https://space.bilibili.com/${userInfo.mid}/favlist`;
  }
}
class HistoryList extends VideoList {
  constructor () {
    super({
      name: "历史",
      mainUrl: "https://www.bilibili.com/account/history",
      apiUrl: "https://api.bilibili.com/x/v2/history?pn=1&ps=6",
      listName: "history",
      listMap: json => {
        return json.data.map(item => {
          let parameter = [];
          let description = "";
          const page = item.page ? item.page.page : 1;
          const progress = item.progress >= 0 ? item.progress / item.duration : 1;
          if (page !== 1) {
            parameter.push(`p=${page}`);
            description += `看到第${page}话`;
          }
          if (item.progress > 0 && item.progress < item.duration) {
            parameter.push(`t=${item.progress}`);
            description += ` ${Math.floor(progress * 100)}%`;
          }
          else if (item.progress === 0) {
            description += ` 刚开始看`;
          }
          else {
            description += " 100%";
          }
          return /*html*/`
            <li class="history-item">
              <a target="_blank" href="https://www.bilibili.com/video/av${item.aid}?${parameter.join("&")}">
                <span class="title">${item.title}</span>
                <span class="description">${description}</span>
                <div class="progress background"></div>
                <div class="progress" style="transform: scaleX(${progress})"></div>
              </a>
            </li>`;
        });
      },
    });
    this.active = document.URL.replace(/\?.*$/, "") === "https://www.bilibili.com/account/history";
  }
}

(async () => {
  const html = await import("customNavbarHtml");
  const json = await Ajax.getJsonWithCredentials("https://api.bilibili.com/x/web-interface/nav");
  userInfo = json.data;
  document.body.insertAdjacentHTML("beforeend", html);
  addSettingsListener("useDarkStyle", darkHandler);
  darkHandler(settings.useDarkStyle);
  ["Fill", "Shadow", "Compact", "Blur"].forEach(item => {
    addSettingsListener("customNavbar" + item, value => classHandler(item.toLowerCase(), value, document.querySelector(".custom-navbar")));
    classHandler(item.toLowerCase(), settings["customNavbar" + item], document.querySelector(".custom-navbar"));
  });
  SpinQuery.condition(() => document.getElementById("banner_link"),
    banner => banner === null ? null : banner.style.backgroundImage,
    banner => {
      Observer.attributes(banner, () => {
        const blurLayers = document.querySelectorAll(".custom-navbar .blur-layer");
        blurLayers.forEach(blurLayer => {
          blurLayer.style.backgroundImage = banner.style.backgroundImage;
          blurLayer.setAttribute("data-image", banner.style.backgroundImage);
        });
      });
    });

  const components = [
    new Blank(1),
    new Logo,
    new Category,
    new SimpleLink("排行", "https://www.bilibili.com/ranking", "ranking"),
    new SimpleLink("相簿", "https://h.bilibili.com", "drawing"),
    new SimpleLink("音频", "https://www.bilibili.com/audio/home/", "music"),
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
    new SimpleLink("会员购", "https://show.bilibili.com", "shop"),
    new SimpleLink("漫画", "https://manga.bilibili.com", "manga"),
    new Blank(2),
    new SearchBox,
    new UserInfo,
  ];
  if (userInfo.isLogin) {
    components.push(
      new Messages,
      new SimpleLink('订阅', `https://space.bilibili.com/${userInfo.mid}/bangumi`, 'bangumi'),
      new Activities,
      new WatchlaterList,
      new FavoritesList,
      new HistoryList,
    );
  }
  components.push(new Upload, new Blank(3));
  new Vue({
    el: ".custom-navbar",
    data: {
      components,
    },
    methods: {
      requestPopup (component) {
        if (!component.requestedPopup && !component.disabled && !component.active) {
          this.$set(component, `requestedPopup`, true);
          component.onPopup && component.onPopup();
        }
      }
    },
  });
})();
return attributes;