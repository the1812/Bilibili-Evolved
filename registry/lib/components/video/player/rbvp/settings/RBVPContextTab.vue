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
          <TextBox
            :text="String(state.debugContext.video.aid || '-')"
            class="rbvp-context-readonly-input"
            readonly
            @focus="selectAndCopyField('AID', state.debugContext.video.aid, $event)"
          />
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">BVID</span>
          <TextBox
            :text="String(state.debugContext.video.bvid || '-')"
            class="rbvp-context-readonly-input"
            readonly
            @focus="selectAndCopyField('BVID', state.debugContext.video.bvid, $event)"
          />
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">CID</span>
          <TextBox
            :text="String(state.debugContext.video.cid || '-')"
            class="rbvp-context-readonly-input"
            readonly
            @focus="selectAndCopyField('CID', state.debugContext.video.cid, $event)"
          />
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">分 P</span>
          <TextBox
            :text="String(state.debugContext.video.partIndex || '-')"
            class="rbvp-context-readonly-input"
            readonly
            @focus="selectAndCopyField('分 P', state.debugContext.video.partIndex, $event)"
          />
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">SECTION</span>
          <TextBox
            :text="String(state.debugContext.video.sectionId || '-')"
            class="rbvp-context-readonly-input"
            readonly
            @focus="selectAndCopyField('SECTION', state.debugContext.video.sectionId, $event)"
          />
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">SECTION-ROOT</span>
          <TextBox
            :text="String(state.debugContext.video.sectionRootId || '-')"
            class="rbvp-context-readonly-input"
            readonly
            @focus="
              selectAndCopyField('SECTION-ROOT', state.debugContext.video.sectionRootId, $event)
            "
          />
        </label>
        <label class="rbvp-field rbvp-debug-context-span-2">
          <span class="rbvp-field-label">SECTION-ROOT-NAME</span>
          <TextBox
            :text="String(state.debugContext.video.sectionRootName || '-')"
            class="rbvp-context-readonly-input"
            readonly
            @focus="
              selectAndCopyField(
                'SECTION-ROOT-NAME',
                state.debugContext.video.sectionRootName,
                $event,
              )
            "
          />
        </label>
        <label class="rbvp-field rbvp-debug-context-span-2">
          <span class="rbvp-field-label">SECTION-NAME</span>
          <TextBox
            :text="String(state.debugContext.video.sectionName || '-')"
            class="rbvp-context-readonly-input"
            readonly
            @focus="
              selectAndCopyField('SECTION-NAME', state.debugContext.video.sectionName, $event)
            "
          />
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">UP UID</span>
          <TextBox
            :text="String(state.debugContext.video.upUid || '-')"
            class="rbvp-context-readonly-input"
            readonly
            @focus="selectAndCopyField('UP UID', state.debugContext.video.upUid, $event)"
          />
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">UP 名称</span>
          <TextBox
            :text="String(state.debugContext.video.upName || '-')"
            class="rbvp-context-readonly-input"
            readonly
            @focus="selectAndCopyField('UP 名称', state.debugContext.video.upName, $event)"
          />
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">分区 ID</span>
          <TextBox
            :text="String(state.debugContext.video.partitionId || '-')"
            class="rbvp-context-readonly-input"
            readonly
            @focus="selectAndCopyField('分区 ID', state.debugContext.video.partitionId, $event)"
          />
        </label>
        <label class="rbvp-field rbvp-debug-context-span-2">
          <span class="rbvp-field-label">标题</span>
          <TextBox
            :text="String(state.debugContext.video.title || '-')"
            class="rbvp-context-readonly-input"
            readonly
            @focus="selectAndCopyField('标题', state.debugContext.video.title, $event)"
          />
        </label>
        <label class="rbvp-field rbvp-debug-context-span-2">
          <span class="rbvp-field-label">分 P 标题</span>
          <TextBox
            :text="String(state.debugContext.video.partTitle || '-')"
            class="rbvp-context-readonly-input"
            readonly
            @focus="selectAndCopyField('分 P 标题', state.debugContext.video.partTitle, $event)"
          />
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">时长</span>
          <TextBox
            :text="formatDuration(state.debugContext.video.duration)"
            class="rbvp-context-readonly-input"
            readonly
            @focus="selectAndCopyField('时长', state.debugContext.video.duration, $event)"
          />
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
import { TextBox, VIcon } from '@/ui'
import type { RBVPLocalRuleSetMap } from '../types'

export default Vue.extend({
  name: 'RBVPContextTab',
  components: {
    TextBox,
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
    selectAndCopyField(label: string, value: unknown, event: Event) {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | null
      target?.select?.()
      this.copyDebugValue(label, value)
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

.rbvp-context-readonly-input {
  font-family: consolas, 'Courier New', monospace;

  input {
    cursor: default;
  }
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
