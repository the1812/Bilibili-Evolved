import { NavbarComponent } from '../custom-navbar-component'

interface HistoryTab {
  name: string
  componentName: string
  moreLink: string
}
const tabs = [
  {
    name: '视频',
    componentName: 'VideoHistory',
    moreLink: 'https://www.bilibili.com/account/history',
  },
  {
    name: '专栏',
    componentName: 'ArticleHistory',
    moreLink: '',
  },
  {
    name: '直播',
    componentName: 'LiveHistory',
    moreLink: 'https://link.bilibili.com/p/center/index#/user-center/view-history/live'
  },
] as HistoryTab[]
export class HistoryList extends NavbarComponent {
  constructor() {
    super()
    this.noPadding = true
    this.href = `https://www.bilibili.com/account/history`
    this.html = `历史`
    this.active = document.URL.replace(/\?.*$/, "") === this.href
    this.popupHtml = /*html*/`
      <div class="history-list loading">
        <div class="loading-tip">
          加载中...
        </div>
        <div class="content">
          <div class="header">
            <div class="tabs">
              <div class="tab" v-for="tab of tabs" :class="{active: selectedTab === tab}" @click="selectedTab = tab">
                <div class="tab-name">{{tab.name}}</div>
              </div>
            </div>
            <a class="more-info" :href="selectedTab.moreLink || null" title="查看更多" target="_blank">
              查看更多
              <i class="mdi mdi-dots-horizontal"></i>
            </a>
          </div>
          <transition name="history-content" mode="out-in">
            <component class="history-content" :is="selectedTab.componentName"></component>
          </transition>
        </div>
      </div>
    `
    this.initialPopup = () => this.init()
  }
  get name(): keyof CustomNavbarOrders {
    return 'historyList'
  }
  async init() {
    new Vue({
      el: await SpinQuery.select(`.custom-navbar [data-name="${this.name}"] .history-list`) as HTMLElement,
      store,
      components: {
        DpiImg: () => import('../../dpi-img.vue'),
        VideoHistory: () => import('./custom-navbar-video-history.vue'),
        ArticleHistory: () => import('./custom-navbar-article-history.vue'),
        LiveHistory: () => import('./custom-navbar-live-history.vue'),
      },
      data: {
        tabs,
        selectedTab: tabs[0],

      },
      async mounted() {
        this.$el.classList.remove('loading')
      },
    })
  }
}

export default {
  export: {
    HistoryList,
  },
}