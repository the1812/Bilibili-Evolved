<template>
  <div class="rbvp-rules-editor">
    <div class="rbvp-guide-card">
      <div class="rbvp-guide-title">上下文视图</div>
      <div class="rbvp-guide-text">
        这里会展示当前规则匹配使用的上下文信息，便于确认视频标识、合集信息、分区、标题和本地规则集是否符合预期。
      </div>
    </div>
    <div class="rbvp-status-card rbvp-debug-context-card">
      <div class="rbvp-status-card-label">当前 Context</div>
      <div v-if="state.debugContext" class="rbvp-debug-context-grid">
        <label class="rbvp-field">
          <span class="rbvp-field-label">AID</span>
          <div class="rbvp-debug-copy-field">
            <input
              :value="state.debugContext.video.aid || '-'"
              class="rbvp-input rbvp-debug-readonly-input rbvp-namespace-code"
              readonly
              @focus="selectReadonlyField"
            />
            <button
              v-if="isCopyableDebugValue(state.debugContext.video.aid)"
              type="button"
              class="rbvp-icon-button rbvp-debug-copy-button"
              title="复制 AID"
              @click="copyDebugValue('AID', state.debugContext.video.aid)"
            >
              <VIcon icon="mdi-content-copy" :size="16" />
            </button>
          </div>
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">BVID</span>
          <div class="rbvp-debug-copy-field">
            <input
              :value="state.debugContext.video.bvid || '-'"
              class="rbvp-input rbvp-debug-readonly-input rbvp-namespace-code"
              readonly
              @focus="selectReadonlyField"
            />
            <button
              v-if="isCopyableDebugValue(state.debugContext.video.bvid)"
              type="button"
              class="rbvp-icon-button rbvp-debug-copy-button"
              title="复制 BVID"
              @click="copyDebugValue('BVID', state.debugContext.video.bvid)"
            >
              <VIcon icon="mdi-content-copy" :size="16" />
            </button>
          </div>
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">CID</span>
          <div class="rbvp-debug-copy-field">
            <input
              :value="state.debugContext.video.cid || '-'"
              class="rbvp-input rbvp-debug-readonly-input rbvp-namespace-code"
              readonly
              @focus="selectReadonlyField"
            />
            <button
              v-if="isCopyableDebugValue(state.debugContext.video.cid)"
              type="button"
              class="rbvp-icon-button rbvp-debug-copy-button"
              title="复制 CID"
              @click="copyDebugValue('CID', state.debugContext.video.cid)"
            >
              <VIcon icon="mdi-content-copy" :size="16" />
            </button>
          </div>
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">分 P</span>
          <div class="rbvp-debug-copy-field">
            <input
              :value="state.debugContext.video.partIndex || '-'"
              class="rbvp-input rbvp-debug-readonly-input rbvp-namespace-code"
              readonly
              @focus="selectReadonlyField"
            />
            <button
              v-if="isCopyableDebugValue(state.debugContext.video.partIndex)"
              type="button"
              class="rbvp-icon-button rbvp-debug-copy-button"
              title="复制分 P"
              @click="copyDebugValue('分 P', state.debugContext.video.partIndex)"
            >
              <VIcon icon="mdi-content-copy" :size="16" />
            </button>
          </div>
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">SECTION</span>
          <div class="rbvp-debug-copy-field">
            <input
              :value="state.debugContext.video.sectionId || '-'"
              class="rbvp-input rbvp-debug-readonly-input rbvp-namespace-code"
              readonly
              @focus="selectReadonlyField"
            />
            <button
              v-if="isCopyableDebugValue(state.debugContext.video.sectionId)"
              type="button"
              class="rbvp-icon-button rbvp-debug-copy-button"
              title="复制 SECTION"
              @click="copyDebugValue('SECTION', state.debugContext.video.sectionId)"
            >
              <VIcon icon="mdi-content-copy" :size="16" />
            </button>
          </div>
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">SECTION-ROOT</span>
          <div class="rbvp-debug-copy-field">
            <input
              :value="state.debugContext.video.sectionRootId || '-'"
              class="rbvp-input rbvp-debug-readonly-input rbvp-namespace-code"
              readonly
              @focus="selectReadonlyField"
            />
            <button
              v-if="isCopyableDebugValue(state.debugContext.video.sectionRootId)"
              type="button"
              class="rbvp-icon-button rbvp-debug-copy-button"
              title="复制 SECTION-ROOT"
              @click="copyDebugValue('SECTION-ROOT', state.debugContext.video.sectionRootId)"
            >
              <VIcon icon="mdi-content-copy" :size="16" />
            </button>
          </div>
        </label>
        <label class="rbvp-field rbvp-debug-context-span-2">
          <span class="rbvp-field-label">SECTION-ROOT-NAME</span>
          <div class="rbvp-debug-copy-field">
            <input
              :value="state.debugContext.video.sectionRootName || '-'"
              class="rbvp-input rbvp-debug-readonly-input rbvp-namespace-code"
              readonly
              @focus="selectReadonlyField"
            />
            <button
              v-if="isCopyableDebugValue(state.debugContext.video.sectionRootName)"
              type="button"
              class="rbvp-icon-button rbvp-debug-copy-button"
              title="复制 SECTION-ROOT-NAME"
              @click="copyDebugValue('SECTION-ROOT-NAME', state.debugContext.video.sectionRootName)"
            >
              <VIcon icon="mdi-content-copy" :size="16" />
            </button>
          </div>
        </label>
        <label class="rbvp-field rbvp-debug-context-span-2">
          <span class="rbvp-field-label">SECTION-NAME</span>
          <div class="rbvp-debug-copy-field">
            <input
              :value="state.debugContext.video.sectionName || '-'"
              class="rbvp-input rbvp-debug-readonly-input rbvp-namespace-code"
              readonly
              @focus="selectReadonlyField"
            />
            <button
              v-if="isCopyableDebugValue(state.debugContext.video.sectionName)"
              type="button"
              class="rbvp-icon-button rbvp-debug-copy-button"
              title="复制 SECTION-NAME"
              @click="copyDebugValue('SECTION-NAME', state.debugContext.video.sectionName)"
            >
              <VIcon icon="mdi-content-copy" :size="16" />
            </button>
          </div>
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">UP UID</span>
          <div class="rbvp-debug-copy-field">
            <input
              :value="state.debugContext.video.upUid || '-'"
              class="rbvp-input rbvp-debug-readonly-input rbvp-namespace-code"
              readonly
              @focus="selectReadonlyField"
            />
            <button
              v-if="isCopyableDebugValue(state.debugContext.video.upUid)"
              type="button"
              class="rbvp-icon-button rbvp-debug-copy-button"
              title="复制 UP UID"
              @click="copyDebugValue('UP UID', state.debugContext.video.upUid)"
            >
              <VIcon icon="mdi-content-copy" :size="16" />
            </button>
          </div>
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">UP 名称</span>
          <div class="rbvp-debug-copy-field">
            <input
              :value="state.debugContext.video.upName || '-'"
              class="rbvp-input rbvp-debug-readonly-input rbvp-namespace-code"
              readonly
              @focus="selectReadonlyField"
            />
            <button
              v-if="isCopyableDebugValue(state.debugContext.video.upName)"
              type="button"
              class="rbvp-icon-button rbvp-debug-copy-button"
              title="复制 UP 名称"
              @click="copyDebugValue('UP 名称', state.debugContext.video.upName)"
            >
              <VIcon icon="mdi-content-copy" :size="16" />
            </button>
          </div>
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">分区 ID</span>
          <div class="rbvp-debug-copy-field">
            <input
              :value="state.debugContext.video.partitionId || '-'"
              class="rbvp-input rbvp-debug-readonly-input rbvp-namespace-code"
              readonly
              @focus="selectReadonlyField"
            />
            <button
              v-if="isCopyableDebugValue(state.debugContext.video.partitionId)"
              type="button"
              class="rbvp-icon-button rbvp-debug-copy-button"
              title="复制分区 ID"
              @click="copyDebugValue('分区 ID', state.debugContext.video.partitionId)"
            >
              <VIcon icon="mdi-content-copy" :size="16" />
            </button>
          </div>
        </label>
        <label class="rbvp-field rbvp-debug-context-span-2">
          <span class="rbvp-field-label">标题</span>
          <div class="rbvp-debug-copy-field">
            <input
              :value="state.debugContext.video.title || '-'"
              class="rbvp-input rbvp-debug-readonly-input rbvp-namespace-code"
              readonly
              @focus="selectReadonlyField"
            />
            <button
              v-if="isCopyableDebugValue(state.debugContext.video.title)"
              type="button"
              class="rbvp-icon-button rbvp-debug-copy-button"
              title="复制标题"
              @click="copyDebugValue('标题', state.debugContext.video.title)"
            >
              <VIcon icon="mdi-content-copy" :size="16" />
            </button>
          </div>
        </label>
        <label class="rbvp-field rbvp-debug-context-span-2">
          <span class="rbvp-field-label">分 P 标题</span>
          <div class="rbvp-debug-copy-field">
            <input
              :value="state.debugContext.video.partTitle || '-'"
              class="rbvp-input rbvp-debug-readonly-input rbvp-namespace-code"
              readonly
              @focus="selectReadonlyField"
            />
            <button
              v-if="isCopyableDebugValue(state.debugContext.video.partTitle)"
              type="button"
              class="rbvp-icon-button rbvp-debug-copy-button"
              title="复制分 P 标题"
              @click="copyDebugValue('分 P 标题', state.debugContext.video.partTitle)"
            >
              <VIcon icon="mdi-content-copy" :size="16" />
            </button>
          </div>
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">时长</span>
          <div class="rbvp-debug-copy-field">
            <input
              :value="formatDuration(state.debugContext.video.duration)"
              class="rbvp-input rbvp-debug-readonly-input rbvp-namespace-code"
              readonly
              @focus="selectReadonlyField"
            />
            <button
              v-if="isCopyableDebugValue(state.debugContext.video.duration)"
              type="button"
              class="rbvp-icon-button rbvp-debug-copy-button"
              title="复制时长"
              @click="copyDebugValue('时长', state.debugContext.video.duration)"
            >
              <VIcon icon="mdi-content-copy" :size="16" />
            </button>
          </div>
        </label>
        <label class="rbvp-field rbvp-debug-context-span-2">
          <span class="rbvp-field-label">标签</span>
          <div v-if="state.debugContext.video.tags.length > 0" class="rbvp-namespace-tags">
            <span
              v-for="tag in displayTags"
              :key="`context-tag-${tag.name}`"
              class="rbvp-namespace-tag rbvp-context-clickable-tag"
              :title="tag.isMusic ? `单击复制 music_id: ${tag.musicId}` : '单击复制标签'"
              @click="tag.isMusic ? copyMusicId(tag.name, tag.musicId) : copyTag(tag.name)"
            >
              <VIcon v-if="tag.isMusic" icon="mdi-music" :size="14" class="rbvp-tag-music-icon" />
              {{ tag.name }}
            </span>
          </div>
          <div v-else class="rbvp-field-hint">无</div>
        </label>
        <label class="rbvp-field rbvp-debug-context-span-2">
          <span class="rbvp-field-label">本地规则集</span>
          <div v-if="getDebugRuleSetEntries().length > 0" class="rbvp-debug-rule-set-list">
            <div
              v-for="[name, ruleSet] in getDebugRuleSetEntries()"
              :key="`context-rule-set-${name}`"
              class="rbvp-debug-rule-set-item"
            >
              <span class="rbvp-debug-rule-set-name">{{ name }}</span>
              <span class="rbvp-debug-rule-set-meta">
                {{ ruleSet.matcherType }} · {{ ruleSet.entries.length }} 项
              </span>
            </div>
          </div>
          <div v-else class="rbvp-field-hint">无本地规则集</div>
        </label>
      </div>
      <div v-else class="rbvp-field-hint">暂无 context 记录</div>
    </div>
  </div>
