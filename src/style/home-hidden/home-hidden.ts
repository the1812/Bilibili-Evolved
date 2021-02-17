type HomeHiddenOption = Readonly<{
  name: string
  displayName: string
  style?: string
}>
const isHome = () => {
  return !settings.simplifyHome && document.URL.includes('https://www.bilibili.com/')
}
const homeHiddenOptions: HomeHiddenOption[] = [
  {
    name: 'categories', displayName: '分区栏', style: `
      .bili-header-m>.bili-wrapper {
        visibility: hidden !important;
        height: 18px !important;
      }
      .primary-menu-itnl {
        visibility: hidden !important;
        height: 24px !important;
        padding: 0 !important;
      }
    `,
  },
  {
    name: 'trends', displayName: '活动/热门视频', style: `
      .first-screen #reportFirst1 { display: none !important; }
      .first-screen .space-between {
        margin-bottom: 0 !important;
      }
      .rcmd-box-wrap { display: none !important; }
    `,
  },
  {
    name: 'online', displayName: '在线列表', style: `
      .first-screen #reportFirst2 { display: none !important; }
    `,
  },
  {
    name: 'special', displayName: '特别推荐', style: `
      #bili_report_spe_rec { display: none !important; }
    `,
  },
  {
    name: 'contact', displayName: '联系方式', style: `
      .international-footer { display: none !important; }
    `,
  },
  {
    name: 'elevator', displayName: '右侧分区导航', style: `
      .storey-box .elevator { display: none !important; }
    `,
  },
  {
    name: "live",
    displayName: "直播"
  },
  {
    name: "douga",
    displayName: "动画"
  },
  {
    name: "anime",
    displayName: "番剧"
  },
  {
    name: "guochuang",
    displayName: "国创"
  },
  {
    name: "manga",
    displayName: "漫画"
  },
  {
    name: "music",
    displayName: "音乐"
  },
  {
    name: "dance",
    displayName: "舞蹈"
  },
  {
    name: "game",
    displayName: "游戏"
  },
  {
    name: "technology",
    displayName: "知识"
  },
  {
    name: "cheese",
    displayName: "课堂"
  },
  {
    name: "digital",
    displayName: "数码"
  },
  {
    name: "life",
    displayName: "生活"
  },
  {
    name: "food",
    displayName: "美食"
  },
  {
    name: 'animal',
    displayName: '动物圈',
  },
  {
    name: "kichiku",
    displayName: "鬼畜"
  },
  {
    name: "fashion",
    displayName: "时尚"
  },
  {
    name: "information",
    displayName: "资讯"
  },
  {
    name: "ent",
    displayName: "娱乐"
  },
  {
    name: "read",
    displayName: "专栏"
  },
  {
    name: "movie",
    displayName: "电影"
  },
  {
    name: "teleplay",
    displayName: "电视剧"
  },
  {
    name: "cinephile",
    displayName: "影视"
  },
  {
    name: "documentary",
    displayName: "纪录片"
  }
]
const syncState = (item: HomeHiddenOption) => {
  if (!settings.homeHiddenItems.includes(item.name)) {
    if (item.style) {
      dq(`#home-hidden-style-${item.name}`)?.remove()
    } else {
      document.body.classList.remove(`home-hidden-${item.name}`)
    }
  } else {
    if (item.style) {
      resources.applyImportantStyleFromText(item.style, `home-hidden-style-${item.name}`)
    } else {
      document.body.classList.add(`home-hidden-${item.name}`)
    }
  }
}
if (isHome()) {
  homeHiddenOptions.forEach(syncState)
  resources.applyImportantStyle('homeHiddenStyle')
}

export default {
  widget: {
    condition: isHome,
    content: /*html*/`
      <div class="gui-settings-flat-button" style="position: relative" id="home-hidden">
        <i class="mdi mdi-24px mdi-settings"></i>
        <span>首页过滤</span>
        <div class="home-hidden-settings popup">
          <div v-for="item in items" @click="toggle(item)" :key="item.name" class="home-hidden-settings-item" :class="{ 'home-hidden': hiddenItems.includes(item.name) }">
            <i class="mdi mdi-18px mdi-eye"></i>
            <i class="mdi mdi-18px mdi-eye-off"></i>
            {{ item.displayName }}
          </div>
        </div>
      </div>
    `,
    success: async () => {
      const homeHiddenButton = dq('#home-hidden') as HTMLElement
      new Vue({
        el: dq(homeHiddenButton, '.popup') as HTMLElement,
        data() {
          return {
            items: homeHiddenOptions,
            hiddenItems: [...settings.homeHiddenItems],
          }
        },
        watch: {
          hiddenItems(newValue: string[]) {
            settings.homeHiddenItems = [...newValue]
          }
        },
        mounted() {
          const popup = this.$el
          homeHiddenButton.addEventListener('click', e => {
            if (e.target === popup || popup.contains(e.target as HTMLElement)) {
              return
            }
            popup.classList.toggle('opened')
          })
        },
        methods: {
          async toggle(item: HomeHiddenOption) {
            const hidden = this.hiddenItems as string[]
            const index = hidden.indexOf(item.name)
            if (index !== -1) {
              hidden.splice(index, 1)
            } else {
              hidden.push(item.name)
            }
            await this.$nextTick()
            syncState(item)
          },
        }
      })
    },
  }
}
