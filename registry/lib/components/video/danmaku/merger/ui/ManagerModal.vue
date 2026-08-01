<template>
  <ModalShell
    :visible="visible"
    mask-class="dm-manager-modal-mask"
    title="管理已合并弹幕"
    width="850px"
    @close="onClose"
  >
    <div class="dm-manager-body" style="max-height: 60vh; overflow-y: auto">
      <div v-if="groups.length === 0" class="dm-manager-empty">暂无合并源</div>

      <div
        v-for="group in groups"
        :key="group.groupKey"
        class="dm-group-block"
        :data-group-key="group.groupKey"
      >
        <div class="dm-group-header">
          <div
            class="dm-group-checkbox dm-checkbox"
            :class="{ checked: isGroupChecked(group) }"
            @click.stop="onToggleGroupSelection(group)"
          ></div>

          <div
            class="dm-group-arrow"
            :style="groupArrowStyle(group.groupKey)"
            @click="onToggleGroupExpand(group.groupKey)"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text3, #999)">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
            </svg>
          </div>

          <div
            v-if="group.cover"
            class="dm-group-cover"
            @click="onToggleGroupExpand(group.groupKey)"
          >
            <img :src="coverUrl(group.cover)" referrerpolicy="no-referrer" />
          </div>

          <div class="dm-group-info" @click="onToggleGroupExpand(group.groupKey)">
            <div class="dm-group-title">{{ group.title }}</div>
            <div class="dm-group-meta">
              <a
                v-if="group.bvid"
                :href="`https://www.bilibili.com/video/${group.bvid}`"
                target="_blank"
                rel="noopener"
                class="dm-group-bvid"
                @click.stop
              >
                {{ group.bvid }}
              </a>
              <span>UP: {{ group.author || '未知' }} · {{ group.items.length }}个分P</span>
              <span
                v-if="groupOffsetCount(group) > 0"
                class="dm-offset-badge dm-group-offset-badge"
                :title="groupOffsetTitle(group)"
              >
                {{ groupOffsetLabel(group) }}
              </span>
            </div>
          </div>
        </div>

        <div v-show="isGroupExpanded(group.groupKey)" class="dm-group-list">
          <div
            v-for="item in group.items"
            :key="item.id"
            class="dm-source-item"
            :class="{ 'dm-source-item-offset': offsetValue(item) > 0 }"
            :data-source-id="item.id"
            :data-group="group.groupKey"
          >
            <div
              class="dm-checkbox dm-item-checkbox"
              :class="{ checked: isItemSelected(item.id) }"
              @click="onToggleItem(item.id)"
            ></div>

            <div class="dm-source-info">
              <div
                class="dm-source-title"
                :title="item.bvid ? `${item.bvid} · ${item.title}` : item.title"
              >
                <span v-if="item.bvid" class="dm-source-bvid">{{ item.bvid }}</span
                >{{ item.title }}
              </div>
              <div class="dm-source-meta">
                <span
                  class="dm-preview-trigger"
                  title="点击预览前50条弹幕"
                  @click.stop="onPreviewSource(item.id)"
                >
                  {{ item.count }} 条弹幕
                </span>
                <span
                  v-if="offsetValue(item) > 0"
                  class="dm-offset-badge"
                  :title="offsetBadgeTitle(item)"
                >
                  {{ offsetBadgeLabel(item) }}
                </span>
                <span
                  v-if="item.fetchMode === 'protobuf-fallback' || item.fetchNotice"
                  class="dm-source-fallback-tag"
                  :title="item.fetchNotice || '视频不可用，已使用历史弹幕兜底'"
                >
                  历史兜底
                </span>
              </div>
              <div
                v-if="item.fetchNotice"
                class="dm-source-fallback-note"
                :title="item.fetchNotice"
              >
                {{ item.fetchNotice }}
              </div>
            </div>

            <div class="dm-source-actions">
              <div class="dm-offset-control" @click.stop>
                <select
                  class="dm-offset-type"
                  :value="String(offsetType(item))"
                  @change="onOffsetTypeChange(item, $event)"
                >
                  <option value="1">推迟</option>
                  <option value="-1">提前</option>
                </select>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  class="dm-offset-input"
                  :class="{ 'dm-offset-flash': flashOffsetId === item.id }"
                  :value="offsetValue(item)"
                  title="偏移秒数，步进 0.1"
                  @change="onOffsetValueChange(item, $event)"
                />
                <span class="dm-offset-unit">秒</span>
                <button
                  v-if="offsetValue(item) > 0"
                  type="button"
                  class="dm-offset-clear-btn"
                  title="清除偏移"
                  @click.stop="onClearOffset(item)"
                >
                  清除
                </button>
              </div>
              <button type="button" class="dm-delete-btn" @click.stop="onRemoveSource(item.id)">
                移除
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="dm-manager-footer">
        <button type="button" class="dm-footer-btn dm-select-all-btn" @click="onSelectAll">
          {{ selectAllLabel }}
        </button>
        <button
          type="button"
          class="dm-footer-btn dm-batch-delete-btn"
          :class="{ disabled: selectedCount === 0 }"
          :disabled="selectedCount === 0"
          @click="onBatchDelete"
        >
          删除选中 ({{ selectedCount }})
        </button>
        <button type="button" class="dm-footer-btn dm-add-more-btn" @click="onAddMore">
          + 添加更多弹幕
        </button>
        <button type="button" class="dm-footer-btn dm-clear-all-btn" @click="onClearAll">
          清除全部
        </button>
      </div>
    </div>
  </ModalShell>