</template>
<script lang="ts">
import { Toast } from '@/core/toast'
import { VIcon } from '@/ui'
import type { RBVPLocalRuleSetMap } from '../types'

export default Vue.extend({
  name: 'RBVPContextTab',
  components: {
    VIcon,
  },
  props: {
    state: {
      type: Object,
      required: true,
    },
  },
  computed: {
    displayTags() {
      const musicTagMap = new Map(
        (this.state.debugContext?.video?.musicTags ?? []).map(
          (mt: { name: string; musicId: string }) => [mt.name, mt.musicId],
        ),
      )
      return (this.state.debugContext?.video?.tags ?? []).map((name: string) => {
        const musicId = musicTagMap.get(name)
        return { name, isMusic: Boolean(musicId), musicId: musicId ?? '' }
      })
    },
  },
  methods: {
    selectReadonlyField(event: Event) {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | null
      target?.select?.()
    },
    formatDuration(duration: number) {
      if (!Number.isFinite(duration) || duration <= 0) {
        return '-'
      }
      const minutes = Math.floor(duration / 60)
      const seconds = Math.floor(duration % 60)
      return `${minutes}:${String(seconds).padStart(2, '0')} (${duration}s)`
    },
    getDebugRuleSetEntries() {
      return Object.entries(
        (this.state.debugContext?.localRuleSets ?? {}) as RBVPLocalRuleSetMap,
      ) as [string, RBVPLocalRuleSetMap[string]][]
    },
    isCopyableDebugValue(value: unknown) {
      if (typeof value === 'string') {
        return value.trim() !== ''
      }
      if (typeof value === 'number') {
        return Number.isFinite(value) && value > 0
      }
      if (Array.isArray(value)) {
        return value.length > 0
      }
      if (value && typeof value === 'object') {
        return Object.keys(value).length > 0
      }
      return false
    },
    stringifyDebugValue(value: unknown) {
      if (typeof value === 'string') {
        return value
      }
      if (typeof value === 'number') {
        return String(value)
      }
      if (Array.isArray(value)) {
        return value.join(', ')
      }
      return JSON.stringify(value, null, 2)
    },
    async copyDebugValue(label: string, value: unknown) {
      if (!this.isCopyableDebugValue(value)) {
        return
      }
      try {
        await navigator.clipboard.writeText(this.stringifyDebugValue(value))
        Toast.success(`${label} 已复制`, 'RBVP', 2000)
      } catch {
        Toast.error(`复制 ${label} 失败`, 'RBVP', 3000)
      }
    },
    async copyTag(tag: string) {
      await this.copyDebugValue('标签', tag)
    },
    async copyMusicId(tagName: string, musicId: string) {
      await this.copyDebugValue(`标签「${tagName}」的 music_id`, musicId)
    },
  },
})
</script>
<style lang="scss">
@import 'shared';

