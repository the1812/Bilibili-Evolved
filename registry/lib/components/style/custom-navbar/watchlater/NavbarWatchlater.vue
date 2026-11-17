<template>
  <div class="watchlater-list">
    <div class="header">
      <div class="watchlater-list-summary">共 {{ total }} 个</div>
      <div class="search">
        <TextBox v-model="search" linear placeholder="搜索"></TextBox>
      </div>
      <a
        class="operation"
        target="_blank"
        href="https://www.bilibili.com/medialist/play/watchlater"
      >
        <VButton class="round-button" title="播放全部" round>
          <VIcon icon="mdi-play" :size="18"></VIcon>
        </VButton>
      </a>
      <a class="operation" target="_blank" href="https://www.bilibili.com/watchlater/#/list">
        <VButton class="round-button" title="查看更多" round>
          <VIcon icon="mdi-dots-horizontal" :size="18"></VIcon>
        </VButton>
      </a>
    </div>
    <div ref="list" class="watchlater-list-content" @scroll.passive="onScroll">
      <VLoading v-if="loading && total === 0"></VLoading>
      <VEmpty v-else-if="!loading && !error && total === 0"></VEmpty>
      <div class="watchlater-list-viewport" :style="{ height: total * rowHeight + 'px' }">
        <div
          class="watchlater-list-window"
          :style="{ transform: `translateY(${startIndex * rowHeight}px)` }"
        >
          <div
            v-for="row of visibleRows"
            :key="row.index"
            class="watchlater-card"
            :class="{ 'watchlater-card-placeholder': !row.card }"
          >
            <template v-if="row.card">
              <a class="watchlater-cover-container" target="_blank" :href="row.card.href">
                <DpiImage
                  class="cover"
                  :lazy="false"
                  :src="row.card.coverUrl"
                  :size="{ width: 130, height: 85 }"
                ></DpiImage>
                <button
                  class="floating remove"
                  title="移除"
                  :disabled="removing"
                  @click.prevent="remove(row.card.aid)"
                >
                  <VIcon icon="mdi-close" :size="16"></VIcon>
                </button>
                <div class="floating duration">{{ row.card.durationText }}</div>
                <div v-if="row.card.totalPages > 1" class="floating pages">
                  {{ row.card.currentPage }}P / {{ row.card.totalPages }}P
                </div>
                <div
                  v-if="row.card.percent"
                  class="progress"
                  :style="{ width: row.card.percent * 100 + '%' }"
                />
              </a>
              <a class="title" target="_blank" :href="row.card.href" :title="row.card.title">{{
                row.card.title
              }}</a>
              <div class="info-row">
                <a
                  class="up"
                  target="_blank"
                  :href="'https://space.bilibili.com/' + row.card.upID"
                  :title="row.card.upName"
                >
                  <DpiImage
                    class="face"
                    :lazy="false"
                    :src="row.card.upFaceUrl"
                    :size="20"
                  ></DpiImage>
                  <div class="name">{{ row.card.upName }}</div>
                </a>
                <div v-if="row.card.complete" class="viewed">已观看</div>
              </div>
            </template>
            <template v-else>
              <div class="placeholder-cover"></div>
              <div class="placeholder-message">
                {{ pageStates[row.page] === 'error' ? '加载失败' : '加载中...' }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="list-controls">
      <VButton title="到顶部" :disabled="total === 0" @click="scrollToEdge(false)">
        <VIcon icon="mdi-arrow-up" :size="16"></VIcon>
        到顶部
      </VButton>
      <VButton v-if="error" @click="retry()">加载失败，重试</VButton>
      <VLoading v-else-if="loading && total > 0"></VLoading>
      <VButton title="到底部" :disabled="total === 0" @click="scrollToEdge(true)">
        <VIcon icon="mdi-arrow-down" :size="16"></VIcon>
        到底部
      </VButton>
    </div>
  </div>
</template>
<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { formatDuration } from '@/core/utils/formatters'
import { delay } from '@/core/utils'
import { sizeChange } from '@/core/observer'
import {
  getWatchlaterPage,
  watchlaterPageSize,
  RawWatchlaterItem,
  toggleWatchlater,
  watchlaterStatuses,
} from '@/components/video/watchlater'
import { VLoading, VEmpty, TextBox, VButton, VIcon, DpiImage } from '@/ui'
import { popperMixin } from '../mixins'

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
  currentPage?: number
  totalPages: number
  percent: number
}
export default Vue.extend({
  components: {
    VLoading,
    VEmpty,
    TextBox,
    VButton,
    VIcon,
    DpiImage,
  },
  mixins: [popperMixin],
  data() {
    const redirect = getComponentSettings('watchlaterRedirect')
    return {
      removing: false,
      pendingRemovals: new Map<number, number>(),
      refreshState: 'idle' as 'idle' | 'loading' | 'error',
      pages: {} as Record<number, WatchlaterCard[]>,
      pageStates: {} as Record<number, 'loading' | 'loaded' | 'error'>,
      total: 0,
      search: '',
      keyword: '',
      requestId: 0,
      searchTimer: 0,
      rowHeight: 97,
      windowPage: 0,
      viewportHeight: 0,
      resizeObserver: null as ResizeObserver | null,
      redirect: redirect.enabled && redirect.options.navbar,
    }
  },
  computed: {
    rowsPerViewport(): number {
      return Math.max(1, Math.ceil(this.viewportHeight / this.rowHeight))
    },
    startIndex(): number {
      return Math.min(this.total, Math.max(0, (this.windowPage - 1) * this.rowsPerViewport))
    },
    endIndex(): number {
      return Math.min(this.total, (this.windowPage + 3) * this.rowsPerViewport)
    },
    visibleRows(): { index: number; page: number; card?: WatchlaterCard }[] {
      return Array.from({ length: this.endIndex - this.startIndex }, (_, offset) => {
        const index = this.startIndex + offset
        const page = Math.floor(index / watchlaterPageSize) + 1
        return { index, page, card: this.pages[page]?.[index % watchlaterPageSize] }
      })
    },
    visiblePages(): number[] {
      if (this.total === 0) {
        return [1]
      }
      const first = Math.floor(this.startIndex / watchlaterPageSize) + 1
      const last = Math.ceil(
        Math.min(this.total, this.endIndex + this.rowsPerViewport) / watchlaterPageSize,
      )
      return Array.from({ length: last - first + 1 }, (_, index) => first + index)
    },
    loading(): boolean {
      return (
        this.refreshState === 'loading' ||
        this.visiblePages.some(page => this.pageStates[page] === 'loading')
      )
    },
    error(): boolean {
      return (
        this.refreshState === 'error' ||
        this.visiblePages.some(page => this.pageStates[page] === 'error')
      )
    },
  },
  watch: {
    search() {
      clearTimeout(this.searchTimer)
      this.requestId++
      this.searchTimer = window.setTimeout(() => this.updateList(), 250)
    },
  },
  created() {
    this.updateList()
  },
  mounted() {
    const list = this.$refs.list as HTMLElement
    const [observer] = sizeChange(list, () => {
      this.viewportHeight = list.clientHeight
      this.onScroll()
    })
    this.resizeObserver = observer
  },
  beforeDestroy() {
    clearTimeout(this.searchTimer)
    this.requestId++
    this.resizeObserver?.disconnect()
  },
  methods: {
    popupRefresh() {
      const list = this.$refs.list as HTMLElement
      // 浏览列表时再次悬停保留现场；回到顶部后才自动刷新。
      if (list.scrollTop === 0 && !this.loading) {
        this.refreshList()
      }
    },
    async refreshList() {
      if (this.refreshState === 'loading') {
        return
      }
      const { requestId } = this
      const preserveTotal = this.pendingRemovals.size > 0
      this.refreshState = 'loading'
      try {
        const { list, count } = await this.getPage(1)
        if (requestId !== this.requestId) {
          return
        }
        const cards = list.map(this.toCard)
        // 刷新成功后再替换数据。其他页先保留展示，访问时重新请求以校正分页偏移。
        this.requestId++
        this.$set(this.pages, 1, cards)
        this.pageStates = { 1: 'loaded' }
        if (!preserveTotal) {
          this.total = count
        }
        this.refreshState = 'idle'
        await this.$nextTick()
        this.onScroll()
      } catch {
        if (requestId === this.requestId) {
          this.refreshState = 'error'
        }
      }
    },
    retry() {
      return this.refreshState === 'error' ? this.refreshList() : this.loadVisiblePages(true)
    },
    updateList() {
      this.requestId++
      this.refreshState = 'idle'
      this.pages = {}
      this.pageStates = {}
      this.total = 0
      this.keyword = this.search.trim()
      this.windowPage = 0
      const list = this.$refs.list as HTMLElement
      if (list) {
        list.scrollTop = 0
      }
      return this.loadPage(1)
    },
    scrollToEdge(bottom: boolean) {
      const list = this.$refs.list as HTMLElement
      list.scrollTop = bottom ? list.scrollHeight : 0
      this.onScroll()
    },
    onScroll() {
      const list = this.$refs.list as HTMLElement
      // 按整屏切换窗口，前后一并保留缓冲，避免每滚过一行就挂载一张卡片。
      this.windowPage = Math.floor(list.scrollTop / (this.rowHeight * this.rowsPerViewport))
      this.loadVisiblePages()
    },
    loadVisiblePages(retry = false) {
      return Promise.all(this.visiblePages.map(page => this.loadPage(page, retry)))
    },
    async getPage(page: number) {
      const { requestId, keyword } = this
      const removedAids = new Set(this.pendingRemovals.keys())
      for (let attempt = 0; ; attempt++) {
        const result = await getWatchlaterPage({ page, keyword })
        const stale = result.list.some(
          item => removedAids.has(item.aid) && watchlaterStatuses[item.aid] !== true,
        )
        if (requestId !== this.requestId) {
          return result
        }
        if (!stale) {
          this.pendingRemovals.forEach((removedPage, aid) => {
            if (removedPage === page || watchlaterStatuses[aid] === true) {
              this.pendingRemovals.delete(aid)
            }
          })
          return result
        }
        // 删除成功后接口短暂返回旧快照；保留当前卡片，仅重试这一页。
        if (attempt === 2) {
          throw new Error('稍后再看列表尚未同步删除结果')
        }
        await delay(300)
        if (requestId !== this.requestId) {
          return result
        }
      }
    },
    async loadPage(page: number, retry = false) {
      const state = this.pageStates[page]
      if (
        state === 'loading' ||
        state === 'loaded' ||
        (state === 'error' && !retry) ||
        this.search.trim() !== this.keyword
      ) {
        return
      }
      const { requestId } = this
      this.$set(this.pageStates, page, 'loading')
      try {
        const { list, count } = await this.getPage(page)
        if (requestId !== this.requestId) {
          return
        }
        this.$set(this.pages, page, list.map(this.toCard))
        // 后续分页只补充卡片，避免旧 count 覆盖整体刷新或本地删除后的总数。
        if (page === 1 && this.total === 0) {
          this.total = count
        }
        this.$set(this.pageStates, page, 'loaded')
        await this.$nextTick()
        if (requestId === this.requestId) {
          this.onScroll()
        }
      } catch {
        if (requestId === this.requestId) {
          this.$set(this.pageStates, page, 'error')
        }
      }
    },
    toCard(item: RawWatchlaterItem): WatchlaterCard {
      const currentPage = item.pages?.find(p => p.cid === item.cid)
      const duration = currentPage?.duration ?? item.duration
      let href = this.redirect
        ? `https://www.bilibili.com/video/${item.bvid}/`
        : `https://www.bilibili.com/list/watchlater?bvid=${item.bvid}`
      if (this.redirect && currentPage?.page > 1) {
        href += `?p=${currentPage.page}`
      }
      const percent = Math.round((1000 * item.progress) / duration) / 1000

      return {
        aid: item.aid,
        href,
        coverUrl: item.pic.replace('http:', 'https:'),
        durationText: formatDuration(duration),
        duration,
        complete: item.progress < 0 || percent > 0.95, // 进度过95%算看完, -1值表示100%
        title: item.title,
        upName: item.owner.name,
        upFaceUrl: item.owner.face.replace('http:', 'https:'),
        upID: item.owner.mid,
        currentPage: currentPage?.page,
        totalPages: item.videos,
        percent,
      }
    },
    async remove(aid: number) {
      if (this.removing) {
        return
      }
      const { keyword } = this
      this.removing = true
      try {
        if (!(await toggleWatchlater(aid, false)) || keyword !== this.search.trim()) {
          return
        }
        const previousPages: Record<number, WatchlaterCard[]> = this.pages
        const sourcePage = Object.keys(previousPages).find(page =>
          previousPages[page].some(card => card.aid === aid),
        )
        if (!sourcePage) {
          return
        }
        this.pendingRemovals.set(aid, Number(sourcePage))
        const removedIndex =
          (Number(sourcePage) - 1) * watchlaterPageSize +
          previousPages[sourcePage].findIndex(card => card.aid === aid)
        const pages: Record<number, WatchlaterCard[]> = {}
        Object.entries(previousPages).forEach(([page, cards]) => {
          cards.forEach((card, offset) => {
            const index = (Number(page) - 1) * watchlaterPageSize + offset
            if (index === removedIndex) {
              return
            }
            const nextIndex = index > removedIndex ? index - 1 : index
            const nextPage = Math.floor(nextIndex / watchlaterPageSize) + 1
            pages[nextPage] ??= []
            pages[nextPage][nextIndex % watchlaterPageSize] = card
          })
        })
        // 删除会使后续分页前移。保留已知条目，未填满的位置由对应页补齐。
        this.requestId++
        this.refreshState = 'idle'
        this.pages = pages
        this.pageStates = {}
        this.total--
        await this.$nextTick()
        this.onScroll()
      } finally {
        this.removing = false
      }
    },
  },
})
</script>
<style lang="scss">
@import 'common';
@import '../popup';

