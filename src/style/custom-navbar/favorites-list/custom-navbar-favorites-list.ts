import { NavbarComponent } from '../custom-navbar-component'
import { VideoCardInfo } from '../../simplify-home/video-card-info'
interface ListInfo {
  id: number
  name: string
  count: number
}
interface FavoritesItemInfo extends VideoCardInfo {
  favoriteTimestamp: number
  favoriteTime: Date
}
const favoriteItemMapper = (item: any) => {
  return {
    id: item.id,
    aid: item.id,
    coverUrl: item.cover.replace('http:', 'https:'),
    favoriteTimestamp: item.fav_time * 1000,
    favoriteTime: new Date(item.fav_time * 1000),
    title: item.title,
    description: item.intro,
    duration: item.duration,
    durationText: formatDuration(item.duration),
    playCount: item.cnt_info.play,
    danmakuCount: item.cnt_info.danmaku,
    upName: item.upper.name,
    upFaceUrl: item.upper.face.replace('http:', 'https:'),
    upID: item.upper.mid,
  } as FavoritesItemInfo
}
export class FavoritesList extends NavbarComponent {
  constructor() {
    super()
    this.boundingWidth = 380
    this.noPadding = true
    this.href = `https://space.bilibili.com/${getUID()}/favlist`
    this.html = `收藏`
    this.active = document.URL.replace(/\?.*$/, "") === this.href
    this.popupHtml = /*html*/`
      <div class="favorites-list loading">
        <div class="loading-tip">
          加载中...
        </div>
        <div class="content">
          <div class="header">
            <v-dropdown class="list-select" @change="changeList()" :round="true" :items="listNames" :value.sync="selectedListName">
            </v-dropdown>
            <div class="play-all-container">
              <a class="play-all" :href="playLink" title="播放全部" target="_blank">
                <i class="mdi mdi-play"></i>
              </a>
            </div>
            <div class="search">
              <input type="text" placeholder="搜索" v-model="search">
            </div>
            <a class="more-info" :href="moreLink" title="查看更多" target="_blank">
              <i class="mdi mdi-dots-horizontal"></i>
            </a>
          </div>
          <transition-group name="cards" tag="div" class="cards">
            <div class="empty-tip" v-if="!cardsLoading && filteredCards.length === 0" key="empty-tip">
              空空如也哦 =￣ω￣=
            </div>
            <div class="favorite-card" v-for="card of filteredCards" :key="card.id">
              <a class="cover-container" target="_blank" :href="'https://www.bilibili.com/video/av' + card.aid">
                <dpi-img class="cover" :src="card.coverUrl" :size="{width: 130, height: 85}"></dpi-img>
                <div class="floating duration">{{card.durationText}}</div>
                <div class="floating favorite-time">{{card.favoriteTime | formatDate}}</div>
              </a>
              <a class="title" target="_blank" :href="'https://www.bilibili.com/video/av' + card.aid" :title="card.title">{{card.title}}</a>
              <a class="up" target="_blank" :href="'https://space.bilibili.com/' + card.upID" :title="card.upName">
                <dpi-img placeholder-image class="face" :src="card.upFaceUrl" :size="20"></dpi-img>
                <div class="name">{{card.upName}}</div>
              </a>
            </div>
            <div class="loading-tip" v-if="cardsLoading" key="loading-tip">
              加载中...
            </div>
          </transition-group>
        </div>
      </div>
    `
    this.initialPopup = () => this.init()
  }
  get name(): keyof CustomNavbarOrders {
    return 'favoritesList'
  }
  async init() {
    new Vue({
      el: await SpinQuery.select(`.custom-navbar [data-name="${this.name}"] .favorites-list`) as HTMLElement,
      store,
      filters: {
        formatDate(value: Date) {
          return `${value.getFullYear()}-${(value.getMonth() + 1).toString().padStart(2, '0')}-${(value.getDate()).toString().padStart(2, '0')}`
        }
      },
      components: {
        DpiImg: () => import('../../dpi-img.vue'),
        VDropdown: () => import('../../../video/download-video/v-dropdown.vue'),
      },
      data: {
        list: [],
        cards: [],
        filteredCards: [],
        selectedListName: '',
        cardsLoading: true,
        cardsPage: 1,
        search: '',
      },
      watch: {
        search(keyword: string) {
          if (keyword === '') {
            this.filteredCards = this.cards
            return
          }
          keyword = keyword.toLowerCase()
          this.filteredCards = (this.cards as FavoritesItemInfo[]).filter(it => {
            return it.title.toLowerCase().includes(keyword) || it.upName.toLowerCase().includes(keyword)
          })
          this.searchAllList()
        },
        selectedListName(name: string) {
          settings.favoritesListCurrentSelect = name
        },
      },
      computed: {
        listNames() {
          return this.list.map((item: ListInfo) => item.name)
        },
        selectedListId() {
          const item = (this.list as ListInfo[]).find(item => item.name === this.selectedListName)!
          return item ? item.id : 0
        },
        moreLink() {
          const id = this.selectedListId
          if (id === 0) {
            return `https://space.bilibili.com/${getUID()}/favlist`
          }
          return `https://space.bilibili.com/${getUID()}/favlist?fid=${id}`
        },
        playLink() {
          const id = this.selectedListId
          if (id === 0) {
            return undefined
          }
          return `https://www.bilibili.com/medialist/play/ml${id}`
        }
      },
      methods: {
        async getCards() {
          const url = `https://api.bilibili.com/medialist/gateway/base/spaceDetail?media_id=${this.selectedListId}&pn=${this.cardsPage}&ps=20`
          const json = await Ajax.getJsonWithCredentials(url)
          if (json.code !== 0) {
            throw new Error(`加载收藏夹内容失败: ${json.message}`)
          }
          if (!json.data.medias) { // 超过最后一页后返回空数组
            return []
          }
          return json.data.medias.filter((item: any) => {
            return item.attr !== 9 // 过滤掉已失效视频
          }).map(favoriteItemMapper)
        },
        async changeList() {
          try {
            this.search = ''
            this.cards = []
            this.cardsPage = 1
            this.cardsLoading = true
            this.cards = await this.getCards()
            this.filteredCards = this.cards
            this.setInfiniteScroll()
          } catch (error) {
            logError(error)
          } finally {
            this.cardsLoading = false
          }
        },
        async loadNextPage() {
          try {
            this.cardsLoading = true
            this.cardsPage++
            const cards = await this.getCards()
            this.cards.push(...cards)
            if (cards.length > 0) {
              this.setInfiniteScroll()
            }
          } catch (error) {
            logError(error)
          } finally {
            this.cardsLoading = false
          }
        },
        setInfiniteScroll() {
          const cardsContainer = this.$el.querySelector('.cards') as HTMLElement
          const scrollHandler = _.debounce(() => {
            if (this.search === '' && cardsContainer.scrollTop + cardsContainer.clientHeight >= cardsContainer.scrollHeight - 48) {
              cardsContainer.removeEventListener('scroll', scrollHandler)
              this.loadNextPage()
            }
          }, 200)
          cardsContainer.addEventListener('scroll', scrollHandler)
        },
        /** 搜索收藏夹里的视频 */
        searchAllList: _.debounce(async function () {
          if (this.search === '') {
            return
          }
          try {
            const jsonCurrent = await Ajax.getJsonWithCredentials(`https://api.bilibili.com/x/v3/fav/resource/list?media_id=${this.selectedListId}&pn=1&ps=20&keyword=${this.search}&order=mtime&type=0&tid=0`)
            const jsonAll = await Ajax.getJsonWithCredentials(`https://api.bilibili.com/x/v3/fav/resource/list?media_id=${this.selectedListId}&pn=1&ps=20&keyword=${this.search}&order=mtime&type=1&tid=0`)
            if (jsonCurrent.code !== 0 && jsonAll.code !== 0) {
              return
            }
            const currentItems = _.get(jsonCurrent, 'data.medias', []) || []
            const allItems = _.get(jsonAll, 'data.medias', []) || []
            const results = _.uniqBy(this.filteredCards.concat(currentItems.map(favoriteItemMapper), allItems.map(favoriteItemMapper)), (card: FavoritesItemInfo) => card.id)
            this.filteredCards = results
          } catch (error) {
            console.error(error)
            return
          }
        }, 200),
      },
      async mounted() {
        try {
          const url = `https://api.bilibili.com/medialist/gateway/base/created?pn=1&ps=100&up_mid=${getUID()}&is_space=0`
          const json = await Ajax.getJsonWithCredentials(url)
          if (json.code !== 0) {
            throw new Error(`获取收藏夹列表失败: ${json.message}`)
          }
          this.list = json.data.list.map((item: any) => {
            return {
              id: item.id,
              name: item.title,
              count: item.media_count
            } as ListInfo
          })
          if (this.list.length > 0) {
            if (settings.favoritesListCurrentSelect && this.list.some((item: ListInfo) => item.name === settings.favoritesListCurrentSelect)) {
              this.selectedListName = settings.favoritesListCurrentSelect
            } else {
              this.selectedListName = this.list[0].name
            }
            this.changeList()
          }
        } catch (error) {
          logError(error)
        } finally {
          this.$el.classList.remove('loading')
        }
      },
    })
  }
}
export default {
  export: {
    FavoritesList,
  }
}