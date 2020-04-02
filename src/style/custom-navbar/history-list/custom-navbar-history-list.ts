import { NavbarComponent } from '../custom-navbar-component'

interface HistoryItem {
  id: number
  title: string
  coverUrl: string
  upName: string
  upID: number
  href: string
}
interface TimeData {
  timestamp: number
  time: Date
  timeText: string
}
interface ProgressHistoryItem extends HistoryItem {
  progress: number
  progressText: string
  duration: number
  durationText: string
  isBangumi: boolean
}
interface TimelineItem {
  name: string
  items: HistoryItem[]
}
type Timeline = TimelineItem[]
interface HistoryTab {
  name: string
  type: string
  api: string
  moreLink: string
  getItems: (json: any) => HistoryItem[]
}
const getTimeData = () => {
  const now = new Date()
  const today = Number(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
  const oneDay = 24 * 3600000
  const yesterday = today - oneDay
  const lastWeek = today - 7 * oneDay
  return {
    now,
    today,
    oneDay,
    yesterday,
    lastWeek,
  }
}
const historyTimeGrouper = (historyItems: HistoryItem[]) => {
  if (historyItems.length === 0) {
    return []
  }
  if ('timestamp' in historyItems[0]) {
    const { today, yesterday, lastWeek } = getTimeData()
    const groups = _.groupBy(historyItems as (HistoryItem & TimeData)[], h => {
      if (h.timestamp >= today) {
        return '今天'
      }
      if (h.timestamp >= yesterday) {
        return '昨天'
      }
      if (h.timestamp >= lastWeek) {
        return '本周'
      }
      return '更早'
    })
    return Object.entries(groups).map(([key, value]) => {
      return {
        name: key,
        items: value,
      }
    })
  } else {
    return [
      {
        name: '最近观看',
        items: historyItems
      }
    ]
  }
}
const formatTime = (date: Date) => {
  const { yesterday } = getTimeData()
  const timestamp = Number(date)
  if (timestamp >= yesterday) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
const tabs: HistoryTab[] = [
  {
    name: '视频',
    type: 'video',
    api: 'https://api.bilibili.com/x/web-interface/history/cursor?type=archive&ps=30',
    moreLink: 'https://www.bilibili.com/account/history',
    getItems: json => {
      const list: any[] = json.data.list
      const historyItems = list.map(item => {
        const timestamp = item.view_at * 1000
        const isBangumi = Boolean(item.uri)
        const progressParam = item.progress > 0 ? `t=${item.progress}` : 't=0'
        const progress = item.progress === -1 ? 1 : item.progress / item.duration
        const historyItem = {
          isBangumi,
          id: item.kid,
          title: item.title,
          coverUrl: item.cover,
          upName: item.author_name || item.show_title,
          upID: item.author_mid || item.kid,
          href: isBangumi ? item.uri + `?${progressParam}` : `https://www.bilibili.com/video/av${item.kid}?p=${item.history.page}&${progressParam}`,
          duration: item.duration,
          durationText: formatDuration(item.duration),
          progress,
          progressText: fixed(progress * 100, 1) + '%',
          timestamp: timestamp,
          time: new Date(timestamp),
        } as ProgressHistoryItem & TimeData
        historyItem.timeText = formatTime(historyItem.time)
        return historyItem
      })
      return historyItems
    },
  },
  {
    name: '专栏',
    type: 'article',
    api: 'https://api.bilibili.com/x/web-interface/history/cursor?type=article&ps=30',
    moreLink: '',
    getItems: json => {
      const list: any[] = json.data.list
      const historyItems = list.map(item => {
        const timestamp = item.view_at * 1000
        const id = item.history.cid || item.kid
        const historyItem = {
          id,
          title: item.title,
          coverUrl: item.covers[0],
          upName: item.author_name,
          upID: item.author_mid,
          href: `https://www.bilibili.com/read/cv${id}`,
          timestamp: timestamp,
          time: new Date(timestamp),
        } as HistoryItem & TimeData
        historyItem.timeText = formatTime(historyItem.time)
        return historyItem
      })
      return historyItems
    },
  },
  {
    name: '直播',
    type: 'live',
    api: 'https://api.live.bilibili.com/xlive/web-ucenter/v1/history/get_history_by_uid',
    moreLink: 'https://link.bilibili.com/p/center/index#/user-center/view-history/live',
    getItems: json => {
      const list: any[] = json.data.list
      const historyItems = list.map(item => {
        return {
          id: item.roomid,
          href: `https://live.bilibili.com/${item.roomid}`,
          upID: item.uid,
          upName: item.uname,
          coverUrl: item.user_cover,
          title: item.title,
        } as HistoryItem
      })
      return historyItems
    }
  },
]
export class HistoryList extends NavbarComponent {
  constructor() {
    super()
    this.boundingWidth = 350
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
            <div class="search">
              <input type="text" placeholder="搜索" v-model="search">
            </div>
            <button class="more-info" :disabled="!selectedTab.moreLink || null" @click="viewMore()" title="查看更多">
              查看更多
              <i class="mdi mdi-dots-horizontal"></i>
            </button>
          </div>
          <transition-group name="history-content" tag="div" class="history-content">
            <div class="empty-tip" v-if="!timelineLoading && timeline.length === 0" key="empty-tip">
              空空如也哦 =￣ω￣=
            </div>
            <div class="loading-tip" v-if="timelineLoading" key="loading-tip">
              加载中...
            </div>
            <div class="time-group" v-for="t of filteredTimeline" :key="t.name">
              <div class="time-group-name">{{t.name}}</div>
              <transition-group name="time-group" tag="div" class="time-group-items">
                <div class="time-group-item" v-for="h of t.items" :key="h.id">
                  <a class="cover-container" target="_blank" :href="h.href">
                    <dpi-img class="cover" :src="h.coverUrl" :size="{width: 160, height: 110}" placeholder-image></dpi-img>
                    <div v-if="h.progress" class="progress" :style="{width: h.progress * 100 + '%'}"></div>
                    <div v-if="h.progressText" class="floating progress-number">{{h.progress >= 1 ? '已看完' : h.progressText}}</div>
                    <div v-if="h.durationText" class="floating duration">{{h.durationText}}</div>
                  </a>
                  <a class="title" target="_blank" :href="h.href" :title="h.title">
                    {{h.title || h.upName + '的直播间'}}
                  </a>
                  <a class="up" target="_blank" :href="h.isBangumi ? h.href : 'https://space.bilibili.com/' + h.upID" :title="h.upName">
                    <!--<icon type="extended" icon="up"></icon>-->
                    <div class="up-name">{{h.upName}}</div>
                  </a>
                  <div v-if="h.timeText" class="time" :title="h.time.toLocaleString()">
                    {{h.timeText}}
                  </div>
                </div>
              </transition-group>
            </div>
          </transition-group>
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
        Icon: () => import('../../icon.vue'),
      },
      data: {
        tabs,
        selectedTab: tabs[0],
        /** 全部的历史项目 */
        items: [],
        /** 按时间段分组后的历史项目 */
        timeline: [],
        timelineLoading: true,
        search: '',
      },
      computed: {
        /** 按时间段分组, 关键词过滤后的历史项目 */
        filteredTimeline(): Timeline {
          if (!this.search) {
            return this.timeline
          }
          const search: string = this.search.toLowerCase()
          return historyTimeGrouper((this.items as HistoryItem[]).filter(it => {
            return it.title.toLowerCase().includes(search) || it.upName.toLowerCase().includes(search)
          }))
        }
      },
      methods: {
        async updateTimeline() {
          try {
            this.timelineLoading = true
            this.timeline = []
            const tab = this.selectedTab as HistoryTab
            const json = await Ajax.getJsonWithCredentials(tab.api)
            if (json.code !== 0) {
              throw new Error(`加载历史记录失败: ${json.message}`)
            }
            this.items = tab.getItems(json)
            this.timeline = historyTimeGrouper(this.items)
          } catch (error) {
            logError(error)
          } finally {
            this.timelineLoading = false
          }
        },
        viewMore() {
          const tab = this.selectedTab as HistoryTab
          if (tab.moreLink) {
            open(tab.moreLink, '_blank')
          }
        }
      },
      watch: {
        selectedTab() {
          this.updateTimeline()
        }
      },
      async created() {
        this.updateTimeline()
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