.custom-navbar .watchlater-list {
  @include navbar-popup-height();
  width: 380px;
  font-size: 12px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  align-items: center;

  @mixin floating-button-background {
    background-color: #000c;
  }
  .round-button {
    @include round-bar(26);
    @include h-center();
    justify-content: center;
    cursor: pointer;
    width: 26px;
  }
  .floating {
    @include round-bar(20);
    @include h-center();
    @include floating-button-background();
    color: white;
    justify-content: center;
    cursor: pointer;
  }
  .header {
    @include h-center();
    justify-content: space-between;
    align-self: stretch;
    margin: 16px 12px;
    .watchlater-list-summary {
      margin-right: 6px;
    }
    .search {
      position: relative;
      flex-grow: 1;
      align-self: stretch;
      margin-right: 8px;
      .be-textbox {
        height: 100%;
      }
    }
    .operations {
      @include h-center();
      .round-button {
        &:not(:last-child) {
          margin-right: 4px;
        }
      }
    }
    .operation:not(:last-child) {
      margin-right: 8px;
    }
    .more-info {
      @include h-center();
      @include round-bar(28);
      padding: 4px 6px 4px 10px;
    }
  }
  .be-empty,
  .be-loading {
    flex: 1;
  }
  .list-controls {
    display: flex;
    align-items: center;
    align-self: stretch;
    justify-content: space-between;
    flex-shrink: 0;
    min-height: 36px;
    padding: 6px 12px 12px;
  }
  &-content {
    flex: 1;
    min-height: 0;
    align-self: stretch;
    overflow-anchor: none;
    position: relative;
    overflow-y: scroll;
    overflow-x: hidden;
    overscroll-behavior: contain;
    padding: 0 12px;
    padding-bottom: 12px;
    .watchlater-list-viewport,
    .watchlater-list-window {
      // 窗口位移和占位高度必须同步生效，不能套用全局过渡动画。
      transition: none;
    }
    .watchlater-list-viewport {
      position: relative;
    }
    .watchlater-list-window {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }
    .watchlater-card-placeholder {
      .placeholder-cover {
        grid-area: cover;
        background-color: #8882;
      }
      .placeholder-message {
        grid-area: title / title / info / info;
        align-self: center;
        justify-self: center;
        opacity: 0.6;
      }
    }
    .watchlater-card {
      box-sizing: border-box;
      margin-bottom: 12px;
      cursor: pointer;
      flex-shrink: 0;
      border-radius: 8px;
      color: black;
      background-color: #fff;
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
      border: 1px solid #8882;
      display: grid;
      grid-template:
        'cover title' 2fr
        'cover info' 1fr / 130px 1fr;
      height: 85px;
      body.dark & {
        background-color: var(--be-color-card-bg, #282828);
        color: var(--be-color-text-title, #eee);
      }
      &:hover .cover {
        transform: scale(1.05);
      }
      .watchlater-cover-container {
        grid-area: cover;
        overflow: hidden;
        border-radius: 8px 0 0 8px;
        position: relative;
        $padding: 6px;
        .floating {
          position: absolute;
          opacity: 0;
          font-size: 11px;
        }
        .remove {
          border: 0;
          padding: 0;
          &:disabled {
            cursor: wait;
          }
          top: $padding;
          left: $padding;
          width: 20px;
        }
        .duration {
          left: $padding;
          bottom: $padding;
          padding: 0 6px;
        }
        .pages {
          top: $padding;
          right: $padding;
          padding: 0 6px;
        }
        .cover {
          object-fit: cover;
        }
        .progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          border-radius: 1px;
          background-color: var(--theme-color);
        }
      }
      &:hover {
        .floating {
          opacity: 1;
        }
      }
      .title {
        grid-area: title;
        font-size: 13px;
        @include semi-bold();
        margin: 0;
        margin-top: 8px;
        padding: 0 10px;
        @include max-line(2);
        &:hover {
          color: var(--theme-color) !important;
        }
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        grid-area: info;
        margin: 6px 8px;
        .viewed {
          opacity: 0.75;
          font-size: 11px;
          margin: 2px 0;
        }
      }
      .up {
        flex: 0 1 auto;
        padding: 2px 10px 2px 2px;
        justify-self: start;
        align-self: center;
        max-width: calc(100% - 16px);
        @include h-center();
        @include round-bar(24);
        border: 1px solid #8882;
        &:hover {
          background-color: #8882;
        }
        .face {
          border-radius: 50%;
          margin-right: 6px;
          height: 20px;
          width: 20px;
        }
        .name {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 11px;
        }
        &:hover .name {
          color: var(--theme-color);
        }
      }
    }
  }
}
</style>
