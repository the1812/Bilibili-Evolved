(async () => {
  if (!document.URL.startsWith('https://www.bilibili.com/video/') || !getUID()) {
    return
  }
  await SpinQuery.condition(() => dq('.video-toolbar .ops .collect'), it => {
    return it !== null && (it as HTMLElement).innerText !== '--'
  })
  const favoriteButton = dq('.video-toolbar .ops .collect')
  if (!favoriteButton) {
    return
  }
  resources.applyStyle('quickFavoriteStyle')
  const html = /*html*/`
    <span @click.left.self="toggle()" @click.right.prevent.self="listShowing = !listShowing" class="quick-favorite" :class="{ on: isFavorite }">
      <i @click.left="toggle()" @click.right.prevent="listShowing = !listShowing"></i>
      <div style="display: inline" @click.left="toggle()" @click.right.prevent="listShowing = !listShowing">快速收藏</div>
      </template>
      <div class="select-list" ref="selectList" :class="{ show: listShowing }">
        选择快速收藏夹:
        <div v-if="lists.length > 0" class="lists">
          <v-dropdown :items="lists.map(it => it.title)" :value.sync="selectedFavorite"></v-dropdown>
        </div>
        <div class="lists-loading" v-else>加载中...</div>
      </div>
      <div class="lists-tip" :class="{ show: listShowing }">右键点击快速收藏可再次打开</div>
      <div class="tip" :class="{ show: tipShowing }">{{tipText}}</div>
    </span>
  `
  if (settings.outerWatchlater) {
    const watchlaterButton = await SpinQuery.select('.ops .watchlater')
    if (watchlaterButton !== null) {
      watchlaterButton.insertAdjacentHTML('beforebegin', html)
    } else {
      favoriteButton.insertAdjacentHTML('afterend', html)
    }
  } else {
    favoriteButton.insertAdjacentHTML('afterend', html)
  }
  const quickFavoriteButton = dq('.ops .quick-favorite')
  if (!quickFavoriteButton) {
    return
  }
  const vm = new Vue({
    el: quickFavoriteButton,
    store,
    components: {
      VDropdown: () => import('../download-video/v-dropdown.vue'),
    },
    data: {
      aid: unsafeWindow.aid,
      favoriteTitle: '',
      isFavorite: false,
      tipText: '',
      tipShowing: false,
      tipHandle: 0,
      lists: [],
      selectedFavorite: '',
      listShowing: false,
    },
    async created() {
      // Observer.attributes(favoriteButton, () => {
      //   this.syncFavoriteState()
      // })
      this.syncFavoriteState()
      // const container = dq('.v-wrap') as HTMLElement
      // Observer.childList(container, records => {
      //   records.forEach(r => {
      //     r.removedNodes.forEach(node => {
      //       if (node instanceof HTMLElement && node.querySelector('.collection-m')) {
      //         this.syncFavoriteState()
      //       }
      //     })
      //   })
      // })
    },
    watch: {
      selectedFavorite(value: string) {
        if (this.lists.length === 0) {
          return
        }
        const lists: { title: string, id: number }[] = this.lists
        const list = lists.find(it => it.title === value)
        if (list) {
          settings.quickFavoriteID = list.id
          this.syncFavoriteState()
        } else {
          console.error('list not found in selectedFavorite(value)')
        }
      },
      async listShowing(value: boolean) {
        if (value) {
          document.addEventListener('click', e => {
            const el = this.$el as HTMLElement
            const target = e.target as HTMLElement
            if (target !== el && !el.contains(target)) {
              this.listShowing = false
            }
          })
          if (this.lists.length === 0) {
            try {
              const json = await Ajax.getJsonWithCredentials(`https://api.bilibili.com/medialist/gateway/base/created?pn=1&ps=100&up_mid=${getUID()}&is_space=0`)
              if (json.code !== 0) {
                throw new Error(`获取收藏夹列表失败: ${json.message}`)
              }
              this.lists = _.get(json, 'data.list', [])
            } catch (error) {
              logError(error)
            }
          }
        }
      }
    },
    methods: {
      async syncFavoriteState() {
        if (settings.quickFavoriteID === 0) {
          return
        }
        try {
          const json = await Ajax.getJsonWithCredentials(`https://api.bilibili.com/x/v3/fav/folder/created/list-all?type=2&rid=${this.aid}&up_mid=${getUID()}`)
          if (json.code !== 0) {
            throw new Error(`获取收藏状态失败: ${json.message}`)
          }
          const list: { id: number, title: string, fav_state: number }[] = _.get(json, 'data.list', [])
          const quickList = list.find(it => it.id === settings.quickFavoriteID)
          if (quickList === undefined) {
            settings.quickFavoriteID = 0
            return
          }
          this.isFavorite = Boolean(quickList.fav_state)
          this.selectedFavorite = this.favoriteTitle = quickList.title
        } catch (error) {
          logError(error)
        }
      },
      showTip(text: string) {
        this.tipText = text
        this.tipShowing = true
        if (this.tipHandle) {
          clearTimeout(this.tipHandle)
        }
        this.tipHandle = setTimeout(() => {
          this.tipShowing = false
        }, 2000)
      },
      async toggle() {
        if (settings.quickFavoriteID === 0) {
          this.listShowing = true
          return
        }
        const formData = {
          rid: this.aid,
          type: 2,
          add_media_ids: '',
          del_media_ids: '',
          csrf: getCsrf(),
        }
        formData[this.isFavorite ? 'del_media_ids' : 'add_media_ids'] = settings.quickFavoriteID.toString()
        try {
          await Ajax.postTextWithCredentials(`https://api.bilibili.com/x/v3/fav/resource/deal`, Object.entries(formData).map(([k, v]) => `${k}=${v}`).join('&'))
          // favoriteButton.classList.toggle('on', this.isFavorite)
          this.isFavorite = !this.isFavorite
          this.showTip(this.isFavorite ? `已添加至收藏夹: ${this.favoriteTitle}` : `已移出收藏夹: ${this.favoriteTitle}`)
          // await this.syncFavoriteState()
        } catch (error) {
          Toast.error(`快速收藏失败: ${error.message}`, '快速收藏')
          console.error(error)
        }
      }
    }
  })
  Observer.videoChange(() => {
    vm.aid = unsafeWindow.aid
    vm.syncFavoriteState()
  })
})()
export default {
  unload: () => {
    dqa('.ops .quick-favorite').forEach((it: HTMLElement) => it.style.display = 'none')
  },
  reload: () => {
    dqa('.ops .quick-favorite').forEach((it: HTMLElement) => it.style.display = 'inline-block')
  },
}