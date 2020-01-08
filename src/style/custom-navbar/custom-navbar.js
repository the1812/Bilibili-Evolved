if (isIframe()) {
  return
}
document.body.style.setProperty("--navbar-bounds-padding", `0 ${settings.customNavbarBoundsPadding}%`)
document.body.style.setProperty("--navbar-blur-opacity", settings.customNavbarBlurOpacity || 0.7)
addSettingsListener("customNavbarBlurOpacity", value => {
  document.body.style.setProperty("--navbar-blur-opacity", value)
})
let showWidget = true
const attributes = {
  widget: {
    content: /*html*/`
      <div class="gui-settings-flat-button" id="custom-navbar-settings">
        <i class="mdi mdi-24px mdi-auto-fix"></i>
        <span>顶栏布局</span>
      </div>`,
    condition: () => showWidget,
    success: async () => {
      const { initSettingsPanel } = await import('./custom-navbar-settings')
      await initSettingsPanel()
    },
  },
  unload: () => {
    const navbar = document.querySelectorAll(".custom-navbar,.custom-navbar-settings")
    navbar.forEach(it => it.style.display = "none")
    resources.removeStyle("customNavbarStyle")
  },
  reload: () => {
    const navbar = document.querySelectorAll(".custom-navbar,.custom-navbar-settings")
    navbar.forEach(it => it.style.display = "flex")
    resources.applyImportantStyle("customNavbarStyle")
  },
}
const classHandler = (key, value, element) => {
  element.classList.toggle(key, value)
}
const darkHandler = value => {
  document.querySelector(".custom-navbar").classList[value ? "add" : "remove"]("dark")
  document.querySelector(".custom-navbar-settings").classList[value ? "add" : "remove"]("dark")
}
// addSettingsListener("allNavbarFill", value => classHandler("all-navbar-fill", value, document.body), true)
const supportedUrls = [
  "//www.bilibili.com",
  "//t.bilibili.com",
  "//search.bilibili.com",
  "//space.bilibili.com",
  "//account.bilibili.com",
  "//pay.bilibili.com",
  "//member.bilibili.com",
  "//big.bilibili.com",
  "//message.bilibili.com",
  "//app.bilibili.com",
  "//passport.bilibili.com",
  "//game.bilibili.com",
  "//live.bilibili.com/blackboard/"
]
const unsupportedUrls = [
  "//t.bilibili.com/lottery/h5/index/#/result",
  "//member.bilibili.com/video/upload",
  "//space.bilibili.com/ajax/",
  "//www.bilibili.com/h5/comment/",
]
if (!supportedUrls.some(it => document.URL.includes(it))
  || unsupportedUrls.some(it => document.URL.includes(it))) {
  showWidget = false
  return attributes
}
document.body.classList.add('custom-navbar-loading')
let userInfo = {}
let orders = {

}
let latestID

