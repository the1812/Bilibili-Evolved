<template>
  <ModalShell :visible="visible" title="合并弹幕" @close="onClose">
    <div
      class="dm-merger-body dm-merger-search-body"
      style="display: flex; flex-direction: column; overflow: hidden; padding: 0; height: 600px"
    >
      <div
        class="dm-merger-input-group"
        style="
          padding: 15px;
          flex-shrink: 0;
          border-bottom: 1px solid var(--line_light, #eee);
          display: flex;
          align-items: center;
          gap: 10px;
        "
      >
        <input
          id="dm-search-input"
          ref="searchInput"
          v-model="searchInput"
          type="text"
          placeholder="输入链接 (BV...) 或关键词搜索..."
          style="flex: 1; height: 36px; padding: 0 12px"
          @keypress.enter="onSearch"
        />
        <button
          id="dm-search-btn"
          style="height: 36px; flex-shrink: 0"
          :disabled="loading"
          @click="onSearch"
        >
          搜索
        </button>

        <div
          id="dm-local-sort"
          style="display: flex; align-items: center; gap: 10px; flex-shrink: 0; margin-left: 10px"
        >
          <span style="font-size: 12px; color: var(--text3, #999); font-weight: 500">排序：</span>
          <div style="display: flex; gap: 6px">
            <span
              v-for="opt in sortOptions"
              :key="opt.value"
              :data-sort="opt.value"
              :style="sortChipStyle(opt.value)"
              @click="onSortChange(opt.value)"
            >
              {{ opt.label }}
            </span>
          </div>
        </div>
      </div>

      <div
        id="dm-search-results"
        ref="resultsContainer"
        style="flex: 1; overflow-y: auto; padding: 10px 15px"
        @scroll="onResultsScroll"
      >
        <div
          v-if="loading && !results.length"
          style="text-align: center; color: var(--text3, #999); margin-top: 20px"
        >
          搜索/获取中...
        </div>

        <div v-else-if="errorMessage" style="text-align: center; color: #f25d8e; margin-top: 20px">
          搜索出错: {{ errorMessage }}
        </div>

        <div
          v-else-if="!loading && searched && !displayResults.length"
          style="text-align: center; color: var(--text3, #999); margin-top: 20px"
        >
          未找到相关视频
        </div>

        <template v-else>
          <VideoResultCard
            v-for="video in displayResults"
            :key="video.bvid"
            :video="video"
            :checked="isBvidSelected(video.bvid)"
            :expanded="isBvidExpanded(video.bvid)"
            :details-loading="isDetailsLoading(video.bvid)"
            :merged="isBvidMerged(video.bvid)"
            :merged-count="mergedCountOf(video.bvid)"
            @toggle-select="onToggleBvidSelect(video)"
            @open-video="onOpenVideo(video.bvid)"
            @toggle-expand="onToggleExpand(video.bvid)"
          >
            <template #details>
              <PagePartList
                v-if="expandedPages[video.bvid]"
                :pages="expandedPages[video.bvid]"
                :video-meta="videoMetaFor(video)"
                :show-part-mode="expandedPages[video.bvid].length > 1"
                :part-mode-enabled="partModeState[video.bvid] || false"
                :total-duration="partDurationFields[video.bvid]?.total || ''"
                :uniform-part-duration="partDurationFields[video.bvid]?.uniform || ''"
                @update:partModeEnabled="onPartModeToggle(video.bvid, $event)"
                @update:pageSelection="onPageSelectionChange(video.bvid, $event)"
                @update:offset="onPageOffsetChange(video.bvid, $event)"
                @calc-offsets="onCalcOffsets(video.bvid)"
                @select-all-pages="onSelectAllPages(video.bvid, $event)"
                @part-duration-change="onPartDurationChange(video.bvid, $event)"
              />
            </template>
          </VideoResultCard>

          <div
            v-if="loadingMore"
            class="dm-load-more"
            style="text-align: center; padding: 15px; color: var(--text3, #999)"
          >
            加载更多...
          </div>
        </template>
      </div>

      <div id="dm-search-actions" :style="actionsPanelStyle">
        <div class="dm-selected-bar">
          <div class="dm-selected-bar-head">
            <div class="dm-selected-summary">
              已选
              <span id="dm-search-count" class="dm-selected-count">{{ selectedCount }}</span>
              项
              <span v-if="hasSelection" class="dm-selected-hint">可继续搜索追加</span>
            </div>
            <div class="dm-selected-actions">
              <button
                v-if="hasSelection"
                id="dm-search-clear-selected"
                type="button"
                class="dm-selected-secondary-btn"
                @click="onClearSelected"
              >
                清空已选
              </button>
              <button
                id="dm-search-select-all"
                type="button"
                class="dm-selected-secondary-btn"
                :disabled="!displayResults.length"
                @click="onSelectAll"
              >
                {{ selectAllLabel }}
              </button>
              <button
                id="dm-search-batch-btn"
                type="button"
                :style="batchBtnStyle"
                @click="onBatchMerge"
              >
                合并选中
              </button>
            </div>
          </div>

          <div v-if="selectedVideoCards.length" class="dm-selected-chips">
            <div
              v-for="video in selectedVideoCards"
              :key="video.bvid"
              class="dm-selected-chip"
              :title="plainTitle(video)"
            >
              <img
                class="dm-selected-chip-cover"
                :src="coverUrl(video)"
                alt=""
                referrerpolicy="no-referrer"
              />
              <div class="dm-selected-chip-meta">
                <div class="dm-selected-chip-title">{{ plainTitle(video) }}</div>
                <div class="dm-selected-chip-sub">
                  <span v-if="video.author">UP: {{ video.author }}</span>
                  <span v-if="video.author && selectedDanmakuLabel(video)"> · </span>
                  <span v-if="selectedDanmakuLabel(video)">{{ selectedDanmakuLabel(video) }}</span>
                  <span
                    v-if="(video.author || selectedDanmakuLabel(video)) && selectedPartLabel(video.bvid)"
                  >
                    ·
                  </span>
                  <span v-if="selectedPartLabel(video.bvid)">{{ selectedPartLabel(video.bvid) }}</span>
                  <span v-if="isBvidMerged(video.bvid)" class="dm-selected-chip-merged">已合并</span>
                </div>
              </div>
              <button
                type="button"
                class="dm-selected-chip-remove"
                title="取消选择"
                @click.stop="onRemoveSelected(video.bvid)"
              >
                ×
              </button>
            </div>
          </div>
          <div v-else-if="hasSelection" class="dm-selected-empty-hint">
            已选内容来自分 P 勾选，可继续搜索追加更多视频
          </div>
        </div>
      </div>
    </div>
  </ModalShell>
</template>

<script lang="ts">
import ModalShell from './shared/ModalShell.vue'
import VideoResultCard from './shared/VideoResultCard.vue'
import PagePartList from './shared/PagePartList.vue'
import { normalizeHttpsUrl } from './shared/media-url'
import {
  MERGER_MODAL_EVENTS,
  type MergerBatchMergeItem,
  type MergerOffsetType,
  type MergerPagePart,
  type MergerSearchVideo,
} from './contracts'

type SortMode = 'default' | 'play' | 'danmaku'

interface PartDurationFields {
  total: string
  uniform: string
}

function stripHtmlTags(title: string): string {
  return title.replace(/<[^>]+>/g, '')
}

export default Vue.extend({
  name: 'MergerModal',
  components: {
    ModalShell,
    VideoResultCard,
    PagePartList,
  },
  // 根实例挂载，外部状态由 vue-host 写入 $data（非 props）
  data() {
    return {
      visible: false,
      keyword: '',
      loading: false,
      loadingMore: false,
      results: [] as MergerSearchVideo[],
      selectedBvids: [] as string[],
      /** 跨搜索保留的已选视频摘要（由 vue-host 同步） */
      selectedVideos: [] as MergerSearchVideo[],
      /** 已合并源 BV 列表（由 vue-host 同步） */
      mergedBvids: [] as string[],
      /** 各 BV 已合并源条数 */
      mergedCountByBvid: {} as Record<string, number>,
      expandedBvids: {} as Record<string, boolean>,
      expandedPages: {} as Record<string, MergerPagePart[]>,
      sortMode: 'default' as SortMode,
      errorMessage: '',
      hasMore: true,
      searchInput: '',
      localSortMode: 'default' as SortMode,
      displayResults: [] as MergerSearchVideo[],
      sortingGuard: false,
      scrollDebounceTimer: null as ReturnType<typeof setTimeout> | null,
      searched: false,
      loadMorePage: 1,
      partModeState: {} as Record<string, boolean>,
      partDurationFields: {} as Record<string, PartDurationFields>,
    }
  },
  computed: {
    sortOptions(): Array<{ value: SortMode; label: string }> {
      return [
        { value: 'default', label: '默认' },
        { value: 'play', label: '播放量' },
        { value: 'danmaku', label: '弹幕量' },
      ]
    },
    showActions(): boolean {
      return (
        this.displayResults.length > 0 ||
        this.hasExpandedPageLists ||
        this.selectedBvids.length > 0 ||
        this.selectedVideos.length > 0
      )
    },
    hasExpandedPageLists(): boolean {
      return Object.values(this.expandedPages).some(pages => pages.length > 0)
    },
    selectedVideoCards(): MergerSearchVideo[] {
      const map = new Map<string, MergerSearchVideo>()
      this.selectedVideos.forEach(video => {
        if (video?.bvid) {
          map.set(video.bvid, video)
        }
      })
      // 当前页结果优先覆盖摘要，保证标题/封面最新
      this.results.forEach(video => {
        if (this.selectedBvids.includes(video.bvid)) {
          map.set(video.bvid, video)
        }
      })
      return this.selectedBvids.map(bvid => map.get(bvid)).filter((v): v is MergerSearchVideo => !!v)
    },
    selectAllLabel(): string {
      if (!this.displayResults.length) {
        return '全选本页'
      }
      const allBvids = this.displayResults.map(v => v.bvid)
      const allSelected = allBvids.every(bvid => this.selectedBvids.includes(bvid))
      return allSelected ? '取消本页' : '全选本页'
    },
    selectedCount(): number {
      let count = 0

      this.selectedBvids.forEach(bvid => {
        if (!this.isBvidExpanded(bvid)) {
          count += 1
          return
        }
        const pages = this.expandedPages[bvid]
        if (!pages?.length) {
          // 已展开但分P尚未加载完：仍计为 1 项
          count += 1
          return
        }
        const pageSelected = pages.filter(page => page.selected).length
        count += pageSelected > 0 ? pageSelected : 0
      })

      // 仅勾了分P、未进 selectedBvids 的兜底（一般不会发生）
      Object.entries(this.expandedPages).forEach(([bvid, pages]) => {
        if (this.selectedBvids.includes(bvid) || !this.isBvidExpanded(bvid)) {
          return
        }
        count += pages.filter(page => page.selected).length
      })

      return count
    },
    hasSelection(): boolean {
      return this.selectedCount > 0
    },
    actionsPanelStyle(): Record<string, string> {
      return {
        display: this.showActions ? 'flex' : 'none',
        padding: '12px 20px',
        borderTop: '1px solid var(--line_regular, #eee)',
        background: 'var(--bg2, #f4f5f7)',
        flexShrink: '0',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: '10px',
      }
    },
    batchBtnStyle(): Record<string, string> {
      return {
        padding: '8px 24px',
        cursor: this.hasSelection ? 'pointer' : 'default',
        background: '#00AEEC',
        border: 'none',
        borderRadius: '6px',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '13px',
        transition: 'all 0.2s',
        boxShadow: '0 4px 12px rgba(0,174,236,0.2)',
        opacity: this.hasSelection ? '1' : '0.5',
        pointerEvents: this.hasSelection ? 'auto' : 'none',
      }
    },
  },
  watch: {
    // 不再监听 keyword 回写 searchInput，避免搜索结果同步时把用户输入冲成原标题
    sortMode(value: SortMode) {
      if (this.localSortMode !== value) {
        this.localSortMode = value
        this.applyDisplaySort()
      }
    },
    results() {
      if (this.results.length > 0 || this.errorMessage) {
        this.searched = true
      }
      this.applyDisplaySort()
    },
    errorMessage(value: string) {
      if (value) {
        this.searched = true
      }
    },
    visible(value: boolean) {
      if (value) {
        this.$nextTick(() => {
          const input = this.$refs.searchInput as HTMLInputElement | undefined
          input?.focus()
        })
      }
    },
  },
  methods: {
    onClose() {
      this.$emit(MERGER_MODAL_EVENTS.CLOSE)
    },
    sortChipStyle(mode: SortMode): Record<string, string> {
      const active = this.localSortMode === mode
      return {
        cursor: 'pointer',
        fontSize: '12px',
        color: active ? '#00AEEC' : 'var(--text2, #555)',
        fontWeight: active ? 'bold' : 'normal',
        background: active ? 'rgba(0,174,236,0.1)' : 'transparent',
        padding: '2px 8px',
        borderRadius: '12px',
        transition: 'all 0.2s',
      }
    },
    applyDisplaySort() {
      const list = [...this.results]
      if (this.localSortMode === 'play') {
        list.sort((a, b) => (b.play || 0) - (a.play || 0))
      } else if (this.localSortMode === 'danmaku') {
        list.sort((a, b) => (b.video_review || 0) - (a.video_review || 0))
      }
      this.displayResults = list
    },
    onSortChange(mode: SortMode) {
      if (!this.results.length || this.localSortMode === mode) {
        return
      }
      this.sortingGuard = true
      this.localSortMode = mode
      this.applyDisplaySort()
      this.$emit(MERGER_MODAL_EVENTS.SORT_CHANGE, { mode })
      this.$nextTick(() => {
        this.sortingGuard = false
      })
    },
    normalizeKeyword(raw: string): string {
      const trimmed = raw.trim()
      if (!trimmed) {
        return ''
      }

      const bvMatch = trimmed.match(/(BV[a-zA-Z0-9]{10})/i)
      if (bvMatch) {
        return bvMatch[1]
      }

      const avMatch = trimmed.match(/(av\d+)/i)
      if (avMatch) {
        return avMatch[1]
      }

      return trimmed
    },
    onSearch() {
      const keyword = this.normalizeKeyword(this.searchInput)
      if (!keyword) {
        return
      }

      this.searched = true
      this.loadMorePage = 1
      this.$emit(MERGER_MODAL_EVENTS.SEARCH, { keyword, page: 1 })
    },
    onResultsScroll(event: Event) {
      if (this.loadingMore || !this.hasMore || this.loading || this.sortingGuard) {
        return
      }

      if (this.scrollDebounceTimer) {
        clearTimeout(this.scrollDebounceTimer)
      }

      this.scrollDebounceTimer = setTimeout(() => {
        this.scrollDebounceTimer = null
        if (this.sortingGuard) {
          return
        }

        const el = event.target as HTMLElement
        const { scrollTop, scrollHeight, clientHeight } = el
        if (scrollTop + clientHeight < scrollHeight - 100) {
          return
        }

        const keyword = this.normalizeKeyword(this.searchInput)
        if (!keyword) {
          return
        }

        const nextPage = this.loadMorePage + 1
        this.loadMorePage = nextPage
        this.$emit(MERGER_MODAL_EVENTS.LOAD_MORE, { keyword, page: nextPage })
      }, 150)
    },
    isBvidExpanded(bvid: string): boolean {
      return !!this.expandedBvids[bvid]
    },
    isBvidSelected(bvid: string): boolean {
      return this.selectedBvids.includes(bvid)
    },
    isBvidMerged(bvid: string): boolean {
      return this.mergedBvids.includes(bvid)
    },
    mergedCountOf(bvid: string): number {
      return this.mergedCountByBvid[bvid] || 0
    },
    isDetailsLoading(bvid: string): boolean {
      return this.isBvidExpanded(bvid) && this.expandedPages[bvid] === undefined
    },
    videoMetaFor(video: MergerSearchVideo) {
      return {
        bvid: video.bvid,
        title: stripHtmlTags(video.title),
        pic: video.pic,
        author: video.author,
      }
    },
    emitSelectionChange(nextSelected: string[]) {
      const selectedVideos = nextSelected
        .map(bvid => {
          const fromCache = this.selectedVideos.find(v => v.bvid === bvid)
          const fromResults = this.results.find(v => v.bvid === bvid)
          return fromResults || fromCache
        })
        .filter((v): v is MergerSearchVideo => !!v)
      this.$emit(MERGER_MODAL_EVENTS.SELECTION_CHANGE, {
        selectedBvids: nextSelected,
        selectedVideos,
      })
    },
    plainTitle(video: MergerSearchVideo): string {
      return stripHtmlTags(video.title || '')
    },
    coverUrl(video: MergerSearchVideo): string {
      return normalizeHttpsUrl(video.pic || '')
    },
    selectedPartLabel(bvid: string): string {
      if (!this.isBvidExpanded(bvid) || !this.expandedPages[bvid]) {
        return ''
      }
      const selectedPages = this.expandedPages[bvid].filter(page => page.selected)
      if (!selectedPages.length) {
        return '未勾选分P'
      }
      if (selectedPages.length === this.expandedPages[bvid].length) {
        return `全部分P ${selectedPages.length}`
      }
      return `分P ${selectedPages.length}`
    },
    /** 已选卡片副标题：优先展示已加载分P弹幕数合计，否则用搜索结果弹幕量 */
    selectedDanmakuLabel(video: MergerSearchVideo): string {
      const pages = this.expandedPages[video.bvid]
      if (pages?.length) {
        const selected = pages.filter(page => page.selected)
        const targets = selected.length ? selected : pages
        const known = targets
          .map(page => page.danmakuCount)
          .filter((n): n is number => typeof n === 'number' && n >= 0)
        if (known.length) {
          const sum = known.reduce((a, b) => a + b, 0)
          return `${sum} 条弹幕`
        }
      }
      if (typeof video.video_review === 'number' && video.video_review >= 0) {
        return `${video.video_review} 条弹幕`
      }
      return ''
    },
    onRemoveSelected(bvid: string) {
      const next = this.selectedBvids.filter(id => id !== bvid)
      if (this.isBvidExpanded(bvid) && this.expandedPages[bvid]) {
        this.emitPageSelectionForBvid(bvid, false)
      }
      this.emitSelectionChange(next)
    },
    onClearSelected() {
      // 分P勾选一并清掉
      Object.keys(this.expandedPages).forEach(bvid => {
        if (this.isBvidExpanded(bvid)) {
          this.emitPageSelectionForBvid(bvid, false)
        }
      })
      this.emitSelectionChange([])
    },
    onToggleBvidSelect(video: MergerSearchVideo) {
      const { bvid } = video
      const next = [...this.selectedBvids]
      const index = next.indexOf(bvid)
      const selecting = index < 0

      if (selecting) {
        next.push(bvid)
        if (!this.isBvidExpanded(bvid)) {
          this.$emit(MERGER_MODAL_EVENTS.EXPAND_VIDEO, { bvid })
        } else if (this.expandedPages[bvid]) {
          this.emitPageSelectionForBvid(bvid, true)
        }
      } else {
        next.splice(index, 1)
        if (this.isBvidExpanded(bvid) && this.expandedPages[bvid]) {
          this.emitPageSelectionForBvid(bvid, false)
        }
      }

      this.emitSelectionChange(next)
    },
    emitPageSelectionForBvid(bvid: string, selected: boolean) {
      const pages = this.expandedPages[bvid]
      if (!pages) {
        return
      }

      pages.forEach(page => {
        this.$emit('update:pageSelection', {
          bvid,
          cid: page.cid,
          selected,
        })
      })
    },
    onOpenVideo(bvid: string) {
      window.open(`https://www.bilibili.com/video/${bvid}`, '_blank')
    },
    onToggleExpand(bvid: string) {
      if (this.isBvidExpanded(bvid)) {
        this.$emit(MERGER_MODAL_EVENTS.COLLAPSE_VIDEO, { bvid })
      } else {
        this.$emit(MERGER_MODAL_EVENTS.EXPAND_VIDEO, { bvid })
      }
    },
    /**
     * 分P勾选变化后，同步父级是否进入已选。
     * 任一分P勾选 → 父级勾选；全部分P取消 → 父级取消。
     * 单P视频勾选分P时，父勾选会立刻亮起。
     */
    syncParentSelectionFromPages(bvid: string) {
      const pages = this.expandedPages[bvid]
      if (!pages) {
        this.emitSelectionChange([...this.selectedBvids])
        return
      }
      const anySelected = pages.some(page => page.selected)
      const next = new Set(this.selectedBvids)
      if (anySelected) {
        next.add(bvid)
      } else {
        next.delete(bvid)
      }
      this.emitSelectionChange([...next])
    },
    onPageSelectionChange(bvid: string, payload: { bvid: string; cid: number; selected: boolean }) {
      this.$emit('update:pageSelection', payload)
      // 本地先改，避免等 host 回写前底部已选无反应
      const pages = this.expandedPages[bvid]
      if (pages) {
        const page = pages.find(item => item.cid === payload.cid)
        if (page) {
          this.$set(page, 'selected', payload.selected)
        }
      }
      this.syncParentSelectionFromPages(bvid)
    },
    onPageOffsetChange(
      bvid: string,
      payload: { bvid: string; cid: number; offset: number; offsetType: MergerOffsetType },
    ) {
      this.$emit('update:offset', payload)
    },
    onPartModeToggle(bvid: string, enabled: boolean) {
      this.$set(this.partModeState, bvid, enabled)
      this.$emit('update:partModeEnabled', { bvid, enabled })
    },
    onCalcOffsets(bvid: string) {
      this.$emit('calc-offsets', { bvid })
    },
    onSelectAllPages(bvid: string, payload: { bvid: string; select: boolean }) {
      this.$emit('select-all-pages', payload)
      // 本地同步分P勾选状态，再推父级已选
      const pages = this.expandedPages[bvid]
      if (pages) {
        pages.forEach(page => {
          this.$set(page, 'selected', payload.select)
        })
      }
      this.syncParentSelectionFromPages(bvid)
    },
    onPartDurationChange(
      bvid: string,
      payload: { bvid: string; field: 'total' | 'uniform' | 'part'; cid?: number; value: string },
    ) {
      if (payload.field === 'total' || payload.field === 'uniform') {
        const current = this.partDurationFields[bvid] || { total: '', uniform: '' }
        this.$set(this.partDurationFields, bvid, {
          ...current,
          [payload.field]: payload.value,
        })
      }
      this.$emit('part-duration-change', payload)
    },
    onSelectAll() {
      if (!this.displayResults.length) {
        return
      }

      const allBvids = this.displayResults.map(v => v.bvid)
      const allSelected = allBvids.every(bvid => this.selectedBvids.includes(bvid))

      const next = allSelected
        ? this.selectedBvids.filter(bvid => !allBvids.includes(bvid))
        : [...new Set([...this.selectedBvids, ...allBvids])]

      if (!allSelected) {
        allBvids.forEach(bvid => {
          if (this.isBvidExpanded(bvid) && this.expandedPages[bvid]) {
            this.emitPageSelectionForBvid(bvid, true)
          }
        })
      } else {
        allBvids.forEach(bvid => {
          if (this.isBvidExpanded(bvid) && this.expandedPages[bvid]) {
            this.emitPageSelectionForBvid(bvid, false)
          }
        })
      }

      this.emitSelectionChange(next)
    },
    buildBatchMergeItems(): MergerBatchMergeItem[] {
      const items: MergerBatchMergeItem[] = []

      Object.entries(this.expandedPages).forEach(([bvid, pages]) => {
        if (!this.isBvidExpanded(bvid)) {
          return
        }

        const video =
          this.results.find(v => v.bvid === bvid) ||
          this.selectedVideos.find(v => v.bvid === bvid)
        const plainTitle = video ? stripHtmlTags(video.title) : bvid

        pages
          .filter(page => page.selected)
          .forEach(page => {
            const offsetType: MergerOffsetType = page.offsetType === -1 ? -1 : 1
            const offset = (page.offset ?? 0) * offsetType

            items.push({
              bvid,
              title: `P${page.page} ${page.part}`,
              pic: video?.pic,
              author: video?.author,
              groupTitle: plainTitle,
              cid: page.cid,
              offset,
            })
          })
      })

      this.selectedBvids.forEach(bvid => {
        if (this.isBvidExpanded(bvid) && this.expandedPages[bvid]?.length) {
          return
        }

        // 跨搜索已选可能不在当前 results 里，回落 selectedVideos 缓存
        const video =
          this.results.find(v => v.bvid === bvid) ||
          this.selectedVideos.find(v => v.bvid === bvid)
        if (!video) {
          items.push({
            bvid,
            fetchRequired: true,
            title: bvid,
            groupTitle: bvid,
          })
          return
        }

        items.push({
          bvid,
          fetchRequired: true,
          title: stripHtmlTags(video.title),
          pic: video.pic,
          author: video.author,
          groupTitle: stripHtmlTags(video.title),
        })
      })

      return items
    },
    onBatchMerge() {
      if (!this.hasSelection) {
        return
      }
      const items = this.buildBatchMergeItems()
      if (!items.length) {
        return
      }
      this.$emit(MERGER_MODAL_EVENTS.BATCH_MERGE, { items })
    },
  },
})
</script>

<style lang="scss">
@import './shared/merger-global.scss';

.dm-selected-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.dm-selected-bar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dm-selected-summary {
  font-size: 13px;
  color: var(--text2, #555);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.dm-selected-count {
  color: #00aeec;
  font-weight: bold;
}

.dm-selected-hint {
  font-size: 12px;
  color: var(--text3, #999);
  font-weight: 400;
}

.dm-selected-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.dm-selected-secondary-btn {
  padding: 6px 14px;
  cursor: pointer;
  background: var(--bg1, #fff);
  border: 1px solid var(--line_regular, #ccd0d7);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text1, #222);
  transition: all 0.2s;
}

.dm-selected-secondary-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.dm-selected-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.dm-selected-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 220px;
  max-width: 280px;
  padding: 6px 8px;
  border-radius: 8px;
  background: var(--bg1, #fff);
  border: 1px solid var(--line_light, #e3e5e7);
  flex-shrink: 0;
}

.dm-selected-chip-cover {
  width: 54px;
  height: 34px;
  object-fit: cover;
  border-radius: 4px;
  background: #ddd;
  flex-shrink: 0;
}

.dm-selected-chip-meta {
  min-width: 0;
  flex: 1;
}

.dm-selected-chip-title {
  font-size: 12px;
  color: var(--text1, #222);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dm-selected-chip-sub {
  margin-top: 2px;
  font-size: 11px;
  color: var(--text3, #999);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dm-selected-chip-merged {
  margin-left: 4px;
  padding: 0 5px;
  border-radius: 8px;
  background: rgba(0, 174, 236, 0.14);
  color: #00aeec;
  font-size: 10px;
  line-height: 16px;
}

.dm-selected-chip-remove {
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text3, #999);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}

.dm-selected-chip-remove:hover {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.08);
}

.dm-selected-empty-hint {
  font-size: 12px;
  color: var(--text3, #999);
}

html[data-dark-theme='true'] .dm-selected-chip,
body.dark .dm-selected-chip {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

html[data-dark-theme='true'] .dm-selected-secondary-btn,
body.dark .dm-selected-secondary-btn {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
  color: var(--text1, #e7e9eb);
}
</style>
