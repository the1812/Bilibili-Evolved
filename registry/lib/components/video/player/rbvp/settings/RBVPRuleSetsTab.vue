<template>
  <div class="rbvp-section-content">
    <input
      ref="ruleSetFileInput"
      type="file"
      class="rbvp-hidden-file-input"
      accept="application/json,.json"
      @change="handleRuleSetFileChange"
    />
    <div class="rbvp-guide-card">
      <div class="rbvp-guide-title">本地规则集</div>
      <div class="rbvp-guide-text">
        规则集适合维护可复用的匹配条目，例如某组 UP、分区或标题关键字。主规则中可通过
        <code>RULE-SET, 规则集名称</code> 统一引用。
      </div>
      <div class="rbvp-guide-meta">
        <span>当前共 {{ state.ruleSetNames.length }} 个规则集</span>
        <span>{{ state.selectedRuleSetName || '未选中规则集' }}</span>
      </div>
    </div>
    <div class="rbvp-section-header">
      <div class="rbvp-section-title">本地规则集</div>
      <div class="rbvp-section-actions">
        <VButton @click="openRuleSetExport('all')">导出全部</VButton>
        <VButton :disabled="!state.selectedRuleSet" @click="openRuleSetExport('current')">
          导出当前
        </VButton>
        <VButton @click="openRuleSetImport()">导入规则集</VButton>
        <VButton @click="createRuleSet()">新增规则集</VButton>
      </div>
    </div>
    <div v-if="state.ruleSetTransferMode" class="rbvp-rule-set-transfer">
      <div class="rbvp-rule-set-transfer-header">
        <div class="rbvp-rule-set-transfer-title">
          {{ state.ruleSetTransferMode === 'export' ? '导出规则集' : '导入规则集' }}
        </div>
        <button
          type="button"
          class="rbvp-icon-button"
          title="关闭"
          @click="closeRuleSetTransferPanel()"
        >
          <VIcon icon="close" :size="16" />
        </button>
      </div>
      <div class="rbvp-field-hint">
        {{
          state.ruleSetTransferMode === 'export'
            ? '已按 JSON 生成导出内容，可直接复制保存。导入时支持整批规则集，也支持仅包含单个规则集的内容。'
            : '请粘贴 JSON 内容。导入时会按规则集名称合并，同名规则集会被覆盖。'
        }}
      </div>
      <TextArea
        :text="state.ruleSetTransferText"
        class="rbvp-textarea"
        rows="10"
        :readonly="state.ruleSetTransferMode === 'export'"
        :placeholder="
          state.ruleSetTransferMode === 'export'
            ? '导出内容会显示在这里'
            : '请粘贴导入的规则集 JSON'
        "
        @change="updateRuleSetTransferText"
      />
      <div class="rbvp-rule-set-transfer-actions">
        <VButton v-if="state.ruleSetTransferMode === 'export'" @click="copyRuleSetTransferText()">
          复制内容
        </VButton>
        <VButton v-if="state.ruleSetTransferMode === 'export'" @click="downloadRuleSetExportFile()">
          下载文件
        </VButton>
        <VButton v-if="state.ruleSetTransferMode === 'import'" @click="triggerRuleSetFileImport()">
          选择文件
        </VButton>
        <VButton
          v-if="state.ruleSetTransferMode === 'import'"
          type="primary"
          @click="applyImportedRuleSets()"
        >
          导入并覆盖同名项
        </VButton>
        <VButton @click="closeRuleSetTransferPanel()">关闭</VButton>
      </div>
    </div>
    <div class="rbvp-rule-set-layout">
      <div class="rbvp-rule-set-list">
        <button
          v-for="name in state.ruleSetNames"
          :key="name"
          type="button"
          class="rbvp-rule-set-item"
          :class="{ active: name === state.selectedRuleSetName }"
          @click="selectRuleSet(name)"
        >
          <span class="rbvp-rule-set-item-name">{{ name }}</span>
          <span class="rbvp-rule-set-item-meta">
            {{ state.localRuleSets[name].matcherType }} ·
            {{ state.localRuleSets[name].entries.length }}
          </span>
        </button>
        <div v-if="state.ruleSetNames.length === 0" class="rbvp-empty-state">
          <div class="rbvp-empty-state-title">还没有本地规则集</div>
          <div class="rbvp-empty-state-text">
            可以先创建一个规则集，再在主规则中通过 <code>RULE-SET</code> 引用它。
          </div>
        </div>
      </div>
      <div v-if="state.selectedRuleSet" class="rbvp-rule-set-editor">
        <label class="rbvp-field">
          <span class="rbvp-field-label">名称</span>
          <TextBox
            :text="state.selectedRuleSetNameInput"
            @change="updateSelectedRuleSetNameInput"
          />
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">匹配类型</span>
          <VDropdown
            :value="state.selectedRuleSet.matcherType"
            :items="state.matcherTypes"
            :key-mapper="item => item"
            @change="updateSelectedRuleSetMatcherType"
          >
            <template #item="{ item }">{{ item }}</template>
          </VDropdown>
        </label>
        <label class="rbvp-field">
          <span class="rbvp-field-label">条目</span>
          <TextArea
            :text="state.selectedRuleSetEntries"
            class="rbvp-textarea"
            rows="10"
            placeholder="每行一条规则集条目，例如 UID、标签名、分区名或标题关键字"
            @change="updateSelectedRuleSetEntries"
          />
        </label>
        <div class="rbvp-field-hint">
          每行一个匹配条目，保存时会自动去掉空行。重命名不会覆盖现有同名规则集。
        </div>
        <div class="rbvp-rule-set-actions">
          <VButton type="primary" @click="saveRuleSet()">保存规则集</VButton>
          <VButton @click="removeRuleSet()">删除规则集</VButton>
        </div>
      </div>
      <div v-else class="rbvp-empty-state rbvp-rule-set-empty">
        <div class="rbvp-empty-state-title">请选择或创建一个规则集</div>
        <div class="rbvp-empty-state-text">
          左侧用于管理规则集列表，右侧用于编辑名称、匹配类型和条目内容。
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Toast } from '@/core/toast'
import { TextArea, TextBox, VButton, VDropdown, VIcon } from '@/ui'
import {
  createRuleSetTransferPayload,
  hasUnsavedSelectedRuleSetChanges,
  parseImportedRuleSets,
} from './helpers'