class NavbarComponent {
  constructor () {
    this.html = ``
    this.popupHtml = ``
    this.flex = `0 0 auto`
    this.disabled = false
    this.requestedPopup = false
    this.initialPopup = null
    this.onPopup = null
    this.href = null
    this.notifyCount = 0
    this.touch = settings.touchNavBar
    this.active = false
  }
  get name () {
    return "undefined"
  }
  get order () {
    return settings.customNavbarOrder[this.name]
  }
  get hidden () {
    return settings.customNavbarHidden.includes(this.name)
  }
  async setNotifyCount (count) {
    const notifyElement = await SpinQuery.select(`.custom-navbar li[data-name='${this.name}'] .notify-count`)
    if (!notifyElement || !count) {
      notifyElement.innerHTML = ''
      return
    }
    notifyElement.innerHTML = count
  }
  async setNotifyStyle (style) {
    const notifyElement = await SpinQuery.select(`.custom-navbar li[data-name='${this.name}'] .notify-count`)
    if (!notifyElement) {
      return
    }
    const styleMap = {
      1: 'number',
      2: 'dot',
      3: 'hidden'
    }
    notifyElement.classList.remove(Object.values(styleMap))
    notifyElement.classList.add(styleMap[style])
  }
}
class Blank extends NavbarComponent {
  constructor (number) {
    super()
    this.number = number
    this.flex = "1 0 auto"
    this.disabled = true
  }
  get name () {
    return "blank" + this.number
  }
}
class Logo extends NavbarComponent {
  constructor () {
    super()
    this.href = `https://www.bilibili.com/`
    this.touch = false
    addSettingsListener('customNavbarSeasonLogo', () => this.getLogo(), true)
  }
  async getLogo () {
    if (settings.customNavbarSeasonLogo) {
      const json = await Ajax.getJson(
        'https://api.bilibili.com/x/web-show/res/locs?pf=0&ids=142'
      )
      if (json.code === 0) {
        this.html = /*html*/`<img height="38" src="${json.data[142][0].litpic.replace('http:', 'https:')}">`
        return
      }
    }
    this.html = /*html*/`<i class="custom-navbar-iconfont custom-navbar-icon-logo"></i>`
  }
  get name () {
    return "logo"
  }
}
class SimpleLink extends NavbarComponent {
  constructor (name, link, linkName) {
    super()
    this.linkName = linkName
    this.html = name
    this.href = link
    this.touch = false
    this.active = document.URL.startsWith(link)
  }
  get name () {
    return this.linkName + "Link"
  }
}
class Upload extends NavbarComponent {
  constructor () {
    super()
    this.href = "https://member.bilibili.com/v2#/upload/video/frame"
    this.html = /*html*/`
      <svg style="width:16px;height:16px;padding:3px;box-sizing:content-box;" viewBox="0 0 785 886">
        <path d="M582,374L582,566C582,585.333 576.167,600.833 564.5,612.5C552.833,624.167 537.333,630 518,630L262,630C242.667,630 227.167,624.167 215.5,612.5C203.833,600.833 198,585.333 198,566L198,374L32,374C22,374 14.1667,371.167 8.5,365.5C2.83333,359.833 0,352 0,342C0,338.667 1.16666,334.5 3.5,329.5C5.83333,324.5 8.66666,320 12,316L371,9C377.667,3.00006 385.167,6.10352e-005 393.5,0C401.833,6.10352e-005 409.333,3.00006 416,9L774,316C780,322.667 783.333,330.167 784,338.5C784.667,346.833 783.333,354.333 780,361L764,370C760,372.667 754.667,374 748,374ZM70,758L710,758C729.333,758 744.833,763.833 756.5,775.5C768.167,787.167 774,802.667 774,822C774,841.333 768.167,856.833 756.5,868.5C744.833,880.167 729.333,886 710,886L70,886C50.6667,886 35.1667,880.167 23.5,868.5C11.8333,856.833 6,841.333 6,822C6,802.667 11.8333,787.167 23.5,775.5C35.1667,763.833 50.6667,758 70,758Z" />
      </svg>
      <div id="upload-button">投稿</div>`
    this.popupHtml = /*html*/`
      <ul id="upload-actions">
        <li><a target="_blank" href="https://member.bilibili.com/v2#/upload/text/apply">专栏投稿</a></li>
        <li><a target="_blank" href="https://member.bilibili.com/v2#/upload/audio/">音频投稿</a></li>
        <li><a target="_blank" href="https://member.bilibili.com/v2#/upload/video/frame">视频投稿</a></li>
        <li><a target="_blank" href="https://member.bilibili.com/v2#/upload-manager/article">投稿管理</a></li>
        <li><a target="_blank" href="https://member.bilibili.com/v2#/home">创作中心</a></li>
      </ul>
    `
  }
  get name () {
    return "upload"
  }
}
class Messages extends NavbarComponent {
  constructor () {
    super()
    this.href = "https://message.bilibili.com/"
    this.html = "消息"
    this.popupHtml = /*html*/`
      <ul id="message-list">
        <li><a data-name="reply" target="_blank" href="https://message.bilibili.com/#/reply">回复我的</a></li>
        <li><a data-name="at" target="_blank" href="https://message.bilibili.com/#/at">@我的</a></li>
        <li><a data-name="like" target="_blank" href="https://message.bilibili.com/#/love">收到的赞</a></li>
        <li><a data-name="user_msg" target="_blank" href="https://message.bilibili.com/#/whisper">我的消息</a></li>
        <li><a data-name="sys_msg" target="_blank" href="https://message.bilibili.com/#/system">系统通知</a></li>
      </ul>
    `
    this.requestedPopup = true
    this.active = document.URL.startsWith("https://message.bilibili.com/")
    this.fetchSettings().then(notify => {
      if (notify) {
        this.init()
      }
    })
  }
  get name () {
    return "messages"
  }
  async fetchSettings () {
    const json = await bilibiliEvolved.Ajax.getJsonWithCredentials(`https://api.vc.bilibili.com/link_setting/v1/link_setting/get?msg_notify=1`)
    if (json.code !== 0) {
      return
    }
    await this.setNotifyStyle(json.data.msg_notify)
    return json.data.msg_notify !== 3
  }
  async init () {
    const mainJson = await Ajax.getJsonWithCredentials(`https://api.bilibili.com/x/msgfeed/unread`)
    const messageJson = await Ajax.getJsonWithCredentials(`https://api.vc.bilibili.com/session_svr/v1/session_svr/single_unread`)
    const list = await SpinQuery.select("#message-list")
    const items = [...list.querySelectorAll("a[data-name]")]
    const names = items.map(it => it.getAttribute("data-name"))

    if (mainJson.code !== 0 || messageJson.code !== 0) {
      return
    }
    mainJson.data['user_msg'] = messageJson.data.unfollow_unread + messageJson.data.follow_unread
    let totalCount = names.reduce((acc, it) => acc + mainJson.data[it], 0)
    if (!totalCount) {
      return
    }
    await this.setNotifyCount(totalCount)
    names.forEach((name, index) => {
      const count = mainJson.data[name]
      if (count > 0) {
        items[index].setAttribute("data-count", count)
      }
      else {
        items[index].removeAttribute("data-count")
      }
    })
    items.forEach(item => {
      item.addEventListener("click", () => {
        const count = item.getAttribute("data-count")
        item.removeAttribute("data-count")
        totalCount -= count
        this.setNotifyCount(totalCount)
      })
    })
  }
}
class Category extends NavbarComponent {
  constructor () {
    super()
    this.html = `主站`
    // this.requestedPopup = true
    this.popupHtml = /*html*/`
      <ul id="custom-navbar-home-popup">
        <li class="category-item loading" v-if="loading">
          加载中...
        </li>
        <li class="category-item" style="display: none" :style="{display: loading ? 'none' : 'list-item'}" v-for="item of info" :class="{ main: item[1].count }">
          <a :href="item[1].link">
            <svg aria-hidden="true">
              <use :href="'#header-icon-' + item[1].icon" :xlink:href="'#header-icon-' + item[1].icon"></use>
            </svg>
            <div>{{item[0]}}</div>
            <span>{{item[1].count}}</span>
          </a>
          <div class="popup" v-if="item[1].subRegions">
            <a v-for="region of Object.entries(item[1].subRegions)" :href="region[1]">
              {{region[0]}}
            </a>
          </div>
        </li>
      </ul>
    `
    // this.getOnlineInfo().then(info => {
    //   new Vue({
    //     el: "#custom-navbar-home-popup",
    //     data: {
    //       info: Object.entries(info),
    //     },
    //   })
    // })
    const getOnlineInfo = async () => {
      const json = await Ajax.getJson("https://api.bilibili.com/x/web-interface/online")
      if (parseInt(json.code) !== 0) {
        throw new Error(`[自定义顶栏] 分区投稿信息获取失败: ${json.message}`)
      }
      const regionCount = json.data.region_count
      await SpinQuery.select("#custom-navbar-home-popup")
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
        专题: { icon: "topic", count: ``, link: `https://www.bilibili.com/blackboard/topic_list.html`, },
        活动: { icon: "activit", count: ``, link: `https://www.bilibili.com/blackboard/x/act_list`, },
      }
    }
    this.initialPopup = async () => {
      new Vue({
        el: await SpinQuery.select('#custom-navbar-home-popup'),
        data: {
          info: [],
          loading: true,
        },
        async mounted () {
          try {
            this.info = Object.entries(await getOnlineInfo())
          } finally {
            this.loading = false
          }
        },
      })
    }
  }
  get name () {
    return "category"
  }
}
class UserInfo extends NavbarComponent {
  constructor () {
    super()
    this.noPadding = true
    this.href = "https://space.bilibili.com"
    this.html = /*html*/`
      <div class="user-face-container">
        <img src='${EmptyImageUrl}' class="user-face"></img>
        <img src='${EmptyImageUrl}' class="user-pendant"></img>
      </div>
    `
    this.popupHtml = /*html*/`
      <div class="user-info-panel">
        <div v-if="isLogin" class="logged-in">
          <a class="name" target="_blank" href="https://space.bilibili.com/">{{uname}}</a>
          <a class="type" target="_blank" href="https://account.bilibili.com/account/big">{{userType}}</a>
          <div class="privileges row" v-if="this.vipType === 2">
            <div class="b-coin" :class="{received: privileges.bCoin.received}" @click="privilegeReceive(1)" :title="'有效期限: ' + privileges.bCoin.expire">
              {{privileges.bCoin.received ? '已领取B币' : '领取B币'}}
            </div>
            <div class="coupons" :class="{received: privileges.coupons.received}" @click="privilegeReceive(2)" :title="'有效期限: ' + privileges.coupons.expire">
              {{privileges.coupons.received ? '已领取优惠券' : '领取优惠券'}}
            </div>
          </div>
          <div class="level-info row">
            <a target="_blank" title="等级" href="https://account.bilibili.com/account/record"
              class="level">
              <i class="custom-navbar-iconfont-extended" :class="'custom-navbar-icon-lv' + level_info.current_level"></i>
            </a>
            <span class="level-progress-label">{{level_info.current_exp}} / {{level_info.next_exp}}</span>
          </div>
          <div class="level-progress separator">
            <div class="level-progress-thumb" :style="levelProgressStyle"></div>
          </div>
          <div class="items">
            <a class="item" target="_blank" title="手机验证"
              href="https://passport.bilibili.com/account/security#/bindphone">
              <i class="custom-navbar-iconfont-new-home custom-navbar-icon-bind-phone"></i>
              <i v-if="mobile_verified" class="custom-navbar-iconfont-new-home custom-navbar-icon-ok"></i>
              <i v-else class="custom-navbar-iconfont-new-home custom-navbar-icon-cancel"></i>
            </a>
            <a class="item" target="_blank" title="邮箱验证"
              href="https://passport.bilibili.com/account/security#/bindmail">
              <i class="custom-navbar-iconfont-new-home custom-navbar-icon-bind-email"></i>
              <i v-if="email_verified" class="custom-navbar-iconfont-new-home custom-navbar-icon-ok"></i>
              <i v-else class="custom-navbar-iconfont-new-home custom-navbar-icon-cancel"></i>
            </a>
            <a class="item" target="_blank" href="https://account.bilibili.com/site/coin" title="硬币">
              <i class="custom-navbar-iconfont-new-home custom-navbar-icon-coin"></i>
              <span>{{money}}</span>
            </a>
            <a class="item" target="_blank" href="https://pay.bilibili.com/bb_balance.html" title="B币">
              <i class="custom-navbar-iconfont-new-home custom-navbar-icon-b-coin"></i>
              <span>{{wallet.bcoin_balance}}</span>
            </a>
          </div>
          <div class="separator"></div>
          <a class="operation" target="_blank" href="https://account.bilibili.com/account/home">
            <i class="icon custom-navbar-icon-profile custom-navbar-iconfont-new-home"></i>
            个人中心
          </a>
          <a class="operation" target="_blank" href="https://member.bilibili.com/v2#/upload-manager/article">
            <i class="icon custom-navbar-icon-posts custom-navbar-iconfont-new-home"></i>
            投稿管理
          </a>
          <a class="operation" target="_blank" href="https://pay.bilibili.com/">
            <i class="icon custom-navbar-icon-wallet custom-navbar-iconfont-new-home"></i>
            B币钱包
          </a>
          <a class="operation" target="_blank" href="https://link.bilibili.com/p/center/index">
            <i class="icon custom-navbar-icon-live-center custom-navbar-iconfont-new-home"></i>
            直播中心
          </a>
          <a class="operation" target="_blank" href="https://show.bilibili.com/orderlist">
            <i class="icon custom-navbar-icon-order-center custom-navbar-iconfont-new-home"></i>
            订单中心
          </a>
          <!-- <a class="operation" target="_blank" href="https://www.bilibili.com/v/cheese/mine">
            <i class="icon custom-navbar-icon-course custom-navbar-iconfont-new-home"></i>
            我的课程
          </a> -->
          <a class="logout grey-button" href="https://account.bilibili.com/login?act=exit">
            退出登录
          </a>
        </div>
        <div v-else class="not-logged-in">
          <h1 class="welcome">欢迎来到 bilibili</h1>
          <a href="https://passport.bilibili.com/register/phone.html" class="signup grey-button">注册</a>
          <a href="https://passport.bilibili.com/login" class="login theme-button">登录</a>
        </div>
      </div>
    `
    this.requestedPopup = true
    this.init()
  }
  get name () {
    return "userInfo"
  }
  async init () {
    const panel = await SpinQuery.select(".custom-navbar .user-info-panel")
    const face = await SpinQuery.select(".custom-navbar .user-face-container .user-face")
    const userInfoJson = await Ajax.getJsonWithCredentials('https://api.bilibili.com/x/web-interface/nav')
    const userStatJson = await Ajax.getJsonWithCredentials('https://api.bilibili.com/x/web-interface/nav/stat')
    Object.assign(userInfo, userInfoJson.data)
    Object.assign(userInfo, userStatJson.data)
    const vm = new Vue({
      el: panel,
      data: {
        ...userInfo,
        privileges: {
          bCoin: {
            received: false,
            expire: '',
          },
          coupons: {
            received: false,
            expire: '',
          },
        },
      },
      computed: {
        userType () {
          if (!this.isLogin) {
            return "未登录"
          }
          if (this.level_info.current_level === 0) {
            return "注册会员"
          }
          if (this.vipStatus === 1) {
            if (this.vipType === 1) {
              return this.vip_theme_type ? "小会员" : "大会员"
            }
            else if (this.vipType === 2) {
              return this.vip_theme_type ? "年度小会员" : "年度大会员"
            }
          }
          return "正式会员"
        },
        levelProgressStyle () {
          const progress = (this.level_info.current_exp - this.level_info.current_min) / (this.level_info.next_exp - this.level_info.current_min)
          return {
            transform: `scaleX(${progress})`
          }
        }
      },
      methods: {
        async privilegeReceive (type) {
          const typeMapping = {
            1: 'bCoin',
            2: 'coupons'
          }
          if (this.privileges[typeMapping[type]].received) {
            return
          }
          this.privileges[typeMapping[type]].received = true
          const csrf = getCsrf()
          const result = await (await fetch('https://api.bilibili.com/x/vip/privilege/receive',
            {
              credentials: 'include',
              headers: { 'content-type': 'application/x-www-form-urlencoded' },
              body: `type=${type}&csrf=${csrf}`,
              method: 'POST'
            })).json()
          console.log(result)
          if (result.code === 0) {
            if (typeMapping[type] === 'bCoin') {
              this.wallet.bcoin_balance += 5
            }
          } else if (result.code === 69801) { // 已领过
            return
          } else {
            this.privileges[typeMapping[type]].received = false
            logError(result.message)
          }
        },
      },
    })
    if (userInfo.isLogin) {
      const faceUrl = userInfo.face.replace("http", "https")
      const dpis = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4]
      if (!faceUrl.includes('static.hdslb.com/images/member/noface.gif')) { // 没上传过头像的不做缩放
        const faceBaseSize = 68
        face.setAttribute("srcset", dpis.map(dpi => {
          return `${faceUrl}@${parseInt(faceBaseSize * dpi)}w_${parseInt(faceBaseSize * dpi)}h.jpg ${dpi}x`
        }).join(","))
      } else {
        face.setAttribute('src', '//static.hdslb.com/images/member/noface.gif')
      }
      if (userInfo.pendant.image) {
        const pendant = await SpinQuery.select(".custom-navbar .user-face-container .user-pendant")
        const pendantUrl = userInfo.pendant.image.replace("http", "https")
        // pendant.setAttribute("src", pendantUrl)
        const pendantBaseSize = 116
        pendant.setAttribute("srcset", dpis.reduce((acc, dpi) => {
          return acc + `, ${pendantUrl}@${parseInt(pendantBaseSize * dpi)}w_${parseInt(pendantBaseSize * dpi)}h.png ${dpi}x`
        }, ""))
      }
      if (userInfo.vipType === 2) { // 年度大会员权益
        const privileges = await Ajax.getJsonWithCredentials('https://api.bilibili.com/x/vip/privilege/my')
        if (privileges.code === 0) {
          const bCoin = privileges.data.list.find(it => it.type === 1)
          vm.privileges.bCoin.received = bCoin.state === 1
          vm.privileges.bCoin.expire = new Date(bCoin.expire_time * 1000).toLocaleDateString()
          const coupons = privileges.data.list.find(it => it.type === 2)
          vm.privileges.coupons.received = coupons.state === 1
          vm.privileges.coupons.expire = new Date(coupons.expire_time * 1000).toLocaleDateString()
        }
      }
    }
    else {
      face.setAttribute("src", "https://static.hdslb.com/images/akari.jpg")
      // face.style.backgroundImage = `url('https://static.hdslb.com/images/akari.jpg')`
    }
  }
}
class SearchBox extends NavbarComponent {
  constructor () {
    super()
    this.disabled = true
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
        <div class="search-list-item" tabindex="0" v-for="(item, index) of items" v-html="item.html" :title="isHistory ? item.html : ''" @keydown.enter="submit(item.value)" @click.self="submit(item.value)" @keydown.shift.delete="deleteItem(item, index)" @keydown.down.prevent="nextItem(index)" @keydown.up.prevent="previousItem(index)"></div>
        <div tabindex="0" v-if="items.length > 0 && isHistory" class="search-list-item clear-history" @click="clearSearchHistory()" @keydown.enter="clearSearchHistory()" @keydown.down.prevent="nextItem(items.length)" @keydown.up.prevent="previousItem(items.length)"><i class="mdi mdi-18px mdi-delete-sweep"></i>清除搜索历史</div>
      </div>
    `
    this.init()
  }
  async init () {
    const form = await SpinQuery.select("#custom-navbar-search")
    const keywordInput = form.querySelector("input[name='keyword']")
    form.addEventListener("submit", e => {
      if (keywordInput.value === "") {
        if (!settings.hideTopSearch) {
          form.querySelector(".recommended-target").click()
        }
        e.preventDefault()
        return false
      }
      if (/^av[\d]+$/.test(keywordInput.value)) {
        window.open(`https://www.bilibili.com/${keywordInput.value}`)
        e.preventDefault()
        return false
      }
      const historyItem = settings.searchHistory.find(item => item.keyword === keywordInput.value)
      if (historyItem) {
        historyItem.count++
        historyItem.date = new Date().toJSON()
        console.log(historyItem)
      } else {
        settings.searchHistory.unshift({
          count: 1,
          keyword: keywordInput.value,
          date: new Date().toJSON(),
        })
        console.log({
          count: 1,
          keyword: keywordInput.value,
          date: new Date().toJSON(),
        })
      }
      settings.searchHistory = settings.searchHistory.slice(0, 10) // save history
      return true
    })
    if (!settings.hideTopSearch) {
      const json = await Ajax.getJson("https://api.bilibili.com/x/web-interface/search/default")
      if (json.code === 0) {
        keywordInput.setAttribute("placeholder", json.data.show_name)
        let href
        if (json.data.url !== "") {
          href = json.data.url
        }
        else if (json.data.name.startsWith("av")) {
          href = `https://www.bilibili.com/${json.data.name}`
        }
        else {
          href = `https://search.bilibili.com/all?keyword=${json.data.name}`
        }
        form.querySelector(".recommended-target").setAttribute("href", href)
      }
      else {
        console.error("[自定义顶栏] 获取搜索推荐词失败")
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
        deleteItem (item, index) {
          settings.searchHistory.splice(settings.searchHistory.findIndex(it => it.keyword === item.value), 1)
          settings.searchHistory = settings.searchHistory
          this.items.splice(index, 1)
        },
        clearSearchHistory () {
          settings.searchHistory = []
          this.items = []
        }
      },
    })
    const { debounce } = await import('debounce')
    let lastQueuedRequest = ''
    const updateSuggest = async () => {
      const text = keywordInput.value
      searchList.isHistory = text === ''
      if (searchList.isHistory) {
        searchList.items = settings.searchHistory
          .sort((a, b) => {
            const aDate = a.date ? new Date(a.date) : new Date(0)
            const bDate = b.date ? new Date(b.date) : new Date(0)
            return Number(bDate) - Number(aDate)
          })
          .map(item => {
            return {
              value: item.keyword,
              html: item.keyword,
            }
          }).slice(0, 10)
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
    return "search"
  }
}
class Iframe extends NavbarComponent {
  constructor (name, link, { src, width, height, lazy, iframeName }) {
    super()
    this.iframeName = iframeName
    this.html = name
    this.href = link
    this.popupHtml = /*html*/`
      <iframe src="${src}" frameborder="0" width="${width}" height="${height}"></iframe>
    `
    this.noPadding = true
    this.requestedPopup = lazy ? false : true
    this.touch = false
    this.transparent = true
  }
  get name () {
    return this.iframeName + "Iframe"
  }
}
class NotifyIframe extends Iframe {
  constructor (...args) {
    super(...args)
    this.touch = settings.touchNavBar
    this.getNotifyCount()
  }
  getApiUrl () {
    return null
  }
  getCount () {
    return 0
  }
  async getNotifyCount () {
    const notifyElement = await SpinQuery.select(`.custom-navbar li[data-name='${this.name}'] .notify-count`)
    const json = await Ajax.getJsonWithCredentials(this.getApiUrl())
    const count = this.getCount(json)
    if (json.code === 0 && count) {
      notifyElement.innerHTML = count
      this.initialPopup = () => {
        notifyElement.innerHTML = ''
      }
    }
  }
}
let componentUpdate = () => { }
let tabUpdate = () => { }
const getActivityTabComponent = ({ dataObject, apiUrl, name, handleJson, template }) => {
  return {
    template,
    components: {
      'dpi-img': () => import('../dpi-img.vue'),
    },
    methods: {
      handleJson,
      async fetchData (silent = false) {
        try {
          const json = await Ajax.getJsonWithCredentials(apiUrl)
          if (json.code !== 0) {
            throw new Error(json.message)
          }
          await this.handleJson(json)
        } catch (error) {
          if (silent === true) {
            return
          }
          logError(`加载${name}动态失败, error = ${error}`)
        } finally {
          this.loading = false
        }
      }
    },
    data () {
      return Object.assign({
        loading: true,
      }, dataObject)
    },
    mounted () {
      this.fetchData()
      componentUpdate = async () => await this.fetchData(true)
    },
    destroyed () {
      componentUpdate = () => { }
    },
  }
}
// https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_history?uid=39717974&offset_dynamic_id=311158827135150245&type=8
class Activities extends NavbarComponent {
  constructor () {
    super()
    this.noPadding = true
    this.href = settings.oldTweets ? "https://www.bilibili.com/account/dynamic" : "https://t.bilibili.com/"
    this.html = "动态"
    this.popupHtml = /*html*/`
      <div class="activity-popup">
        <activity-tabs :tab.sync="selectedTab" :items="tabs"></activity-tabs>
        <div class="activity-popup-content">
          <transition name="activity-content" mode="out-in">
            <component :is="content"></component>
          </transition>
          <!-- <a class="view-more" target="_blank" :href="viewMoreUrl">查看更多<i class="mdi mdi-dots-horizontal-circle-outline"></i></a> -->
        </div>
      </div>
    `
    this.active = document.URL.replace(/\?.*$/, "") === this.href
    this.initialPopup = () => {
      this.init()
    }
    this.onPopup = () => {
      this.setNotifyCount(0)
    }
    this.getNotifyCount()
    setInterval(async () => {
      await this.getNotifyCount()
      await tabUpdate()
      await componentUpdate()
    }, Activities.updateInterval)
  }
  static get updateInterval () {
    return 5 * 60 * 1000 // 每5分钟更新1次动态提醒数字
  }
  static getLatestID () {
    return document.cookie.replace(new RegExp(`(?:(?:^|.*;\\s*)bp_t_offset_${userInfo.mid}\\s*\\=\\s*([^;]*).*$)|^.*$`), '$1')
  }
  static setLatestID (id) {
    const currentID = Activities.getLatestID()
    if (Activities.compareID(id, currentID) < 0) {
      return
    }
    document.cookie = `bp_t_offset_${userInfo.mid}=${id};path=/;domain=.bilibili.com;max-age=${60 * 60 * 24 * 30}`
  }
  static compareID (a, b) {
    if (a === b) {
      return 0
    }
    if (a.length > b.length) {
      return 1
    }
    if (b.length > a.length) {
      return -1
    }
    return a > b === true ? 1 : -1
  }
  static isNewID (id) {
    return Activities.compareID(id, latestID) > 0
  }
  static updateLatestID (cards) {
    const [id] = [...cards.map(c => c.id)].sort(Activities.compareID).reverse()
    Activities.setLatestID(id)
  }
  async getNotifyCount () {
    const api = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_num?rsp_type=1&uid=${userInfo.mid}&update_num_dy_id=${Activities.getLatestID()}&type_list=8,64,512`
    const json = await Ajax.getJsonWithCredentials(api)
    if (json.code !== 0) {
      return
    }
    this.setNotifyCount(json.data.update_num)
  }
  async init () {
    Vue.component('activity-loading', {
      template: /*html*/`
        <div v-if="loading" class="loading">
          <i class="mdi mdi-18px mdi-loading mdi-spin"></i>加载中...
        </div>`,
      props: ['loading'],
    })
    Vue.component('activity-empty', {
      template: /*html*/`
        <div class="empty">空空如也哦 =￣ω￣=</div>`,
    })
    this.popupVM = new Vue({
      el: await SpinQuery.select('.activity-popup'),
      data: {
        tabs: [
          {
            name: '视频',
            component: 'video-activity',
            moreUrl: 'https://t.bilibili.com/?tab=8',
            get notifyApi () {
              return `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_num?rsp_type=1&uid=${userInfo.mid}&update_num_dy_id=${Activities.getLatestID()}&type_list=8`
            },
            notifyCount: null,
          },
          {
            name: '番剧',
            component: 'bangumi-activity',
            moreUrl: 'https://t.bilibili.com/?tab=512',
            get notifyApi () {
              return `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_num?rsp_type=1&uid=${userInfo.mid}&update_num_dy_id=${Activities.getLatestID()}&type_list=512`
            },
            notifyCount: null,
          },
          {
            name: '专栏',
            component: 'column-activity',
            moreUrl: 'https://t.bilibili.com/?tab=64',
            get notifyApi () {
              return `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_num?rsp_type=1&uid=${userInfo.mid}&update_num_dy_id=${Activities.getLatestID()}&type_list=64`
            },
            notifyCount: null,
          },
          {
            name: '直播',
            component: 'live-activity',
            moreUrl: 'https://link.bilibili.com/p/center/index#/user-center/follow/1',
            notifyCount: null,
          },
        ],
        selectedTab: '视频',
      },
      components: {
        'activity-tabs': {
          props: ['items', 'tab'],
          template: /*html*/`
            <ul class="activity-tabs">
              <li v-for="item of items" class="activity-tab" :data-count="item.notifyCount" :class="{selected: item.name === tab}" @click="changeTab(item)">
                <div class="tab-name">{{item.name}}</div>
              </li>
              <a class="view-all" target="_blank" href="${settings.oldTweets ? 'https://www.bilibili.com/account/dynamic' : 'https://t.bilibili.com/'}">
                全部动态
                <i class="custom-navbar-iconfont-new-home custom-navbar-icon-activity"></i>
              </a>
            </ul>
          `,
          methods: {
            changeTab (item) {
              if (this.tab === item.name) {
                window.open(item.moreUrl, '_blank')
              }
              this.$emit('update:tab', item.name)
            }
          },
        },
        'video-activity': Object.assign(getActivityTabComponent({
          dataObject: {
            leftCards: [],
            rightCards: [],
          },
          apiUrl: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${userInfo.mid}&type_list=8`,
          name: '视频',
          template: /*html*/`
            <div class="video-activity" :class="{center: loading || (leftCards.length + rightCards.length) === 0}">
              <activity-loading :loading="loading"></activity-loading>
              <activity-empty v-if="!loading && leftCards.length + rightCards.length === 0"></activity-empty>
              <div v-if="!loading" class="video-activity-column">
                <video-card v-for="card of leftCards" :key="card.id" :card="card" :watchlaterInit="card.watchlater"></video-card>
              </div>
              <div v-if="!loading" class="video-activity-column">
                <video-card v-for="card of rightCards" :key="card.id" :card="card" :watchlaterInit="card.watchlater"></video-card>
              </div>
            </div>
          `,
          handleJson: async function (json) {
            // const { getWatchlaterList } = await import('../../video/watchlater-api')
            // const watchlaterList = await getWatchlaterList()
            const cards = json.data.cards.map(card => {
              const cardJson = JSON.parse(card.card)
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
                watchlater: true,
                get new () { return Activities.isNewID(this.id) },
              }
            })
            this.leftCards = cards.filter((_, index) => index % 2 === 0)
            this.rightCards = cards.filter((_, index) => index % 2 === 1)
            if (this.leftCards.length !== this.rightCards.length) {
              this.leftCards.pop()
            }
            Activities.updateLatestID(cards)
          }
        }), {
          components: {
            'video-card': {
              props: ['card', 'watchlaterInit'],
              store,
              data () {
                return {
                  // watchlater: this.watchlaterInit,
                }
              },
              computed: {
                ...Vuex.mapState(['watchlaterList']),
                watchlater () {
                  if (this.watchlaterInit !== null) {
                    return this.watchlaterList.includes(this.card.aid)
                  } else {
                    return null
                  }
                }
              },
              components: {
                'dpi-img': () => import('../dpi-img.vue'),
              },
              methods: {
                ...Vuex.mapActions(['toggleWatchlater']),
              },
              async mounted () {
                // 预加载稍后再看的API
                // await import('../../video/watchlater-api')
              },
              template: /*html*/`
                <a class="video-activity-card" :class="{new: card.new}" target="_blank" :href="card.videoUrl">
                  <div class="cover-container">
                    <dpi-img class="cover" :size="{width: 172}" :src="card.coverUrl"></dpi-img>
                    <div class="time">{{card.time}}</div>
                    <div @click.stop.prevent="toggleWatchlater(card.aid)" class="watchlater"><i class="mdi" :class="{'mdi-clock-outline': !watchlater, 'mdi-check-circle': watchlater}"></i>{{watchlater ? '已添加' : '稍后再看'}}</div>
                  </div>
                  <h1 class="title" :title="card.title">{{card.title}}</h1>
                  <a class="up" target="_blank" :href="card.upUrl" :title="card.upName">
                    <dpi-img class="face" :size="24" :src="card.faceUrl"></dpi-img>
                    <span class="name">{{card.upName}}</span>
                  </a>
                </a>
              `,
            },
          },
        }),
        'bangumi-activity': getActivityTabComponent({
          dataObject: { cards: [] },
          apiUrl: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${userInfo.mid}&type_list=512`,
          name: '番剧',
          template: /*html*/`
            <div class="bangumi-activity" :class="{center: loading || cards.length === 0}">
              <activity-loading :loading="loading"></activity-loading>
              <activity-empty v-if="!loading && cards.length === 0"></activity-empty>
              <a v-if="!loading" class="bangumi-card" :class="{new: card.new}" v-for="card of cards" :key="card.id" target="_blank" :href="card.url">
                <dpi-img class="ep-cover" :size="{width: 100}" :src="card.epCoverUrl"></dpi-img>
                <h1 class="ep-title" :title="card.epTitle">{{card.epTitle}}</h1>
                <div class="up" :title="card.title">
                  <dpi-img class="cover" :size="24" :src="card.coverUrl"></dpi-img>
                  <div class="title">{{card.title}}</div>
                </div>
              </a>
            </div>
          `,
          handleJson: async function (json) {
            this.cards = json.data.cards.map(card => {
              const cardJson = JSON.parse(card.card)
              return {
                title: cardJson.apiSeasonInfo.title,
                coverUrl: cardJson.apiSeasonInfo.cover,
                epCoverUrl: cardJson.cover,
                epTitle: cardJson.new_desc,
                url: cardJson.url,
                id: card.desc.dynamic_id_str,
                get new () { return Activities.isNewID(this.id) },
              }
            })
            Activities.updateLatestID(this.cards)
          },
        }),
        'column-activity': getActivityTabComponent({
          dataObject: { cards: [] },
          apiUrl: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${userInfo.mid}&type_list=64`,
          name: '专栏',
          template: /*html*/`
            <div class="column-activity" :class="{center: loading || cards.length === 0}">
              <activity-loading :loading="loading"></activity-loading>
              <activity-empty v-if="!loading && cards.length === 0"></activity-empty>
              <a v-if="!loading" class="column-card" :class="{new: card.new}" v-for="card of cards" :key="card.id" target="_blank" :href="card.url">
                <div class="covers">
                  <dpi-img class="cover" v-for="cover of card.covers" :key="cover" :size="{height: 120}" :src="cover"></dpi-img>
                  <a class="up" target="_blank" :href="card.upUrl">
                    <dpi-img class="face" :size="24" :src="card.faceUrl"></dpi-img>
                    <div class="name">{{card.upName}}</div>
                  </a>
                </div>
                <h1 class="title" :title="card.title">{{card.title}}</h1>
                <div class="description" :title="card.description">{{card.description}}</div>
              </a>
            </div>
          `,
          handleJson: async function (json) {
            this.cards = json.data.cards.map(card => {
              const cardJson = JSON.parse(card.card)
              return {
                covers: cardJson.image_urls,
                originalCovers: cardJson.origin_image_urls,
                upName: cardJson.author.name,
                faceUrl: cardJson.author.face,
                upUrl: `https://space.bilibili.com/${cardJson.author.mid}`,
                title: cardJson.title,
                description: cardJson.summary,
                url: `https://www.bilibili.com/read/cv${cardJson.id}`,
                id: card.desc.dynamic_id_str,
                get new () { return Activities.isNewID(this.id) },
              }
            })
            Activities.updateLatestID(this.cards)
          },
        }),
        'live-activity': getActivityTabComponent({
          dataObject: { cards: [] },
          apiUrl: `https://api.live.bilibili.com/relation/v1/feed/feed_list?page=1&pagesize=24`,
          name: '直播',
          template: /*html*/`
            <div class="live-activity" :class="{center: loading || cards.length === 0}">
              <activity-loading :loading="loading"></activity-loading>
              <activity-empty v-if="!loading && cards.length === 0"></activity-empty>
              <a v-if="!loading" class="live-card" v-for="card of cards" :key="card.id" target="_blank" :href="card.url">
                <dpi-img class="face" :size="{width: 48}" :src="card.faceUrl"></dpi-img>
                <h1 class="live-title" :title="card.title">{{card.title}}</h1>
                <div class="name" :title="card.name">{{card.name}}</div>
              </a>
            </div>
          `,
          handleJson: async function (json) {
            this.cards = json.data.list.map(card => {
              return {
                faceUrl: card.face,
                title: card.title,
                name: card.uname,
                id: card.roomid,
                url: card.link,
              }
            })
          },
        }),
      },
      computed: {
        content () {
          return this.tabs.find(tab => tab.name === this.selectedTab).component
        },
        viewMoreUrl () {
          return this.tabs.find(tab => tab.name === this.selectedTab).moreUrl
        },
      },
      mounted () {
        tabUpdate = async () => {
          for (const tab of this.tabs) {
            if (tab.notifyApi) {
              const json = await Ajax.getJsonWithCredentials(tab.notifyApi)
              if (json.code !== 0 || !json.data.update_num || this.selectedTab === tab.name) {
                continue
              }
              tab.notifyCount = json.data.update_num
            }
          }
        }
        tabUpdate()
      },
      destroyed () {
        tabUpdate = () => { }
      },
      watch: {
        selectedTab (name) {
          this.tabs.find(t => t.name === name).notifyCount = null
        }
      },
    })
  }
  get name () {
    return "activities"
  }
}
class VideoList extends NavbarComponent {
  constructor ({ mainUrl, name, apiUrl, listName, listMap }) {
    super()
    this.href = mainUrl
    this.listName = listName
    this.html = name
    this.noPadding = true
    this.requestedPopup = false
    this.popupHtml = /*html*/`
      <ol class="video-list ${listName}">
          <li class="loading">加载中...</li>
      </ol>
    `
    this.initialPopup = async () => {
      if (!listMap) {
        return
      }
      const videoListElement = await SpinQuery.select(`.video-list.${listName}`)
      if (videoListElement === null) {
        return
      }
      const json = await Ajax.getJsonWithCredentials(apiUrl)
      let videoList = ''
      if (json.code !== 0) {
        logError(`加载${name}信息失败. 错误码: ${json.code} ${json.message}`)
      } else {
        videoList = listMap(json).join("")
      }
      videoListElement.insertAdjacentHTML("beforeend", videoList + /*html*/`
        <li class="more"><a target="_blank" href="${mainUrl}">查看更多</a></li>
      `)
      videoListElement.classList.add("loaded")
    }
  }
  get name () {
    return this.listName + "List"
  }
}
// class WatchlaterList extends VideoList {
//   constructor () {
//     super({
//       name: "稍后再看",
//       mainUrl: "https://www.bilibili.com/watchlater/#/list",
//       apiUrl: "https://api.bilibili.com/x/v2/history/toview/web",
//       listName: "watchlater",
//       listMap: json => {
//         if (!json.data.list) {
//           return [/*html*/`<li class="loading empty">空空如也哦 =￣ω￣=</li>`]
//         }
//         return json.data.list.slice(0, 6).map(item => {
//           const href = (() => {
//             if (item.pages === undefined) {
//               return settings.watchLaterRedirect ?
//                 `https://www.bilibili.com/video/av${item.aid}` :
//                 `https://www.bilibili.com/watchlater/#/av${item.aid}`
//             }
//             const pages = item.pages.map(it => it.cid)
//             const page = item.cid === 0 ? 1 : pages.indexOf(item.cid) + 1
//             return settings.watchLaterRedirect ?
//               `https://www.bilibili.com/video/av${item.aid}?p=${page}` :
//               `https://www.bilibili.com/watchlater/#/av${item.aid}/p${page}`
//           })()
//           return /*html*/`<li><a target="_blank" href="${href}">${item.title}</a></li>`
//         })
//       },
//     })
//     this.active = document.URL.startsWith("https://www.bilibili.com/watchlater/")
//   }
// }
class WatchlaterList extends NavbarComponent {
  constructor () {
    super()
    this.noPadding = true
    this.href = 'https://www.bilibili.com/watchlater/#/list'
    this.html = '稍后再看'
    this.active = document.URL.startsWith('https://www.bilibili.com/watchlater/')
    this.popupHtml = /*html*/`
      <div class="watchlater-list loading">
        <div class="loading-tip">
          加载中...
        </div>
        <div class="empty-tip" v-if="filteredCards.length === 0">
          空空如也哦 =￣ω￣=
        </div>
        <div class="header">
          <!--<div class="operations">
            <div v-if="!redirect" class="round-button" title="播放全部"><i class="mdi mdi-play-circle-outline"></i></div>
            <div class="round-button" title="移除已观看"><i class="mdi mdi-eye-check-outline"></i></div>
            <div class="round-button" title="清空全部"><i class="mdi mdi-trash-can-outline"></i></div>
          </div>-->
          <div class="search">
            <input type="text" placeholder="搜索" v-model="search">
          </div>
          <a class="more-info" href="https://www.bilibili.com/watchlater/#/list" title="查看更多" target="_blank">
            查看更多
            <i class="mdi mdi-dots-horizontal"></i>
          </a>
        </div>
        <transition-group name="cards" tag="div" class="cards">
          <div class="watchlater-card" v-for="(card, index) of filteredCards" :key="card.aid">
            <a class="cover-container" target="_blank" :href="card.href">
              <dpi-img class="cover" :src="card.coverUrl" :size="{width: 140, height: 90}"></dpi-img>
              <div class="floating remove" title="移除" @click.prevent="remove(card.aid, index)"><i class="mdi mdi-close"></i></div>
              <div class="floating duration">{{card.durationText}}</div>
              <div class="floating viewed" v-if="card.complete">
                已观看
              </div>
            </a>
            <a class="title" target="_blank" :href="card.href" :title="card.title">{{card.title}}</a>
            <a class="up" target="_blank" :href="'https://space.bilibili.com/' + card.upID" :title="card.upName">
              <dpi-img class="face" :src="card.upFaceUrl" :size="24"></dpi-img>
              <div class="name">{{card.upName}}</div>
            </a>
          </div>
        </transition-group>
        <!--<div class="undo round-button">
          <i class="mdi mdi-undo-variant"></i>
          撤销
        </div>-->
      </div>
    `
    this.initialPopup = () => {
      this.init()
    }
  }
  async init () {
    console.log(await SpinQuery.select(`.custom-navbar [data-name="${this.name}"] .watchlater-list`))
    new Vue({
      el: await SpinQuery.select(`.custom-navbar [data-name="${this.name}"] .watchlater-list`),
      store,
      components: {
        DpiImg: () => import('../dpi-img.vue'),
      },
      data: {
        cards: [],
        search: '',
        lastRemovedAid: 0,
        // redirect: settings.watchLaterRedirect,
      },
      computed: {
        ...Vuex.mapState(['watchlaterList']),
        filteredCards() {
          const search = this.search.toLowerCase()
          return this.cards.filter(card => {
            return card.title.toLowerCase().includes(search) || card.upName.toLowerCase().includes(search)
          })
        }
      },
      watch: {
        watchlaterList () {
          this.updateList()
        }
      },
      methods: {
        ...Vuex.mapActions(['toggleWatchlater']),
        async updateList () {
          const { getWatchlaterList } = await import('../../video/watchlater-api')
          const rawList = await getWatchlaterList(true)
          if (!rawList) {
            this.cards = []
            return
          }
          const cards = rawList.map(item => {
            const href = (() => {
              if (item.pages === undefined) {
                return settings.watchLaterRedirect ?
                  `https://www.bilibili.com/video/av${item.aid}` :
                  `https://www.bilibili.com/watchlater/#/av${item.aid}`
              }
              const pages = item.pages.map(it => it.cid)
              const page = item.cid === 0 ? 1 : pages.indexOf(item.cid) + 1
              return settings.watchLaterRedirect ?
                `https://www.bilibili.com/video/av${item.aid}?p=${page}` :
                `https://www.bilibili.com/watchlater/#/av${item.aid}/p${page}`
            })()
            const percent = Math.round(1000 * item.progress / item.duration) / 1000
            return {
              aid: item.aid,
              href,
              coverUrl: item.pic.replace('http:', 'https:'),
              durationText: formatDuration(item.duration),
              duration: item.duration,
              // percent: `${fixed(percent * 100)}%`,
              complete: item.progress < 0 || percent > 0.95, // 进度过95%算看完, -1值表示100%
              title: item.title,
              upName: item.owner.name,
              upFaceUrl: item.owner.face.replace('http:', 'https:'),
              upID: item.owner.mid,
            }
          })
          // const noChange = cards.length === this.cards.length && cards.every((c, i) => this.cards[i].aid === c.aid)
          // console.log(noChange)
          // if (noChange) {
          //   console.log('skipped cards update')
          //   return
          // }
          this.cards = cards
        },
        async remove (aid, index) {
          this.cards.splice(index, 1)
          await this.toggleWatchlater(aid)
          this.lastRemovedAid = aid
        },
        async undo () {
          const aid = this.lastRemovedAid
          if (aid !== 0) {
            await this.toggleWatchlater(aid)
          }
        }
      },
      async mounted () {
        try {
          await this.updateList()
        } finally {
          this.$el.classList.remove('loading')
        }
      },
    })
  }
  get name () {
    return 'watchlaterList'
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
        if (!json.data || json.data.length === 0) {
          return [/*html*/`<li class="loading empty">空空如也哦 =￣ω￣=</li>`]
        }
        return json.data.map(item => {
          return /*html*/`
            <li>
              <a target="_blank" href="https://www.bilibili.com/video/av${item.id}">${item.title}</a>
            </li>`
        })
      },
    })
    this.active = document.URL.replace(/\?.*$/, "") === `https://space.bilibili.com/${userInfo.mid}/favlist`
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
        if (!json.data || json.data.length === 0) {
          return [/*html*/`<li class="loading empty">空空如也哦 =￣ω￣=</li>`]
        }
        return json.data.map(item => {
          let parameter = []
          let description = ""
          const page = item.page ? item.page.page : 1
          let progress = item.progress >= 0 ? item.progress / item.duration : 1
          if (isNaN(progress)) {
            progress = 0
          }

          if (page !== 1) {
            parameter.push(`p=${page}`)
            description += `看到第${page}话`
          }
          if (item.progress > 0 && item.progress < item.duration) {
            parameter.push(`t=${item.progress}`)
            description += ` ${Math.floor(progress * 100)}%`
          }
          else if (item.progress === 0) {
            description += ` 刚开始看`
          }
          else {
            description += " 100%"
          }
          return /*html*/`
            <li class="history-item">
              <a target="_blank" href="https://www.bilibili.com/video/av${item.aid}?${parameter.join("&")}">
                <span class="title">${item.title}</span>
                <span class="description">${description}</span>
                <div class="progress background">
                  <div class="progress foreground" style="--progress: ${progress * 100}%"></div>
                </div>
              </a>
            </li>`
        })
      },
    })
    this.active = document.URL.replace(/\?.*$/, "") === "https://www.bilibili.com/account/history"
  }
}
class Subscriptions extends NavbarComponent {
  constructor () {
    super()
    this.noPadding = true
    this.href = `https://space.bilibili.com/${userInfo.mid}/bangumi`
    this.html = '订阅'
    this.active = [`https://space.bilibili.com/${userInfo.mid}/bangumi`, `https://space.bilibili.com/${userInfo.mid}/cinema`, `https://space.bilibili.com/${userInfo.mid}/subs`].includes(document.URL.replace(/\?.*$/, ""))
    this.popupHtml = /*html*/`
    <div class="subscriptions">
      <ul class="subscriptions-tabs">
        <li class="tab" :class="{selected: bangumi}" @click="bangumi = true">追番</li>
        <li class="tab" :class="{selected: !bangumi}" @click="bangumi = false">追剧</li>
        <div class="tab-placeholder"></div>
        <a class="view-all" target="_blank" :href="'https://space.bilibili.com/${userInfo.mid}/' + (bangumi ? 'bangumi' : 'cinema')">
          查看更多
          <i class="mdi mdi-dots-horizontal"></i>
        </a>
      </ul>
      <div class="content">
        <transition name="subscriptions-content" mode="out-in">
          <bangumi-subscriptions v-if="bangumi" type="bangumi" :key="'bangumi'"></bangumi-subscriptions>
          <bangumi-subscriptions v-else type="cinema" :key="'cinema'"></bangumi-subscriptions>
        </transition>
      </div>
    </div>`
    this.initialPopup = () => { this.init() }
  }
  async init () {
    new Vue({
      el: await SpinQuery.select('.custom-navbar .subscriptions'),
      data: {
        bangumi: true,
      },
      components: {
        'bangumi-subscriptions': {
          props: ['type'],
          components: {
            'dpi-img': () => import('../dpi-img.vue'),
          },
          template: /*html*/`
            <div class="bangumi-subscriptions" :class="{center: loading || !loading && cards.length === 0}">
              <div v-if="loading" class="loading">
                <i class="mdi mdi-18px mdi-loading mdi-spin"></i>
                加载中...
              </div>
              <div v-if="!loading && cards.length === 0" class="empty">空空如也哦 =￣ω￣=</div>
              <a v-if="!loading" v-for="card of cards" :key="card.id" :href="card.playUrl" target="_blank" class="bangumi-subscriptions-card">
                <dpi-img class="cover" :src="card.coverUrl" :size="{height: 64}"></dpi-img>
                <div class="card-info">
                  <h1 class="title" :title="card.title">{{card.title}}</h1>
                  <div class="progress-row">
                    <div v-if="card.progress" class="progress" :title="card.progress + ' | ' + card.latest">{{card.progress}} | {{card.latest}}</div>
                    <div v-else class="progress" :title="card.latest">{{card.latest}}</div>
                    <a class="info" :href="card.mediaUrl" target="_blank" title="详细信息">
                      <i class="mdi mdi-information-outline"></i>
                    </a>
                  </div>
                </div>
              </a>
            </div>
          `,
          data () {
            return {
              loading: true,
              cards: [],
            }
          },
          async mounted () {
            try {
              const json = await Ajax.getJsonWithCredentials(`https://api.bilibili.com/x/space/bangumi/follow/list?type=${this.type !== 'bangumi' ? '2' : '1'}&pn=1&ps=16&vmid=${userInfo.mid}`)
              if (json.code !== 0) {
                logError(`加载订阅信息失败: ${json.message}`)
                return
              }
              this.cards = json.data.list.map(item => {
                return {
                  title: item.title,
                  coverUrl: item.square_cover.replace('http:', 'https:'),
                  latest: item.new_ep.index_show,
                  progress: item.progress,
                  id: item.season_id,
                  playUrl: `https://www.bilibili.com/bangumi/play/ss${item.season_id}`,
                  mediaUrl: `https://www.bilibili.com/bangumi/media/md${item.media_id}`,
                }
              })
            } finally {
              this.loading = false
            }
          },
        },
      },
    })
  }
  get name () {
    return 'bangumi'
  }
}