</template>

<script lang="ts">
import ModalShell from './shared/ModalShell.vue'
import { normalizeHttpsUrl } from './shared/media-url'
import {
  MANAGER_MODAL_EVENTS,
  type MergerManagerGroup,
  type MergerManagerSourceItem,
  type MergerOffsetType,
} from './contracts'

export default Vue.extend({
  name: 'ManagerModal',
  components: {
    ModalShell,
  },
  // 根实例挂载，外部状态由 vue-host 写入 $data
  data() {
    return {
      visible: false,
      groups: [] as MergerManagerGroup[],
      selectedIds: [] as string[],
      expandedGroups: [] as string[],
      flashOffsetId: null as string | null,
      flashTimer: null as ReturnType<typeof setTimeout> | null,
    }
  },
  computed: {
    totalItemCount(): number {
      return this.groups.reduce((sum, group) => sum + group.items.length, 0)
    },
    selectedCount(): number {
      return this.selectedIds.length
    },
    isAllSelected(): boolean {
      return this.totalItemCount > 0 && this.selectedCount === this.totalItemCount
    },
    selectAllLabel(): string {
      return this.isAllSelected ? '取消全选' : '全选'
    },
  },
  beforeDestroy() {
    if (this.flashTimer) {
      clearTimeout(this.flashTimer)
    }
  },
  methods: {
    coverUrl(cover: string): string {
      return normalizeHttpsUrl(cover)
    },
    isGroupExpanded(groupKey: string): boolean {
      return this.expandedGroups.includes(groupKey)
    },
    groupArrowStyle(groupKey: string): { transform: string; transition: string } {
      return {
        transform: this.isGroupExpanded(groupKey) ? 'rotate(-180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s',
      }
    },
    isItemSelected(id: string): boolean {
      return this.selectedIds.includes(id)
    },
    isGroupChecked(group: MergerManagerGroup): boolean {
      if (group.items.length === 0) {
        return false
      }
      return group.items.every(item => this.isItemSelected(item.id))
    },
    offsetType(item: MergerManagerSourceItem): MergerOffsetType {
      return (item.offset ?? 0) < 0 ? -1 : 1
    },
    offsetValue(item: MergerManagerSourceItem): number {
      // 与时停写回一致：展示也只保留 1 位小数
      return Math.round(Math.abs(item.offset ?? 0) * 10) / 10
    },
    offsetBadgeLabel(item: MergerManagerSourceItem): string {
      const seconds = this.offsetValue(item)
      if (seconds <= 0) {
        return ''
      }
      const dir = this.offsetType(item) === -1 ? '提前' : '推迟'
      return `${dir} ${seconds.toFixed(1)}s`
    },
    offsetBadgeTitle(item: MergerManagerSourceItem): string {
      const label = this.offsetBadgeLabel(item)
      return label ? `该分P已设置时间偏移：${label}` : ''
    },
    groupOffsetItems(group: MergerManagerGroup): MergerManagerSourceItem[] {
      return group.items.filter(item => this.offsetValue(item) > 0)
    },
    groupOffsetCount(group: MergerManagerGroup): number {
      return this.groupOffsetItems(group).length
    },
    groupOffsetLabel(group: MergerManagerGroup): string {
      const items = this.groupOffsetItems(group)
      if (!items.length) {
        return ''
      }
      if (items.length === 1) {
        return this.offsetBadgeLabel(items[0])
      }
      return `已偏移 ${items.length} 项`
    },
    groupOffsetTitle(group: MergerManagerGroup): string {
      const items = this.groupOffsetItems(group)
      if (!items.length) {
        return ''
      }
      return items.map(item => `${item.title || item.id}: ${this.offsetBadgeLabel(item)}`).join('\n')
    },
    emitSelectionChange(nextIds: string[]) {
      this.$emit(MANAGER_MODAL_EVENTS.SELECTION_CHANGE, { selectedIds: nextIds })
    },
    onClose() {
      this.$emit(MANAGER_MODAL_EVENTS.CLOSE)
    },
    onToggleGroupExpand(groupKey: string) {
      const expanded = this.isGroupExpanded(groupKey)
      this.$emit(MANAGER_MODAL_EVENTS.TOGGLE_GROUP, { groupKey, expanded: !expanded })
    },
    onToggleItem(id: string) {
      const next = new Set(this.selectedIds)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      this.emitSelectionChange([...next])
    },
    onToggleGroupSelection(group: MergerManagerGroup) {
      const next = new Set(this.selectedIds)
      const allChecked = this.isGroupChecked(group)
      group.items.forEach(item => {
        if (allChecked) {
          next.delete(item.id)
        } else {
          next.add(item.id)
        }
      })
      this.emitSelectionChange([...next])
    },
    onSelectAll() {
      this.$emit(MANAGER_MODAL_EVENTS.SELECT_ALL, { select: !this.isAllSelected })
    },
    onBatchDelete() {
      if (this.selectedCount === 0) {
        return
      }
      this.$emit(MANAGER_MODAL_EVENTS.BATCH_DELETE, { ids: [...this.selectedIds] })
    },
    onAddMore() {
      this.$emit(MANAGER_MODAL_EVENTS.ADD_MORE)
    },
    onClearAll() {
      this.$emit(MANAGER_MODAL_EVENTS.CLEAR_ALL)
    },
    onPreviewSource(sourceId: string) {
      this.$emit(MANAGER_MODAL_EVENTS.PREVIEW_SOURCE, { sourceId })
    },
    onRemoveSource(sourceId: string) {
      this.$emit(MANAGER_MODAL_EVENTS.REMOVE_SOURCE, { sourceId })
    },
    emitOffset(sourceId: string, offsetType: MergerOffsetType, seconds: number) {
      // 秒数只保留 1 位小数，与 number input step=0.1 对齐
      const rounded = Math.round(Math.max(0, seconds) * 10) / 10
      const offset = offsetType * rounded
      this.$emit(MANAGER_MODAL_EVENTS.UPDATE_OFFSET, { sourceId, offset })
      this.flashOffsetId = sourceId
      if (this.flashTimer) {
        clearTimeout(this.flashTimer)
      }
      this.flashTimer = setTimeout(() => {
        this.flashOffsetId = null
        this.flashTimer = null
      }, 500)
    },
    onOffsetTypeChange(item: MergerManagerSourceItem, event: Event) {
      const raw = (event.target as HTMLSelectElement).value
      const type = (raw === '-1' ? -1 : 1) as MergerOffsetType
      this.emitOffset(item.id, type, this.offsetValue(item))
    },
    onOffsetValueChange(item: MergerManagerSourceItem, event: Event) {
      const raw = (event.target as HTMLInputElement).value
      const seconds = parseFloat(raw) || 0
      this.emitOffset(item.id, this.offsetType(item), seconds)
    },
    onClearOffset(item: MergerManagerSourceItem) {
      this.emitOffset(item.id, 1, 0)
    },
  },
})
</script>

