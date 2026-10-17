<template>
  <modal-shell
    class="dm-preview-mask"
    :visible="visible"
    :title="title"
    width="450px"
    @close="onClose"
  >
    <div ref="content" class="dm-preview-content" @scroll="onScroll">
      <table class="dm-preview-table">
        <thead class="dm-preview-thead">
          <tr>
            <th class="dm-preview-sort-time" @click="onSortToggle">
              时间 <span class="sort-icon">{{ sortIcon }}</span>
            </th>
            <th class="dm-preview-col-text">内容</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="`${item.time}-${index}`" class="dm-preview-row">
            <td class="dm-preview-time">{{ formatTime(item.time) }}</td>
            <td class="dm-preview-text">{{ item.text }}</td>
          </tr>
        </tbody>
      </table>
      <div v-show="hasMore" class="dm-preview-loader">滚动加载更多...</div>
    </div>
  </modal-shell>
</template>

<script lang="ts">
import ModalShell from './shared/ModalShell.vue'
import { PREVIEW_MODAL_EVENTS, type MergerPreviewItem } from './contracts'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default Vue.extend({
  name: 'PreviewModal',
  components: {
    ModalShell,
  },
  // 根实例挂载，外部状态由 vue-host 写入 $data
  data() {
    return {
      visible: false,
      title: '',
      items: [] as MergerPreviewItem[],
      displayedCount: 0,
      sortOrder: 1 as 1 | -1,
      hasMore: false,
      loadMoreLock: false,
    }
  },
  computed: {
    sortIcon(): string {
      return this.sortOrder === 1 ? '▲' : '▼'
    },
  },
  watch: {
    sortOrder() {
      this.resetScrollTop()
    },
    items() {
      this.loadMoreLock = false
    },
  },
  methods: {
    formatTime,
    onClose() {
      this.$emit(PREVIEW_MODAL_EVENTS.CLOSE)
    },
    onSortToggle() {
      const order = (this.sortOrder * -1) as 1 | -1
      this.$emit(PREVIEW_MODAL_EVENTS.SORT_TOGGLE, { order })
    },
    onScroll() {
      const el = this.$refs.content as HTMLElement | undefined
      if (!el || !this.hasMore || this.loadMoreLock) {
        return
      }

      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
        this.loadMoreLock = true
        this.$emit(PREVIEW_MODAL_EVENTS.LOAD_MORE)
      }
    },
    resetScrollTop() {
      const el = this.$refs.content as HTMLElement | undefined
      if (el) {
        el.scrollTop = 0
      }
      this.loadMoreLock = false
    },
  },
})
</script>

<style scoped>
/* 预览叠在管理弹窗之上（ModalShell 默认 2147483000） */
.dm-preview-mask {
  z-index: 2147483100 !important;
}

::v-deep .dm-merger-modal {
  max-height: 70vh;
}

::v-deep .dm-merger-body {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.dm-preview-content {
  padding: 0;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.dm-preview-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 13px;
}

.dm-preview-thead {
  position: sticky;
  top: 0;
  background: var(--bg1, #fff);
  box-shadow: 0 1px 0 var(--line_regular, #eee);
  z-index: 1;
}

.dm-preview-sort-time,
.dm-preview-time {
  width: 72px;
  box-sizing: border-box;
  text-align: left;
  padding: 10px 12px;
  color: #00aeec;
  white-space: nowrap;
  vertical-align: top;
}

.dm-preview-sort-time {
  cursor: pointer;
  user-select: none;
}

.dm-preview-col-text,
.dm-preview-text {
  width: auto;
  box-sizing: border-box;
  text-align: left;
  padding: 10px 12px 10px 8px;
  vertical-align: top;
}

.dm-preview-col-text {
  color: var(--text3, #999);
}

.dm-preview-row {
  border-bottom: 1px solid var(--line_light, #f4f4f4);
}

.dm-preview-time {
  font-family: monospace;
}

.dm-preview-text {
  color: var(--text1, #222);
  word-break: break-all;
}

.dm-preview-loader {
  text-align: center;
  padding: 15px;
  color: var(--text3, #999);
}
</style>
