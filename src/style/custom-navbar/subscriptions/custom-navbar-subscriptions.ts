import { NavbarComponent } from '../custom-navbar-component'
export class Subscriptions extends NavbarComponent {
  constructor() {
    super()
    this.boundingWidth = 380
    this.noPadding = true
    const uid = getUID()
    this.href = `https://space.bilibili.com/${uid}/bangumi`
    this.html = '订阅'
    this.active = [`https://space.bilibili.com/${uid}/bangumi`, `https://space.bilibili.com/${uid}/cinema`, `https://space.bilibili.com/${uid}/subs`].includes(document.URL.replace(/\?.*$/, ""))
    this.popupHtml = /*html*/`
    <div class="subscriptions">
      <ul class="subscriptions-tabs">
        <li class="tab" :class="{selected: bangumi}" @click="bangumi = true">追番</li>
        <li class="tab" :class="{selected: !bangumi}" @click="bangumi = false">追剧</li>
        <div class="tab-placeholder"></div>
        <a class="view-all" target="_blank" :href="'https://space.bilibili.com/${uid}/' + (bangumi ? 'bangumi' : 'cinema')">
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
  async init() {
    new Vue({
      el: await SpinQuery.select('.custom-navbar .subscriptions') as HTMLElement,
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
                    <div v-if="card.status" class="status" :class="'status-' + card.status">
                      {{card.statusText}}
                    </div>
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
          data() {
            return {
              loading: true,
              cards: [],
            }
          },
          async mounted() {
            try {
              const json = await Ajax.getJsonWithCredentials(`https://api.bilibili.com/x/space/bangumi/follow/list?type=${this.type !== 'bangumi' ? '2' : '1'}&pn=1&ps=16&vmid=${getUID()}`)
              if (json.code !== 0) {
                logError(`加载订阅信息失败: ${json.message}`)
                return
              }
              const getStatusText = (status: number) => {
                switch (status) {
                  case 1:
                    return '想看'
                  case 2:
                  default:
                    return '在看'
                  case 3:
                    return '看过'
                }
              }
              this.cards = (json.data.list as any[]).map((item) => {
                return {
                  title: item.title,
                  coverUrl: item.square_cover.replace('http:', 'https:'),
                  latest: item.new_ep.index_show,
                  progress: item.progress,
                  id: item.season_id,
                  status: item.follow_status,
                  statusText: getStatusText(item.follow_status),
                  playUrl: `https://www.bilibili.com/bangumi/play/ss${item.season_id}`,
                  mediaUrl: `https://www.bilibili.com/bangumi/media/md${item.media_id}`,
                }
              }).sort((a, b) => {
                let statusA = a.status
                if (statusA !== 3) {
                  statusA = 3 - statusA
                }
                let statusB = b.status
                if (statusB !== 3) {
                  statusB = 3 - statusB
                }
                return statusA - statusB
              })
            } finally {
              this.loading = false
            }
          },
        },
      },
    })
  }
  get name(): keyof CustomNavbarOrders {
    return 'bangumi'
  }
}
export default {
  export: {
    Subscriptions,
  },
}