<template>
  <span
    class="quick-favorite"
    title="快速收藏"
    :class="{ on: isFavorite }"
    @click.left.self="toggle()"
    @click.right.prevent.self="listShowing = !listShowing"
  >
    <VIcon
      icon="favorites"
      :size="28"
      @click.left="toggle()"
      @click.right.prevent="listShowing = !listShowing"
    ></VIcon>
    <div
      style="display: inline"
      @click.left="toggle()"
      @click.right.prevent="listShowing = !listShowing"
    >
      快速收藏
    </div>
    <div ref="selectList" class="select-list" :class="{ show: listShowing }">
      选择快速收藏夹:
      <div class="lists">
        <VDropdown
          v-model="selectedFavorite"
          :items="lists.map(it => it.title)"
        ></VDropdown>
      </div>
    </div>
    <div class="lists-tip" :class="{ show: listShowing }">
      右键点击快速收藏可再次打开
    </div>
    <div class="tip" :class="{ show: tipShowing }">{{ tipText }}</div>
  </span>
</template>
<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { getJsonWithCredentials, postTextWithCredentials } from '@/core/ajax'
import { getUID, getCsrf } from '@/core/utils'
import { logError } from '@/core/utils/log'
import { Toast } from '@/core/toast'

const { options } = getComponentSettings('quickFavorite')
export default Vue.extend({
  components: {
    VIcon: () => import('@/ui/icon/VIcon.vue').then(m => m.default),
    VDropdown: () => import('@/ui/VDropdown.vue').then(m => m.default),
  },
  data() {
    return {
      aid: unsafeWindow.aid,
      favoriteTitle: '',
      isFavorite: false,
      tipText: '',
      tipShowing: false,
      tipHandle: 0,
      lists: [],
      selectedFavorite: '<未选择>',
      listShowing: false,
    }
  },
  watch: {
    selectedFavorite(value: string) {
      if (this.lists.length === 0) {
        return
      }
      const { lists } = this as {
        lists: { title: string, id: number }[]
      }
      const list = lists.find(it => it.title === value)
      if (list) {
        options.favoriteFolderID = list.id
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
            const json = await getJsonWithCredentials(`https://api.bilibili.com/medialist/gateway/base/created?pn=1&ps=100&up_mid=${getUID()}&is_space=0`)
            if (json.code !== 0) {
              throw new Error(`获取收藏夹列表失败: ${json.message}`)
            }
            this.lists = lodash.get(json, 'data.list', [])
          } catch (error) {
            logError(error)
          }
        }
      }
    },
  },
  created() {
    this.syncFavoriteState()
  },
  methods: {
    async syncFavoriteState() {
      if (options.favoriteFolderID === 0) {
        return
      }
      try {
        const json = await getJsonWithCredentials(`https://api.bilibili.com/x/v3/fav/folder/created/list-all?type=2&rid=${this.aid}&up_mid=${getUID()}`)
        if (json.code !== 0) {
          throw new Error(`获取收藏状态失败: ${json.message}`)
        }
        const list: { id: number, title: string, fav_state: number }[] = lodash.get(json, 'data.list', [])
        const quickList = list.find(it => it.id === options.favoriteFolderID)
        if (quickList === undefined) {
          options.favoriteFolderID = 0
          return
        }
        this.isFavorite = Boolean(quickList.fav_state)
        this.favoriteTitle = quickList.title
        this.selectedFavorite = quickList.title
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
      if (options.favoriteFolderID === 0) {
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
      formData[this.isFavorite ? 'del_media_ids' : 'add_media_ids'] = options.favoriteFolderID.toString()
      try {
        await postTextWithCredentials('https://api.bilibili.com/x/v3/fav/resource/deal', Object.entries(formData).map(([k, v]) => `${k}=${v}`).join('&'))
        // favoriteButton.classList.toggle('on', this.isFavorite)
        this.isFavorite = !this.isFavorite
        this.showTip(this.isFavorite ? `已添加至收藏夹: ${this.favoriteTitle}` : `已移出收藏夹: ${this.favoriteTitle}`)
        // await this.syncFavoriteState()
      } catch (error) {
        Toast.error(`快速收藏失败: ${error.message}`, '快速收藏')
        console.error(error)
      }
    },
  },
})
</script>
<style lang="scss">
.video-toolbar .ops {
  .quick-favorite {
    margin-right: 28px !important;
    position: relative;
    font-size: 0;
    > :not(.be-icon) {
      font-size: 14px;
    }
    .be-icon {
      display: inline-block;
    }
    .tip,
    .select-list,
    .lists-tip {
      line-height: normal;
      position: absolute;
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      background: #000d;
      padding: 4px 8px;
      border-radius: 4px;
      color: #eee;
      transition: all 0.2s ease-out;
      opacity: 0;
      pointer-events: none;
      &.show {
        opacity: 1;
        pointer-events: initial;
      }
    }
    .tip {
      padding: 8px;
    }
    .lists-tip {
      top: calc(100% + 8px + 42px);
      color: #ccc;
      font-size: 12px;
      z-index: 100;
    }
    .select-list {
      display: flex;
      align-items: center;
      > * {
        white-space: nowrap;
      }
      .lists-loading {
        padding: 4px 32px;
      }
      .lists {
        margin-left: 8px;
      }
      // .v-dropdown {
      //   color: black;
      //   body.dark & {
      //     color: #eee;
      //   }
      //   .mdi-chevron-down {
      //     color: inherit !important;
      //     margin: 0 !important;
      //     transition: 0.2s ease-out;
      //     display: flex;
      //     align-items: center;
      //     justify-content: center;
      //     font-size: 16pt !important;
      //   }
      // }
    }
  }
}
</style>
