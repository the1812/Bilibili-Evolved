import { NavbarComponent } from '../custom-navbar-component'

export class Category extends NavbarComponent {
  constructor() {
    super()
    this.boundingWidth = 366
    this.href = `https://www.bilibili.com`
    this.html = `主站`
    // this.requestedPopup = true
    this.popupHtml = /*html*/`
      <ul id="custom-navbar-home-popup">
        <li class="category-item loading" v-if="loading">
          加载中...
        </li>
        <li class="category-item" style="display: none" :style="{display: loading ? 'none' : 'list-item'}" v-for="item of info" :class="{ main: item[1].count }">
          <a :href="item[1].link" target="_blank">
            <svg aria-hidden="true">
              <use :href="'#header-icon-' + item[1].icon" :xlink:href="'#header-icon-' + item[1].icon"></use>
            </svg>
            <div>{{item[0]}}</div>
            <span>{{item[1].count}}</span>
          </a>
          <div class="popup" v-if="item[1].subRegions">
            <a v-for="region of Object.entries(item[1].subRegions)" :href="region[1]" target="_blank">
              {{region[0]}}
            </a>
          </div>
        </li>
      </ul>
    `
    const getOnlineInfo = async () => {
      const json = await Ajax.getJson('https://api.bilibili.com/x/web-interface/online')
      if (parseInt(json.code) !== 0) {
        throw new Error(`[自定义顶栏] 分区投稿信息获取失败: ${json.message}`)
      }
      const regionCount = json.data.region_count
      await SpinQuery.select('#custom-navbar-home-popup')
      return {
        动画: {
          icon: 'douga',
          count: regionCount[1], link: `https://www.bilibili.com/v/douga/`,
          subRegions: {
            'MAD·AMV': `https://www.bilibili.com/v/douga/mad/`,
            'MMD·3D': `https://www.bilibili.com/v/douga/mmd/`,
            '短片·手书·配音': `https://www.bilibili.com/v/douga/voice/`,
            '手办·模玩': `https://www.bilibili.com/v/douga/garage_kit/`,
            '特摄': `https://www.bilibili.com/v/douga/tokusatsu/`,
            '综合': `https://www.bilibili.com/v/douga/other/`,
          },
        },
        番剧: {
          icon: 'anime',
          count: regionCount[13], link: `https://www.bilibili.com/anime/`,
          subRegions: {
            '连载动画': `https://www.bilibili.com/v/anime/serial/`,
            '完结动画': `https://www.bilibili.com/v/anime/finish/`,
            '资讯': `https://www.bilibili.com/v/anime/information/`,
            '官方延伸': `https://www.bilibili.com/v/anime/offical/`,
            '新番时间表': `https://www.bilibili.com/anime/timeline/`,
            '番剧索引': `https://www.bilibili.com/anime/index/`,
          },
        },
        国创: {
          icon: 'guochuang',
          count: regionCount[167], link: `https://www.bilibili.com/guochuang/`,
          subRegions: {
            '国产动画': `https://www.bilibili.com/v/guochuang/chinese/`,
            '国产原创相关': `https://www.bilibili.com/v/guochuang/original/`,
            '布袋戏': `https://www.bilibili.com/v/guochuang/puppetry/`,
            '动态漫·广播剧': `https://www.bilibili.com/v/guochuang/motioncomic/`,
            '资讯': `https://www.bilibili.com/v/guochuang/information/`,
            '新番时间表': `https://www.bilibili.com/guochuang/timeline/`,
            '国产动画索引': `https://www.bilibili.com/guochuang/index/`,
          },
        },
        音乐: {
          icon: 'music',
          count: regionCount[3], link: `https://www.bilibili.com/v/music/`,
          subRegions: {
            '原创音乐': 'https://www.bilibili.com/v/music/original/',
            '翻唱': 'https://www.bilibili.com/v/music/cover/',
            'VOCALOID·UTAU': 'https://www.bilibili.com/v/music/vocaloid/',
            '电音': 'https://www.bilibili.com/v/music/electronic/',
            '演奏': 'https://www.bilibili.com/v/music/perform/',
            'MV': 'https://www.bilibili.com/v/music/mv/',
            '音乐现场': 'https://www.bilibili.com/v/music/live/',
            '音乐综合': 'https://www.bilibili.com/v/music/other/',
            '音频': 'https://www.bilibili.com/audio/home?musicType=music',
            '说唱': 'https://www.bilibili.com/v/rap',
          },
        },
        舞蹈: {
          icon: 'dance',
          count: regionCount[129], link: `https://www.bilibili.com/v/dance/`, subRegions: {
            '宅舞': 'https://www.bilibili.com/v/dance/otaku/',
            '街舞': 'https://www.bilibili.com/v/dance/hiphop/',
            '明星舞蹈': 'https://www.bilibili.com/v/dance/star/',
            '中国舞': 'https://www.bilibili.com/v/dance/china/',
            '舞蹈综合': 'https://www.bilibili.com/v/dance/three_d/',
            '舞蹈教程': 'https://www.bilibili.com/v/dance/demo/'
          },
        },
        游戏: {
          icon: 'game',
          count: regionCount[4], link: `https://www.bilibili.com/v/game/`, subRegions: {
            '单机游戏': 'https://www.bilibili.com/v/game/stand_alone/',
            '电子竞技': 'https://www.bilibili.com/v/game/esports/',
            '手机游戏': 'https://www.bilibili.com/v/game/mobile/',
            '网络游戏': 'https://www.bilibili.com/v/game/online/',
            '桌游棋牌': 'https://www.bilibili.com/v/game/board/',
            'GMV': 'https://www.bilibili.com/v/game/gmv/',
            '音游': 'https://www.bilibili.com/v/game/music/',
            'Mugen': 'https://www.bilibili.com/v/game/mugen/',
            '游戏赛事': 'https://www.bilibili.com/v/game/match/'
          },
        },
        知识: {
          icon: 'technology',
          count: regionCount[36], link: `https://www.bilibili.com/v/technology/`, subRegions: {
            '科学科普': 'https://www.bilibili.com/v/technology/science/',
            '社科人文': 'https://www.bilibili.com/v/technology/fun/',
            '财经': 'https://www.bilibili.com/v/technology/finance/',
            '校园学习': 'https://www.bilibili.com/v/technology/campus/',
            '职业职场': 'https://www.bilibili.com/v/technology/career/',
            '野生技术协会': 'https://www.bilibili.com/v/technology/wild/',
          },
        },
        数码: {
          icon: 'digital', count: regionCount[188], link: `https://www.bilibili.com/v/digital/`, subRegions: {
            '手机平板': 'https://www.bilibili.com/v/digital/mobile/',
            '电脑装机': 'https://www.bilibili.com/v/digital/pc/',
            '摄影摄像': 'https://www.bilibili.com/v/digital/photography/',
            '影音智能': 'https://www.bilibili.com/v/digital/intelligence_av/'
          },
        },
        生活: {
          icon: 'life',
          count: regionCount[160], link: `https://www.bilibili.com/v/life/`, subRegions: {
            '搞笑': 'https://www.bilibili.com/v/life/funny/',
            '日常': 'https://www.bilibili.com/v/life/daily/',
            '动物圈': 'https://www.bilibili.com/v/life/animal/',
            '手工': 'https://www.bilibili.com/v/life/handmake/',
            '绘画': 'https://www.bilibili.com/v/life/painting/',
            '运动': 'https://www.bilibili.com/v/life/sports/',
            '汽车': 'https://www.bilibili.com/v/life/automobile/',
            '其他': 'https://www.bilibili.com/v/life/other/'
          },
        },
        美食: {
          icon: 'food',
          count: regionCount[211],
          link: 'https://www.bilibili.com/v/food/',
          subRegions: {
            美食制作: 'https://www.bilibili.com/v/food/make/',
            美食侦探: 'https://www.bilibili.com/v/food/detective/',
            美食测评: 'https://www.bilibili.com/v/food/measurement/',
            田园美食: 'https://www.bilibili.com/v/food/rural/',
            美食记录: 'https://www.bilibili.com/v/food/record/',
          },
        },
        鬼畜: {
          icon: 'kichiku',
          count: regionCount[119], link: `https://www.bilibili.com/v/kichiku/`, subRegions: {
            '鬼畜调教': 'https://www.bilibili.com/v/kichiku/guide/',
            '音MAD': 'https://www.bilibili.com/v/kichiku/mad/',
            '人力VOCALOID': 'https://www.bilibili.com/v/kichiku/manual_vocaloid/',
            '教程演示': 'https://www.bilibili.com/v/kichiku/course/'
          },
        },
        时尚: {
          icon: 'fashion', count: regionCount[155], link: `https://www.bilibili.com/v/fashion/`, subRegions: {
            '美妆': 'https://www.bilibili.com/v/fashion/makeup/',
            '服饰': 'https://www.bilibili.com/v/fashion/clothing/',
            '健身': 'https://www.bilibili.com/v/fashion/aerobics/',
            'T台': 'https://www.bilibili.com/v/fashion/catwalk/',
            '风尚标': 'https://www.bilibili.com/v/fashion/trends/'
          },
        },
        // 广告: { icon: 'ad', count: regionCount[165], link: `https://www.bilibili.com/v/ad/ad/`, },
        资讯: {
          icon: 'information',
          count: regionCount[202], link: `https://www.bilibili.com/v/information/`, subRegions: {
            '热点': 'https://www.bilibili.com/v/information/hotspot/',
            '环球': 'https://www.bilibili.com/v/information/global/',
            '社会': 'https://www.bilibili.com/v/information/social/',
            '综合': 'https://www.bilibili.com/v/information/multiple/'
          },
        },
        娱乐: {
          icon: 'ent',
          count: regionCount[5], link: `https://www.bilibili.com/v/ent/`, subRegions: {
            '综艺': 'https://www.bilibili.com/v/ent/variety/',
            '明星': 'https://www.bilibili.com/v/ent/star/',
          },
        },
        影视: {
          icon: 'cinephile',
          count: regionCount[181], link: `https://www.bilibili.com/v/cinephile/`, subRegions: {
            '影视杂谈': 'https://www.bilibili.com/v/cinephile/cinecism/',
            '影视剪辑': 'https://www.bilibili.com/v/cinephile/montage/',
            '短片': 'https://www.bilibili.com/v/cinephile/shortfilm/',
            '预告·资讯': 'https://www.bilibili.com/v/cinephile/trailer_info/',
          },
        },
        放映厅: {
          icon: 'cinema', count: regionCount[177] + regionCount[23] + regionCount[11], link: `https://www.bilibili.com/cinema/`, subRegions: {
            '纪录片': 'https://www.bilibili.com/documentary/',
            '电影': 'https://www.bilibili.com/movie/',
            '电视剧': 'https://www.bilibili.com/tv/'
          },
        },
        专栏: { icon: 'read', count: ``, link: `https://www.bilibili.com/read/home`, },
        直播: {
          icon: 'zhibo',
          count: ``, link: `https://live.bilibili.com`, subRegions: {
            '全部直播': 'https://live.bilibili.com/all?visit_id=5icxsa0kmts0',
            '游戏直播': 'https://live.bilibili.com/p/eden/area-tags?parentAreaId=2&areaId=0&visit_id=5icxsa0kmts0#/2/0',
            '手游直播': 'https://live.bilibili.com/p/eden/area-tags?parentAreaId=3&areaId=0&visit_id=5icxsa0kmts0#/3/0',
            '娱乐直播': 'https://live.bilibili.com/p/eden/area-tags?parentAreaId=1&areaId=0&visit_id=5icxsa0kmts0#/1/0',
            '电台直播': 'https://live.bilibili.com/p/eden/area-tags?parentAreaId=5&areaId=0&visit_id=5icxsa0kmts0#/5/0',
            '绘画直播': 'https://live.bilibili.com/p/eden/area-tags?parentAreaId=4&areaId=0&visit_id=5icxsa0kmts0#/4/0'
          },
        },
        小黑屋: { icon: 'blackroom', count: ``, link: `https://www.bilibili.com/blackroom/`, },
        课堂: { icon: 'zhishi', count: ``, link: `https://www.bilibili.com/cheese/`, },
        音乐PLUS: { icon: 'musicplus', count: ``, link: `https://www.bilibili.com/v/musicplus/`, },
        专题: { icon: 'topic', count: ``, link: `https://www.bilibili.com/blackboard/topic_list.html`, },
        活动: { icon: 'activit', count: ``, link: `https://www.bilibili.com/blackboard/x/act_list`, },
      }
    }
    this.initialPopup = async () => {
      new Vue({
        el: await SpinQuery.select('#custom-navbar-home-popup') as HTMLElement,
        data: {
          info: [],
          loading: true,
        },
        async mounted() {
          try {
            this.info = Object.entries(await getOnlineInfo())
          } finally {
            this.loading = false
          }
        },
      })
    }
  }
  get name(): keyof CustomNavbarOrders {
    return 'category'
  }
}
export default {
  export: {
    Category,
  },
}