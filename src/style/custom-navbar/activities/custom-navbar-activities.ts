import { NavbarComponent } from '../custom-navbar-component'
let componentUpdate = async () => { }
let tabUpdate = async () => { }
let latestID: string
interface ActivityTabComponentConfig {
  dataObject: {}
  apiUrl: string
  name: string
  handleJson: (json: any) => void
  template: string
}
interface ActivityTab {
  name: string
  moreUrl: string
}
const getActivityTabComponent = ({ dataObject, apiUrl, name, handleJson, template }: ActivityTabComponentConfig) => {
  return {
    template,
    components: {
      'dpi-img': () => import('../dpi-img.vue'),
    },
    methods: {
      handleJson,
      async fetchData(silent = false) {
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
    data() {
      return Object.assign({
        loading: true,
      }, dataObject)
    },
    mounted() {
      this.fetchData()
      componentUpdate = async () => await this.fetchData(true)
    },
    destroyed() {
      componentUpdate = async () => { }
    },
  }
}
export class Activities extends NavbarComponent {
  constructor() {
    super()
    this.noPadding = true
    this.href = settings.oldTweets ? 'https://www.bilibili.com/account/dynamic' : 'https://t.bilibili.com/'
    this.html = '动态'
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
    this.active = document.URL.replace(/\?.*$/, '') === this.href
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
  static get updateInterval() {
    return 5 * 60 * 1000 // 每5分钟更新1次动态提醒数字
  }
  static getLatestID() {
    return document.cookie.replace(new RegExp(`(?:(?:^|.*;\\s*)bp_t_offset_${getUID()}\\s*\\=\\s*([^;]*).*$)|^.*$`), '$1')
  }
  static setLatestID(id: string) {
    const currentID = Activities.getLatestID()
    if (Activities.compareID(id, currentID) < 0) {
      return
    }
    document.cookie = `bp_t_offset_${getUID()}=${id};path=/;domain=.bilibili.com;max-age=${60 * 60 * 24 * 30}`
  }
  static compareID(a: string, b: string) {
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
  static isNewID(id: string) {
    return Activities.compareID(id, latestID) > 0
  }
  static updateLatestID(cards: { id: string }[]) {
    const [id] = [...cards.map(c => c.id)].sort(Activities.compareID).reverse()
    Activities.setLatestID(id)
  }
  async getNotifyCount() {
    const api = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_num?rsp_type=1&uid=${getUID()}&update_num_dy_id=${Activities.getLatestID()}&type_list=8,64,512`
    const json = await Ajax.getJsonWithCredentials(api)
    if (json.code !== 0) {
      return
    }
    this.setNotifyCount(json.data.update_num)
  }
  async init() {
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
    new Vue({
      el: await SpinQuery.select('.activity-popup') as HTMLElement,
      data: {
        tabs: [
          {
            name: '视频',
            component: 'video-activity',
            moreUrl: 'https://t.bilibili.com/?tab=8',
            get notifyApi() {
              return `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_num?rsp_type=1&uid=${getUID()}&update_num_dy_id=${Activities.getLatestID()}&type_list=8`
            },
            notifyCount: null,
          },
          {
            name: '番剧',
            component: 'bangumi-activity',
            moreUrl: 'https://t.bilibili.com/?tab=512',
            get notifyApi() {
              return `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_num?rsp_type=1&uid=${getUID()}&update_num_dy_id=${Activities.getLatestID()}&type_list=512`
            },
            notifyCount: null,
          },
          {
            name: '专栏',
            component: 'column-activity',
            moreUrl: 'https://t.bilibili.com/?tab=64',
            get notifyApi() {
              return `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_num?rsp_type=1&uid=${getUID()}&update_num_dy_id=${Activities.getLatestID()}&type_list=64`
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
            changeTab(item: ActivityTab) {
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
          apiUrl: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${getUID()}&type_list=8`,
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
            const cards = json.data.cards.map((card: any) => {
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
                get new() { return Activities.isNewID(this.id) },
              }
            }) as []
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
              data() {
                return {
                  // watchlater: this.watchlaterInit,
                }
              },
              computed: {
                ...Vuex.mapState(['watchlaterList']),
                watchlater() {
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
              async mounted() {
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
          apiUrl: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${getUID()}&type_list=512`,
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
            this.cards = json.data.cards.map((card: any) => {
              const cardJson = JSON.parse(card.card)
              return {
                title: cardJson.apiSeasonInfo.title,
                coverUrl: cardJson.apiSeasonInfo.cover,
                epCoverUrl: cardJson.cover,
                epTitle: cardJson.new_desc,
                url: cardJson.url,
                id: card.desc.dynamic_id_str,
                get new() { return Activities.isNewID(this.id) },
              }
            })
            Activities.updateLatestID(this.cards)
          },
        }),
        'column-activity': getActivityTabComponent({
          dataObject: { cards: [] },
          apiUrl: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${getUID()}&type_list=64`,
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
            this.cards = json.data.cards.map((card: any) => {
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
                get new() { return Activities.isNewID(this.id) },
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
            this.cards = json.data.list.map((card: any) => {
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
        content() {
          return this.tabs.find((tab: ActivityTab) => tab.name === this.selectedTab).component
        },
        viewMoreUrl() {
          return this.tabs.find((tab: ActivityTab) => tab.name === this.selectedTab).moreUrl
        },
      },
      mounted() {
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
      destroyed() {
        tabUpdate = async () => { }
      },
      watch: {
        selectedTab(name) {
          this.tabs.find((t: ActivityTab) => t.name === name).notifyCount = null
        }
      },
    })
  }
  get name(): keyof CustomNavbarOrders {
    return 'activities'
  }
}
latestID = Activities.getLatestID()
export default {
  export: {
    Activities,
  },
}