.rbvp-debug-context-card {
  gap: 12px;
}

.rbvp-debug-context-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.rbvp-debug-context-span-2 {
  grid-column: 1 / -1;
}

.rbvp-context-clickable-tag {
  cursor: pointer;
  transition: background-color 0.2s ease-out, color 0.2s ease-out;

  &:hover {
    background-color: var(--theme-color-10);
    color: var(--theme-color);
  }
}

.rbvp-debug-rule-set-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rbvp-debug-rule-set-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 6px;
  background-color: rgb(127 127 127 / 8%);
}

.rbvp-debug-rule-set-name {
  font-weight: 600;
  word-break: break-word;
}

.rbvp-debug-rule-set-meta {
  opacity: 0.72;
  white-space: nowrap;
}

.rbvp-debug-copy-field {
  position: relative;
  min-width: 0;
}

.rbvp-debug-readonly-input {
  padding-right: 38px;
  font-family: consolas, 'Courier New', monospace;
}

.rbvp-debug-copy-button {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  opacity: 0;
  pointer-events: none;
}

.rbvp-debug-copy-field:focus-within .rbvp-debug-copy-button {
  opacity: 1;
  pointer-events: auto;
}

@media (max-width: 900px) {
  .rbvp-debug-context-grid {
    grid-template-columns: 1fr;
  }

  .rbvp-debug-context-span-2 {
    grid-column: auto;
  }
}
</style>