export default Vue.extend({
  name: 'RBVPRuleSetsTab',
  components: {
    TextArea,
    TextBox,
    VButton,
    VDropdown,
    VIcon,
  },
  props: {
    state: {
      type: Object,
      required: true,
    },
  },
  methods: {
    updateSelectedRuleSetNameInput(value: string) {
      this.state.setSelectedRuleSetNameInput(value ?? '')
    },
    updateSelectedRuleSetEntries(value: string) {
      this.state.setSelectedRuleSetEntries(value ?? '')
    },
    updateSelectedRuleSetMatcherType(value: string) {
      this.state.setSelectedRuleSetMatcherType(value ?? 'UP')
    },
    updateRuleSetTransferText(value: string) {
      this.state.setRuleSetTransferText(value ?? '')
    },
    async copyRuleSetTransferText() {
      if (!this.state.ruleSetTransferText.trim()) {
        Toast.error('当前没有可复制的导出内容', 'RBVP', 3000)
        return
      }
      try {
        await navigator.clipboard.writeText(this.state.ruleSetTransferText)
        Toast.success('导出内容已复制到剪贴板', 'RBVP', 2000)
      } catch {
        Toast.error('复制失败，请手动复制文本内容', 'RBVP', 3000)
      }
    },
    downloadRuleSetExportFile() {
      if (!this.state.ruleSetTransferText.trim()) {
        Toast.error('当前没有可导出的文件内容', 'RBVP', 3000)
        return
      }
      const fileName =
        this.state.ruleSetTransferScope === 'current' && this.state.selectedRuleSetName
          ? `rbvp-rule-set-${this.state.selectedRuleSetName}.json`
          : 'rbvp-rule-sets.json'
      const blob = new Blob([this.state.ruleSetTransferText], {
        type: 'application/json;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      Toast.success('规则集文件已开始下载', 'RBVP', 2000)
    },
    triggerRuleSetFileImport() {
      const input = this.$refs.ruleSetFileInput as HTMLInputElement | undefined
      if (!input) {
        Toast.error('文件选择器不可用', 'RBVP', 3000)
        return
      }
      input.value = ''
      input.click()
    },
    async handleRuleSetFileChange(event: Event) {
      const input = event.target as HTMLInputElement | null
      const file = input?.files?.[0]
      if (!file) {
        return
      }
      try {
        this.state.setRuleSetTransferText(await file.text())
        Toast.success(`已读取文件 "${file.name}"`, 'RBVP', 2000)
      } catch {
        Toast.error('读取规则集文件失败', 'RBVP', 3000)
      } finally {
        if (input) {
          input.value = ''
        }
      }
    },
    hasUnsavedSelectedRuleSetChanges() {
      return hasUnsavedSelectedRuleSetChanges({
        selectedRuleSet: this.state.selectedRuleSet,
        selectedRuleSetName: this.state.selectedRuleSetName,
        selectedRuleSetNameInput: this.state.selectedRuleSetNameInput,
        selectedRuleSetEntries: this.state.selectedRuleSetEntries,
      })
    },
    closeRuleSetTransferPanel() {
      this.state.setRuleSetTransferMode('')
      this.state.setRuleSetTransferText('')
      this.state.setRuleSetTransferScope('all')
    },
    openRuleSetExport(scope: 'all' | 'current') {
      if (this.hasUnsavedSelectedRuleSetChanges()) {
        Toast.error('请先保存当前规则集后再导出', 'RBVP', 3000)
        return
      }
      try {
        const payload = createRuleSetTransferPayload({
          scope,
          selectedRuleSetName: this.state.selectedRuleSetName,
          selectedRuleSet: this.state.selectedRuleSet,
          localRuleSets: this.state.localRuleSets,
        })
        this.state.setRuleSetTransferMode('export')
        this.state.setRuleSetTransferScope(scope)
        this.state.setRuleSetTransferText(JSON.stringify(payload, null, 2))
      } catch (error) {
        Toast.error(error instanceof Error ? error.message : '导出规则集失败', 'RBVP', 3000)
      }
    },
    openRuleSetImport() {
      if (this.hasUnsavedSelectedRuleSetChanges()) {
        Toast.error('请先保存当前规则集后再导入', 'RBVP', 3000)
        return
      }
      this.state.setRuleSetTransferMode('import')
      this.state.setRuleSetTransferScope('all')
      this.state.setRuleSetTransferText('')
    },
    createRuleSet() {
      let name = 'new-rule-set'
      let index = 1
      while (this.state.localRuleSets[name]) {
        name = `new-rule-set-${index++}`
      }
      this.$set(this.state.localRuleSets, name, {
        matcherType: 'UP',
        entries: [],
      })
      this.selectRuleSet(name)
    },
    selectRuleSet(name: string) {
      this.state.setSelectedRuleSetName(name)
      this.state.setSelectedRuleSetNameInput(name)
      this.state.setSelectedRuleSetEntries(this.state.localRuleSets[name]?.entries.join('\n') ?? '')
    },
    saveRuleSet() {
      if (!this.state.selectedRuleSet) {
        return
      }
      const nextName = this.state.selectedRuleSetNameInput.trim()
      if (!nextName) {
        Toast.error('规则集名称不能为空', 'RBVP', 3000)
        return
      }
      if (nextName !== this.state.selectedRuleSetName && this.state.localRuleSets[nextName]) {
        Toast.error(`规则集 "${nextName}" 已存在`, 'RBVP', 3000)
        return
      }
      const entries = this.state.selectedRuleSetEntries
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line !== '')
      const nextRuleSet = {
        matcherType: this.state.selectedRuleSet.matcherType,
        entries,
      }
      if (nextName !== this.state.selectedRuleSetName) {
        this.$delete(this.state.localRuleSets, this.state.selectedRuleSetName)
      }
      this.$set(this.state.localRuleSets, nextName, nextRuleSet)
      this.state.setSelectedRuleSetName(nextName)
      this.state.persistLocalRuleSets()
      Toast.success('RBVP 本地规则集已保存', 'RBVP', 2000)
    },
    removeRuleSet() {
      if (!this.state.selectedRuleSetName) {
        return
      }
      const confirmed = confirm(`确认删除规则集 "${this.state.selectedRuleSetName}" 吗？`)
      if (!confirmed) {
        return
      }
      this.$delete(this.state.localRuleSets, this.state.selectedRuleSetName)
      this.state.persistLocalRuleSets()
      const nextName = Object.keys(this.state.localRuleSets)[0] ?? ''
      this.selectRuleSet(nextName)
      Toast.success('RBVP 本地规则集已删除', 'RBVP', 2000)
    },
    applyImportedRuleSets() {
      if (this.state.ruleSetTransferMode !== 'import') {
        return
      }
      try {
        const importedRuleSets = parseImportedRuleSets(
          this.state.ruleSetTransferText.trim(),
          this.state.matcherTypes,
        )
        Object.entries(importedRuleSets).forEach(([name, ruleSet]) => {
          this.$set(this.state.localRuleSets, name, ruleSet)
        })
        this.state.persistLocalRuleSets()
        const nextSelectedName =
          importedRuleSets[this.state.selectedRuleSetName] !== undefined
            ? this.state.selectedRuleSetName
            : Object.keys(importedRuleSets)[0]
        this.selectRuleSet(nextSelectedName)
        this.closeRuleSetTransferPanel()
        Toast.success(`已导入 ${Object.keys(importedRuleSets).length} 个规则集`, 'RBVP', 2000)
      } catch (error) {
        Toast.error(error instanceof Error ? error.message : '导入规则集失败', 'RBVP', 3000)
      }
    },
  },
})
</script>
<style lang="scss">
@import 'shared';

.rbvp-hidden-file-input {
  display: none;
}

.rbvp-rule-set-transfer {
  @extend %rbvp-card-base;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rbvp-rule-set-transfer-header,
.rbvp-rule-set-transfer-actions,
.rbvp-rule-set-actions {
  @extend %rbvp-flex-header;
}

.rbvp-rule-set-transfer-title {
  font-size: 13px;
  font-weight: 600;
}

.rbvp-rule-set-layout {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 12px;
}

.rbvp-rule-set-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 360px;
  overflow-y: auto;
  padding-right: 4px;
  overscroll-behavior: contain;
}

.rbvp-rule-set-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid #8884;
  background-color: transparent;
  color: inherit;
  border-radius: 6px;
  padding: 8px 10px;
  text-align: left;
  cursor: pointer;
  transition: 0.2s ease-out;

  &:hover {
    border-color: #8886;
    background-color: #8881;
  }

  &.active {
    border-color: var(--theme-color);
    background-color: var(--theme-color-10);
    color: var(--theme-color);
  }
}

.rbvp-rule-set-item-name {
  font-weight: 600;
  line-height: 1.4;
  word-break: break-word;
}

.rbvp-rule-set-item-meta {
  font-size: 12px;
  opacity: 0.72;
}

.rbvp-rule-set-editor {
  @extend %rbvp-card-base;
  @extend %rbvp-flex-col-12;
}

.rbvp-rule-set-empty {
  min-height: 320px;
}

@media (max-width: 900px) {
  .rbvp-rule-set-layout {
    grid-template-columns: 1fr;
  }

  .rbvp-rule-set-list {
    max-height: 220px;
  }

  .rbvp-rule-set-actions,
  .rbvp-rule-set-transfer-header,
  .rbvp-rule-set-transfer-actions {
    flex-wrap: wrap;
  }
}
</style>
