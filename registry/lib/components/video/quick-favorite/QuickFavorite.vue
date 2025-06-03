<template>
  <span
    class="quick-favorite be-quick-favorite video-toolbar-left-item"
    title="快速收藏"
    :class="{ on: isFavorite, ...displayModeClass }"
    @click.left.self="toggle()"
    @click.right.prevent.self="listShowing = !listShowing"
  >
    <i
      class="quick-favorite-icon icon"
      @click.left="toggle()"
      @click.right.prevent="listShowing = !listShowing"
    ></i>
    <div class="text" @click.left="toggle()" @click.right.prevent="listShowing = !listShowing">
      快速收藏
    </div>
    <div ref="selectList" class="select-list" :class="{ show: listShowing }">
      <div class="lists">
        选择快速收藏夹:
        <VDropdown
          v-model:value="selectedFavoriteList"
          :items="list"
          :key-mapper="it => (it as DisplayItem).id"
          @change="saveFavoriteList"
        />
      </div>
      <div class="lists-tip" :class="{ show: listShowing }">右键点击快速收藏可再次打开</div>
    </div>
    <div class="tip" :class="{ show: tipShowing }">{{ tipText }}</div>
  </span>
</template>
<script lang="ts">
import type { Ref } from 'vue'
import { defineComponent, ref } from 'vue'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import { getJsonWithCredentials, postTextWithCredentials } from '@/core/ajax'
import { Toast } from '@/core/toast'
import { getCsrf, getUID } from '@/core/utils'
import { logError } from '@/core/utils/log'
import { VDropdown } from '@/ui'
import { DisplayMode, type Options } from './options'

type DisplayItem = { displayName: string; id: number }
const { options } = getComponentSettings('quickFavorite')
interface RawFavoriteListItem {
  id: number
  title: string
  fav_state: number
}
interface FavoriteListItem {
  id: number
  displayName: string
}
const EmptyFavoriteList: FavoriteListItem = {
  id: 0,
  displayName: '<未选择>',
}