<style scoped>
.dm-manager-empty {
  padding: 40px;
  text-align: center;
  color: #999;
}

.dm-group-block {
  border-bottom: 1px solid var(--line_light, #eee);
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.dm-group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--bg2, #f9f9f9);
  border-radius: 4px;
  margin-bottom: 8px;
  user-select: none;
}

.dm-group-checkbox {
  flex-shrink: 0;
  cursor: pointer;
}

.dm-group-arrow {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.dm-group-cover {
  width: 48px;
  height: 30px;
  border-radius: 3px;
  overflow: hidden;
  background: #e7e7e7;
  flex-shrink: 0;
  cursor: pointer;
}

.dm-group-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dm-group-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.dm-group-title {
  font-weight: bold;
  color: var(--text1, #222);
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dm-group-meta {
  font-size: 12px;
  color: var(--text3, #999);
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.dm-group-bvid {
  color: #00aeec;
  text-decoration: none;
  font-family: Consolas, monospace;
  font-weight: 600;
}

.dm-source-item {
  display: flex;
  gap: 12px;
  padding: 8px 12px;
  align-items: center;
  padding-left: 42px;
}

.dm-source-item-offset {
  background: rgba(0, 174, 236, 0.06);
}

.dm-offset-badge {
  display: inline-flex;
  align-items: center;
  padding: 0 6px;
  height: 18px;
  border-radius: 9px;
  font-size: 11px;
  line-height: 18px;
  font-weight: 600;
  color: #00aeec;
  background: rgba(0, 174, 236, 0.14);
  white-space: nowrap;
}

.dm-group-offset-badge {
  margin-left: 2px;
}

.dm-item-checkbox {
  flex-shrink: 0;
  cursor: pointer;
}

.dm-source-info {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.dm-source-title {
  font-size: 13px;
  color: var(--text2, #555);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dm-source-bvid {
  color: #00aeec;
  font-family: Consolas, monospace;
  margin-right: 6px;
}

.dm-source-meta {
  font-size: 12px;
  color: var(--text3, #999);
  display: flex;
  align-items: center;
  gap: 8px;
}

.dm-preview-trigger {
  cursor: pointer;
  color: #00aeec;
  border-bottom: 1px dashed #00aeec;
}

.dm-source-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.dm-offset-control {
  display: flex;
  align-items: center;
  background: var(--bg2, #f4f5f7);
  border-radius: 4px;
  padding: 2px 6px;
}

.dm-offset-type {
  background: transparent;
  border: none;
  color: var(--text2, #555);
  font-size: 12px;
  outline: none;
  cursor: pointer;
  margin-right: 4px;
}

.dm-offset-input {
  width: 48px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #ddd;
  text-align: center;
  font-size: 12px;
  color: var(--text1, #222);
  outline: none;
}

.dm-offset-input.dm-offset-flash {
  color: #00aeec;
}

.dm-offset-unit {
  font-size: 12px;
  color: var(--text3, #999);
  margin-left: 2px;
}

.dm-offset-clear-btn {
  margin-left: 4px;
  padding: 0 6px;
  height: 22px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text3, #999);
  font-size: 12px;
  line-height: 22px;
  cursor: pointer;
}

.dm-offset-clear-btn:hover {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.08);
}

.dm-delete-btn {
  padding: 4px 10px;
  background: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: opacity 0.2s;
}

.dm-delete-btn:hover {
  opacity: 0.9;
}

.dm-manager-footer {
  margin-top: 20px;
  text-align: center;
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.dm-footer-btn {
  padding: 8px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  border: none;
}

.dm-select-all-btn {
  background: var(--bg2, #e7e7e7);
  color: var(--text2, #555);
  border: 1px solid var(--line_regular, #ccc);
}

.dm-batch-delete-btn {
  background: #ff4d4f;
  color: #fff;
}

.dm-batch-delete-btn.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.dm-add-more-btn {
  background: #00aeec;
  color: #fff;
}

.dm-clear-all-btn {
  background: #ff6b6b;
  color: #fff;
}
</style>
