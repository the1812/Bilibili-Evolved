import { NavbarComponent } from '../custom-navbar-component'
import { RawWatchlaterItem } from '../../../video/watchlater-api'
interface WatchlaterCard {
  aid: number
  href: string
  coverUrl: string
  durationText: string
  duration: number
  complete: boolean
  title: string
  upName: string
  upFaceUrl: string
  upID: number
}
export class WatchlaterList extends NavbarComponent {
  constructor() {
    super()
    this.boundingWidth = 380
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
              <dpi-img class="cover" :src="card.coverUrl" :size="{width: 130, height: 85}"></dpi-img>
              <div class="floating remove" title="移除" @click.prevent="remove(card.aid, index)"><i class="mdi mdi-close"></i></div>
              <div class="floating duration">{{card.durationText}}</div>
              <div class="floating viewed" v-if="card.complete">
                已观看
              </div>
            </a>
            <a class="title" target="_blank" :href="card.href" :title="card.title">{{card.title}}</a>
            <a class="up" target="_blank" :href="'https://space.bilibili.com/' + card.upID" :title="card.upName">
              <dpi-img class="face" :src="card.upFaceUrl" :size="20"></dpi-img>
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
  async init() {
    // console.log(await SpinQuery.select(`.custom-navbar [data-name="${this.name}"] .watchlater-list`))
    new Vue({
      el: await SpinQuery.select(`.custom-navbar [data-name="${this.name}"] .watchlater-list`) as HTMLElement,
      store,
      components: {
        DpiImg: () => import('../dpi-img.vue'),
      },
      data: {
        cards: [],
        filteredCards: [],
        search: '',
        lastRemovedAid: 0,
        // redirect: settings.watchLaterRedirect,
      },
      computed: {
        ...Vuex.mapState(['watchlaterList']),
        // filteredCards() {
        //   const search = this.search.toLowerCase()
        //   const cardsList = this.$el.querySelector('.cards') as HTMLElement
        //   cardsList.scrollTo(0, 0)
        //   return (this.cards as WatchlaterCard[]).filter(card => {
        //     return card.title.toLowerCase().includes(search) || card.upName.toLowerCase().includes(search)
        //   })
        // }
      },
      watch: {
        watchlaterList() {
          this.updateList()
        },
        search() {
          this.updateFilteredCards()
        },
      },
      methods: {
        ...Vuex.mapActions(['toggleWatchlater']),
        async updateList() {
          const { getWatchlaterList } = await import('../../../video/watchlater-api')
          const rawList = await getWatchlaterList(true)
          if (!rawList) {
            this.cards = []
            return
          }
          const getLink = (item: RawWatchlaterItem) => {
            if (settings.watchLaterRedirect) {
              return `https://www.bilibili.com/video/av${item.aid}`
            }
            if (item.bvid) {
              return `https://www.bilibili.com/watchlater/#/${item.bvid}`
            }
            return `https://www.bilibili.com/watchlater/#/av${item.aid}`
          }
          const cards = rawList.map(item => {
            const href = (() => {
              if (item.pages === undefined) {
                return getLink(item)
              }
              const pages = item.pages.map(it => it.cid)
              const page = item.cid === 0 ? 1 : pages.indexOf(item.cid) + 1
              return settings.watchLaterRedirect ?
                `${getLink(item)}?p=${page}` :
                `${getLink(item)}/p${page}`
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
            } as WatchlaterCard
          })
          this.cards = cards
          if (this.search) {
            this.updateFilteredCards()
          } else {
            this.filteredCards = cards
          }
        },
        async remove(aid: number, index: number) {
          this.cards.splice(index, 1)
          await this.toggleWatchlater(aid)
          this.lastRemovedAid = aid
        },
        async undo() {
          const aid = this.lastRemovedAid
          if (aid !== 0) {
            await this.toggleWatchlater(aid)
          }
        },
        updateFilteredCards: _.debounce(function () {
          const search = this.search.toLowerCase()
          const cardsList = this.$el.querySelector('.cards') as HTMLElement
          cardsList.scrollTo(0, 0)
          this.filteredCards = (this.cards as WatchlaterCard[]).filter(card => {
            return card.title.toLowerCase().includes(search) || card.upName.toLowerCase().includes(search)
          })
        }, 200),
      },
      async mounted() {
        try {
          await this.updateList()
        } finally {
          this.$el.classList.remove('loading')
        }
      },
    })
  }
  get name(): keyof CustomNavbarOrders {
    return 'watchlaterList'
  }
}

export default {
  export: {
    WatchlaterList,
  },
}