export default defineComponent({
  components: {
    VDropdown,
  },
  setup: () => ({
    selectList: ref(null) as Ref<HTMLDivElement | null>,
  }),
  data() {
    const { displayMode } = getComponentSettings<Options>('outerWatchlater').options
    return {
      aid: unsafeWindow.aid,
      isFavorite: false,
      tipText: '',
      tipShowing: false,
      tipHandle: 0,
      list: [] as DisplayItem[],
      selectedFavoriteList: EmptyFavoriteList,
      listShowing: false,
      displayMode,
    }
  },
  computed: {
    displayModeClass() {
      return {
        'icon-only': this.displayMode === DisplayMode.Icon,
        'icon-and-text': this.displayMode === DisplayMode.IconAndText,
      }
    },
  },
  watch: {
    async listShowing(value: boolean) {
      if (value) {
        document.addEventListener('click', e => {
          const el = this.$el as HTMLElement
          const target = e.target as HTMLElement
          if (target !== el && !el.contains(target)) {
            this.listShowing = false
          }
        })
        if (this.list.length === 0) {
          this.loadFavoriteList()
        }
      }
    },
  },
  created() {
    this.loadSavedList()
    addComponentListener('quickFavorite.displayMode', (value: DisplayMode) => {
      this.displayMode = value
    })
  },
  methods: {
    async loadFavoriteList() {
      try {
        const json = await getJsonWithCredentials(
          `https://api.bilibili.com/medialist/gateway/base/created?pn=1&ps=100&up_mid=${getUID()}&is_space=0`,
        )
        if (json.code !== 0) {
          throw new Error(`获取收藏夹列表失败: ${json.message}`)
        }
        const list: RawFavoriteListItem[] = lodash.get(json, 'data.list', [])
        this.list = list.map(it => ({ id: it.id, displayName: it.title }))
      } catch (error) {
        logError(error)
      }
    },
    async loadSavedList() {
      try {
        const json = await getJsonWithCredentials(
          `https://api.bilibili.com/x/v3/fav/folder/created/list-all?type=2&rid=${
            this.aid
          }&up_mid=${getUID()}`,
        )
        if (json.code !== 0) {
          throw new Error(`获取收藏状态失败: ${json.message}`)
        }

        const list: RawFavoriteListItem[] = lodash.get(json, 'data.list', [])
        const favoriteFolder = list.find(it => it.id === options.favoriteFolderID)
        if (favoriteFolder === undefined) {
          options.favoriteFolderID = 0
          return
        }
        this.isFavorite = Boolean(favoriteFolder.fav_state)
        this.selectedFavoriteList = {
          id: favoriteFolder.id,
          displayName: favoriteFolder.title,
        } as FavoriteListItem
      } catch (error) {
        logError(error)
      }
    },
    saveFavoriteList(list: FavoriteListItem) {
      options.favoriteFolderID = list.id
      this.syncFavoriteState()
    },
    async syncFavoriteState() {
      if (options.favoriteFolderID === 0 || !this.aid) {
        return
      }
      try {
        const json = await getJsonWithCredentials(
          `https://api.bilibili.com/x/v3/fav/folder/created/list-all?type=2&rid=${
            this.aid
          }&up_mid=${getUID()}`,
        )
        if (json.code !== 0) {
          throw new Error(`获取收藏状态失败: ${json.message}`)
        }
        const list: { id: number; title: string; fav_state: number }[] = lodash.get(
          json,
          'data.list',
          [],
        )
        const favoriteFolder = list.find(it => it.id === options.favoriteFolderID)
        if (favoriteFolder === undefined) {
          options.favoriteFolderID = 0
          return
        }
        this.isFavorite = Boolean(favoriteFolder.fav_state)
        this.selectedFavoriteList = {
          id: favoriteFolder.id,
          displayName: favoriteFolder.title,
        } as FavoriteListItem
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
      formData[this.isFavorite ? 'del_media_ids' : 'add_media_ids'] =
        options.favoriteFolderID.toString()
      try {
        await postTextWithCredentials(
          'https://api.bilibili.com/x/v3/fav/resource/deal',
          Object.entries(formData)
            .map(([k, v]) => `${k}=${v}`)
            .join('&'),
        )
        // favoriteButton.classList.toggle('on', this.isFavorite)
        this.isFavorite = !this.isFavorite
        this.showTip(
          this.isFavorite
            ? `已添加至收藏夹: ${this.selectedFavoriteList.displayName}`
            : `已移出收藏夹: ${this.selectedFavoriteList.displayName}`,
        )
        // await this.syncFavoriteState()
      } catch (error) {
        Toast.error(`快速收藏失败: ${error.message}`, '快速收藏')
        console.error(error)
      }
    },
  },
})
</script>
<style lang="scss" scoped>
@import 'common';
@import './font';

.quick-favorite {
  margin-right: 28px !important;
  position: relative;
  font-size: 14px;
  width: auto !important;
  .text {
    display: inline;
  }

  @mixin icon-only {
    margin-right: max(calc(min(11vw, 11vh) - 117.2px), 6px) !important;
    .text {
      display: none;
    }
  }
  &.icon-only {
    @include icon-only();
  }
  &:not(.icon-and-text) {
    @media screen and (max-width: 1340px), (max-height: 750px) {
      @include icon-only();
    }
  }

  &-icon {
    font-family: 'quick-favorite' !important;
    font-size: 28px;
    display: inline-block;
    font-style: normal;
    text-align: center;
    text-transform: none;
    line-height: 1;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    @media (min-width: 1681px) {
      font-size: 36px;
    }
    &:after {
      content: '\ea01';
    }
    .video-toolbar-v1 & {
      transform: translateY(1px);
    }
    .video-toolbar-left & {
      margin-right: 8px;
    }
  }
  .tip,
  .select-list {
    line-height: normal;
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: #000d;
    padding: 8px;
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
  .select-list {
    @include v-center(8px);
    > * {
      white-space: nowrap;
    }
    .lists-loading {
      padding: 4px 32px;
    }
    .lists {
      @include h-center(8px);
    }
    .lists-tip {
      color: #aaa;
      font-size: 12px;
    }
  }
}
</style>