(async () => {
  const html = await import("customNavbarHtml")
  userInfo = {
    mid: getUID(),
    isLogin: Boolean(getUID()),
  }
  latestID = Activities.getLatestID()
  document.body.insertAdjacentHTML("beforeend", html)
  addSettingsListener("useDarkStyle", darkHandler, true);
  ["Fill", "Shadow", "Compact", "Blur"].forEach(item => {
    addSettingsListener("customNavbar" + item, value => classHandler(item.toLowerCase(), value, document.querySelector(".custom-navbar")), true)
  })
  SpinQuery.condition(() => dq("#banner_link,.international-header .bili-banner"),
    banner => banner === null ? null : banner.style.backgroundImage,
    banner => {
      Observer.attributes(banner, () => {
        const blurLayers = document.querySelectorAll(".custom-navbar .blur-layer")
        blurLayers.forEach(blurLayer => {
          blurLayer.style.backgroundImage = banner.style.backgroundImage
          blurLayer.setAttribute("data-image", banner.style.backgroundImage)
        })
        addSettingsListener('customNavbarTransparent', value => {
          if (!settings.hideBanner) {
            dq('.custom-navbar').classList.toggle('transparent', value)
          }
        }, true)
        addSettingsListener('hideBanner', value => {
          if (settings.customNavbarTransparent) {
            dq('.custom-navbar').classList.toggle('transparent', !value)
          }
        })
      })
    })

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
  ]
  if (userInfo.isLogin) {
    components.push(
      new Messages,
      // new SimpleLink('订阅', `https://space.bilibili.com/${userInfo.mid}/bangumi`, 'bangumi'),
      new Subscriptions,
      new Activities,
      new WatchlaterList,
      new FavoritesList,
      new HistoryList,
    )
  }
  components.push(new Upload, new Blank(3))
  new Vue({
    el: ".custom-navbar",
    data: {
      components,
    },
    methods: {
      requestPopup (component) {
        if (!component.requestedPopup && !component.disabled && !component.active) {
          this.$set(component, `requestedPopup`, true)
          component.initialPopup && component.initialPopup()
        }
        component.onPopup && component.onPopup()
      }
    },
    mounted () {
      document.body.classList.remove('custom-navbar-loading')
    },
  })
})()
return attributes
