<template>
  <VPopup
    :open="popupOpen"
    fixed
    auto-destroy
    class="rbvp-settings-popup be-settings-extra-options"
    :trigger-element="triggerElement"
    @popup-change="handlePopupChange"
  >
    <div class="rbvp-settings">
      <div class="rbvp-settings-header">
        <div class="rbvp-settings-title">
          <VIcon icon="mdi-tune" :size="18" />
          RBVP 设置
        </div>
        <div class="rbvp-settings-close" title="关闭">
          <VIcon :size="18" icon="close" @click="requestClosePopup()" />
        </div>
      </div>
      <div class="rbvp-settings-content">
        <div class="rbvp-tabs">
          <button
            type="button"
            class="rbvp-tab"
            :class="{ active: selectedTab === 'rules' }"
            @click="selectedTab = 'rules'"
          >
            <VIcon icon="mdi-file-document-edit-outline" :size="18" />
            <span class="rbvp-tab-label">规则</span>
          </button>
          <button
            type="button"
            class="rbvp-tab"
            :class="{ active: selectedTab === 'ruleSets' }"
            @click="selectedTab = 'ruleSets'"
          >
            <VIcon icon="mdi-folder-cog-outline" :size="18" />
            <span class="rbvp-tab-label">规则集</span>
          </button>
          <button
            type="button"
            class="rbvp-tab"
            :class="{ active: selectedTab === 'namespaces' }"
            @click="selectedTab = 'namespaces'"
          >
            <VIcon icon="mdi-lan-connect" :size="18" />
            <span class="rbvp-tab-label">命名空间</span>
          </button>
        </div>

        <div class="rbvp-section">
          <RBVPRulesTab
            v-if="selectedTab === 'rules'"
            :state="rulesTabState"
            :actions="rulesTabActions"
          />
          <RBVPNamespacesTab
            v-else-if="selectedTab === 'namespaces'"
            :state="namespacesTabState"
            :actions="namespacesTabActions"
          />
          <RBVPRuleSetsTab v-else :state="ruleSetsTabState" />
        </div>
      </div>
    </div>
  </VPopup>
</template>
<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { Toast } from '@/core/toast'
import { VIcon, VPopup } from '@/ui'
import RBVPNamespacesTab from './RBVPNamespacesTab.vue'
import RBVPRuleSetsTab from './RBVPRuleSetsTab.vue'
import RBVPRulesTab from './RBVPRulesTab.vue'
import { parseRbvpRules } from '../parser'
import {
  createBasicRule,
  createInitialRuleEditorState,
  createLogicRule,
  createMatcherDefaultArguments,
  parseVisualRulesFromText,
  stringifyVisualRules,
  type RBVPMatcherDefaultArguments,
  type RuleEditorMode,
  type VisualConditionItem,
} from './helpers'
import type { Options } from '..'
import { rbvpNamespaces } from '../registry'
import type {
  RBVPBasicMatcherType,
  RBVPDebugContextSnapshot,
  RBVPDebugSnapshot,
  RBVPLogicMatcherType,
  RBVPNamespaceDebugInfo,
  RBVPNamespaceProvider,
  RBVPLocalRuleSetMap,
  RBVPRuleSetMatcherType,
} from '../types'

const rbvpOptions = getComponentSettings<Options>('rbvp').options
const matcherTypes: RBVPRuleSetMatcherType[] = [
  'BVID',
  'AID',
  'SECTION',
  'SECTION-ROOT',
  'SECTION-NAME',
  'SECTION-ROOT-NAME',
  'UP',
  'TAG',
  'TAG-MUSIC',
  'PARTITION',
  'TITLE',
  'PART',
]
const visualMatcherTypes: RBVPBasicMatcherType[] = [
  'BVID',
  'AID',
  'SECTION',
  'SECTION-ROOT',
  'SECTION-NAME',
  'SECTION-ROOT-NAME',
  'UP',
  'TAG',
  'TAG-MUSIC',
  'PARTITION',
  'TITLE',
  'PART',
  'TIME',
  'RULE-SET',
  'FINAL',
]
const logicMatcherTypes: RBVPLogicMatcherType[] = ['AND', 'OR', 'NOT']

type RuleSetTransferMode = '' | 'import' | 'export'
type RBVPNamespaceItem = {
  name: string
  provider: RBVPNamespaceProvider
  displayName: string
  description: string
  aliases: string[]
  takeoverSupported: boolean
  takeoverState: boolean
}

export default Vue.extend({
  components: {
    RBVPNamespacesTab,
    RBVPRuleSetsTab,
    RBVPRulesTab,
    VIcon,
    VPopup,
  },
  props: {
    triggerElement: {
      type: HTMLElement,
      default: null,
    },
  },
  data() {
    const localRuleSets = lodash.cloneDeep(rbvpOptions.localRuleSets) as RBVPLocalRuleSetMap
    const firstRuleSetName = Object.keys(localRuleSets)[0] ?? ''
    const { rulesText } = rbvpOptions
    const initialRuleEditorState = createInitialRuleEditorState(rulesText)
    return {
      popupOpen: false,
      selectedTab: 'rules' as 'rules' | 'ruleSets' | 'namespaces',
      rulesText,
      ruleEditorMode: initialRuleEditorState.ruleEditorMode,
      visualRules: initialRuleEditorState.visualRules,
      pendingInsertIndex: null as null | number,
      localRuleSets,
      matcherTypes,
      visualMatcherTypes,
      logicMatcherTypes,
      selectedRuleSetName: firstRuleSetName,
      selectedRuleSetNameInput: firstRuleSetName,
      selectedRuleSetEntries: firstRuleSetName
        ? localRuleSets[firstRuleSetName].entries.join('\n')
        : '',
      ruleSetTransferMode: '' as RuleSetTransferMode,
      ruleSetTransferText: '',
      ruleSetTransferScope: 'all' as 'all' | 'current',
      namespaceStateVersion: 0,
      beforeUnloadGuardActive: false,
    }
  },
  computed: {
    ruleSetNames() {
      return Object.keys(this.localRuleSets)
    },
    selectedRuleSet() {
      return this.localRuleSets[this.selectedRuleSetName] ?? null
    },
    lastMatchInfoText() {
      return rbvpOptions.lastMatchInfo || '暂无匹配记录'
    },
    debugSnapshot(): RBVPDebugSnapshot | null {
      const text = rbvpOptions.lastDebugInfo?.trim()
      if (!text) {
        return null
      }
      try {
        return JSON.parse(text) as RBVPDebugSnapshot
      } catch {
        return null
      }
    },
    debugSnapshotSummary() {
      if (!this.debugSnapshot) {
        return '暂无调试记录'
      }
      return this.debugSnapshot.status === 'error'
        ? `最近一次匹配失败: ${this.debugSnapshot.message}`
        : `最近一次匹配结果: ${this.debugSnapshot.message}`
    },
    debugNamespaces(): RBVPNamespaceDebugInfo[] {
      return this.debugSnapshot?.namespaces ?? []
    },
    debugContext(): RBVPDebugContextSnapshot | null {
      return this.debugSnapshot?.context ?? null
    },
    defaultMatcherArguments(): RBVPMatcherDefaultArguments {
      return createMatcherDefaultArguments(this.debugContext, this.ruleSetNames)
    },
    normalizedSavedRulesText() {
      try {
        return stringifyVisualRules(parseVisualRulesFromText(rbvpOptions.rulesText))
      } catch {
        return rbvpOptions.rulesText
      }
    },
    hasUnsavedRulesChanges() {
      if (this.ruleEditorMode === 'visual') {
        return stringifyVisualRules(this.visualRules) !== this.normalizedSavedRulesText
      }
      return this.rulesText !== this.normalizedSavedRulesText
    },
    rulesTabState() {
      return {
        ruleEditorMode: this.ruleEditorMode,
        visualRules: this.visualRules,
        pendingInsertIndex: this.pendingInsertIndex,
        ruleSetNames: this.ruleSetNames,
        defaultMatcherArguments: this.defaultMatcherArguments,
        visualMatcherTypes: this.visualMatcherTypes,
        logicMatcherTypes: this.logicMatcherTypes,
        rulesText: this.rulesText,
        lastMatchInfoText: this.lastMatchInfoText,
        debugSnapshotSummary: this.debugSnapshotSummary,
        hasUnsavedRulesChanges: this.hasUnsavedRulesChanges,
        debugContext: this.debugContext,
        debugNamespaces: this.debugNamespaces,
      }
    },
    rulesTabActions() {
      return {
        setRuleEditorMode: (mode: RuleEditorMode) => this.setRuleEditorMode(mode),
        saveRules: () => this.saveRules(),
        insertBasicRule: (index: number) => this.insertBasicRule(index),
        insertLogicRule: (index: number) => this.insertLogicRule(index),
        setPendingInsertIndex: (value: number | null) => {
          this.pendingInsertIndex = value
        },
        setVisualRules: (value: typeof this.visualRules) => {
          this.visualRules = value
        },
        setRulesText: (value: string) => {
          this.rulesText = value
        },
      }
    },
    ruleSetsTabState() {
      return {
        ruleSetNames: this.ruleSetNames,
        localRuleSets: this.localRuleSets,
        selectedRuleSetName: this.selectedRuleSetName,
        selectedRuleSetNameInput: this.selectedRuleSetNameInput,
        selectedRuleSetEntries: this.selectedRuleSetEntries,
        selectedRuleSet: this.selectedRuleSet,
        matcherTypes: this.matcherTypes,
        ruleSetTransferMode: this.ruleSetTransferMode,
        ruleSetTransferScope: this.ruleSetTransferScope,
        ruleSetTransferText: this.ruleSetTransferText,
        setSelectedRuleSetName: (value: string) => {
          this.selectedRuleSetName = value
        },
        setSelectedRuleSetNameInput: (value: string) => {
          this.selectedRuleSetNameInput = value
        },
        setSelectedRuleSetEntries: (value: string) => {
          this.selectedRuleSetEntries = value
        },
        setSelectedRuleSetMatcherType: (value: RBVPRuleSetMatcherType) => {
          if (this.selectedRuleSet) {
            this.$set(this.selectedRuleSet, 'matcherType', value)
          }
        },
        setRuleSetTransferText: (value: string) => {
          this.ruleSetTransferText = value
        },
        setRuleSetTransferMode: (value: RuleSetTransferMode) => {
          this.ruleSetTransferMode = value
        },
        setRuleSetTransferScope: (value: 'all' | 'current') => {
          this.ruleSetTransferScope = value
        },
        persistLocalRuleSets: () => this.persistLocalRuleSets(),
      }
    },
    namespacesTabState() {
      return {
        namespaceItems: this.namespaceItems,
      }
    },
    namespacesTabActions() {
      return {
        toggleNamespaceTakeover: (item: RBVPNamespaceItem) => this.toggleNamespaceTakeover(item),
      }
    },
    namespaceItems(): RBVPNamespaceItem[] {
      this.namespaceStateVersion
      return Object.entries(rbvpNamespaces).map(([name, provider]) => ({
        name: provider.primaryName || name,
        provider,
        displayName: provider.displayName || provider.primaryName || name,
        description: provider.description?.trim() || '暂无描述',
        aliases: provider.aliases ?? [],
        takeoverSupported: Boolean(provider.getTakeoverState && provider.setTakeoverState),
        takeoverState: provider.getTakeoverState?.() ?? false,
      }))
    },
  },
  watch: {
    popupOpen(value: boolean) {
      this.updateBeforeUnloadGuard()
      if (value) {
        this.refreshNamespaceState()
        return
      }
      if (!value) {
        this.$nextTick(() => {
          const activeElement = document.activeElement as HTMLElement | null
          const popupElement = this.$el as HTMLElement | undefined
          if (activeElement && popupElement?.contains(activeElement)) {
            activeElement.blur()
          }
        })
      }
    },
    hasUnsavedRulesChanges() {
      this.updateBeforeUnloadGuard()
    },
  },
  beforeDestroy() {
    this.removeBeforeUnloadGuard()
  },
  methods: {
    handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!this.popupOpen || !this.hasUnsavedRulesChanges) {
        return
      }
      event.preventDefault()
      event.returnValue = ''
    },
    updateBeforeUnloadGuard() {
      if (this.popupOpen && this.hasUnsavedRulesChanges) {
        if (!this.beforeUnloadGuardActive) {
          window.addEventListener('beforeunload', this.handleBeforeUnload)
          this.beforeUnloadGuardActive = true
        }
        return
      }
      this.removeBeforeUnloadGuard()
    },
    removeBeforeUnloadGuard() {
      if (!this.beforeUnloadGuardActive) {
        return
      }
      window.removeEventListener('beforeunload', this.handleBeforeUnload)
      this.beforeUnloadGuardActive = false
    },
    resetMainRulesEditor() {
      const savedRulesText = rbvpOptions.rulesText
      const initialRuleEditorState = createInitialRuleEditorState(savedRulesText)
      this.rulesText = savedRulesText
      this.visualRules = initialRuleEditorState.visualRules
      this.ruleEditorMode = initialRuleEditorState.ruleEditorMode
      this.pendingInsertIndex = null
    },
    confirmCloseWithUnsavedRules() {
      if (!this.hasUnsavedRulesChanges) {
        return true
      }
      return confirm('主规则尚未保存，确认关闭 RBVP 设置吗？')
    },
    handlePopupChange(value: boolean) {
      if (value) {
        this.popupOpen = true
        return
      }
      this.requestClosePopup()
    },
    requestClosePopup() {
      if (!this.confirmCloseWithUnsavedRules()) {
        return
      }
      this.resetMainRulesEditor()
      this.popupOpen = false
    },
    refreshNamespaceState() {
      this.namespaceStateVersion++
    },
    toggleNamespaceTakeover(item: RBVPNamespaceItem) {
      if (!item.provider.getTakeoverState || !item.provider.setTakeoverState) {
        return
      }
      try {
        const nextValue = !item.provider.getTakeoverState()
        item.provider.setTakeoverState(nextValue)
        this.refreshNamespaceState()
        Toast.success(
          `${item.displayName} 已${nextValue ? '交由' : '取消交由'} RBVP 接管`,
          'RBVP',
          2000,
        )
      } catch (error) {
        Toast.error(
          error instanceof Error ? error.message : `切换 ${item.displayName} 接管状态失败`,
          'RBVP',
          3000,
        )
      }
    },
    syncRulesTextFromVisualRules() {
      this.rulesText = stringifyVisualRules(this.visualRules)
    },
    syncVisualRulesFromText() {
      this.visualRules = parseVisualRulesFromText(this.rulesText)
    },
    setRuleEditorMode(mode: RuleEditorMode) {
      if (mode === this.ruleEditorMode) {
        return
      }
      if (mode === 'text' || mode === 'context' || mode === 'debug') {
        this.syncRulesTextFromVisualRules()
        this.ruleEditorMode = mode
        return
      }
      try {
        this.syncVisualRulesFromText()
        this.ruleEditorMode = mode
      } catch (error) {
        Toast.error(error instanceof Error ? error.message : '无法切换到可视化视图', 'RBVP', 3000)
      }
    },
    insertBasicRule(index: number) {
      this.visualRules.splice(index, 0, createBasicRule(this.defaultMatcherArguments))
      this.pendingInsertIndex = null
    },
    insertLogicRule(index: number) {
      this.visualRules.splice(index, 0, createLogicRule(this.defaultMatcherArguments))
      this.pendingInsertIndex = null
    },
    persistLocalRuleSets() {
      rbvpOptions.localRuleSets = lodash.cloneDeep(this.localRuleSets)
    },
    validateCondition(condition: VisualConditionItem, path: string): string | null {
      if (condition.matcherKind === 'basic') {
        if (condition.matcherType !== 'FINAL' && !condition.matcherArgument.trim()) {
          return `${path} 还没有填写匹配参数`
        }
        return null
      }
      if (condition.conditions.length === 0) {
        return `${path} 至少需要一个子条件`
      }
      if (condition.logicOperator === 'NOT' && condition.conditions.length !== 1) {
        return `${path} 的 NOT 组合必须且只能包含一个子条件`
      }
      for (const [index, child] of condition.conditions.entries()) {
        const error = this.validateCondition(child, `${path} / 子条件 ${index + 1}`)
        if (error) {
          return error
        }
      }
      return null
    },
    saveRules() {
      if (this.ruleEditorMode === 'visual') {
        for (const [index, rule] of this.visualRules.entries()) {
          const conditionError = this.validateCondition(rule.matcher, `第 ${index + 1} 条规则`)
          if (conditionError) {
            Toast.error(conditionError, 'RBVP', 3000)
            return
          }
          if (!rule.actions.trim()) {
            Toast.error(`第 ${index + 1} 条规则还没有填写执行动作`, 'RBVP', 3000)
            return
          }
        }
        this.syncRulesTextFromVisualRules()
      }
      try {
        parseRbvpRules(this.rulesText)
      } catch (error) {
        Toast.error(error instanceof Error ? error.message : '主规则解析失败', 'RBVP', 3000)
        return
      }
      try {
        this.syncVisualRulesFromText()
      } catch {
        // 文本已经过解析校验，这里理论上不会失败；忽略以避免影响保存流程。
      }
      rbvpOptions.rulesText = this.rulesText
      Toast.success('RBVP 主规则已保存', 'RBVP', 2000)
    },
  },
})
</script>
<style lang="scss">
@import 'common';
@import 'shared';

.rbvp-settings-popup {
  @include popup();
  transition: 0.2s ease-out;
  width: 760px;
  height: 70vh;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%) scale(0.95);
  display: flex;
  flex-direction: column;
  z-index: 100002;
  padding: 0;
  border: none;
  @include default-background-color();
  @include shadow();
  @include round-corner(8px);

  &.open {
    transform: translateX(-50%) translateY(-50%) scale(1);
  }
}

.rbvp-settings {
  font-size: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  padding: 12px 12px 0 18px;
}

.rbvp-settings-header {
  @extend %rbvp-flex-header;
  margin-bottom: 8px;
}

.rbvp-settings-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;

  .be-icon {
    margin-right: -2px;
  }
}

.rbvp-settings-close {
  display: flex;
  padding: 6px;
  cursor: pointer;
  transition: 0.2s ease-out;

  &:hover {
    color: var(--theme-color);
  }
}

.rbvp-settings-content {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  flex: 1;
  min-height: 0;
  gap: 12px;
  padding: 0 0 12px 0;
}

.rbvp-tabs {
  display: flex;
  flex-direction: column;
  flex: 0 0 92px;
  gap: 8px;
}

.rbvp-tab {
  border: none;
  border-radius: 12px;
  min-height: 72px;
  padding: 10px 8px;
  background-color: #8881;
  color: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease-out, box-shadow 0.2s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;

  &:hover {
    background-color: #8882;
  }

  &.active {
    background-color: var(--theme-color-20);
    box-shadow: 0 0 0 1px var(--theme-color-40);
    color: var(--theme-color);
  }
}

.rbvp-tab-label {
  line-height: 1.3;
}

.rbvp-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
  gap: 12px;
  overflow: auto;
  padding-right: 6px;
}

.rbvp-section-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 12px;
}

.rbvp-guide-card,
.rbvp-status-card,
.rbvp-empty-state {
  @extend %rbvp-card-base;
}

.rbvp-guide-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rbvp-guide-title,
.rbvp-status-card-label {
  font-size: 13px;
  font-weight: 600;
}

.rbvp-guide-text,
.rbvp-field-hint,
.rbvp-empty-state-text {
  @extend %rbvp-hint-text;
}

.rbvp-guide-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--theme-color);
  font-weight: 500;
}

.rbvp-section-header {
  @extend %rbvp-flex-header;
}

.rbvp-section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rbvp-section-title {
  font-size: 13px;
  font-weight: 600;
}

.rbvp-rules-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rbvp-icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background-color: #8881;
  color: inherit;
  cursor: pointer;
  transition: 0.2s ease-out;

  &:hover {
    background-color: #8882;
    color: var(--theme-color);
  }

  &.danger:hover {
    color: #d14343;
  }
}

.rbvp-textarea,
.rbvp-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #8884;
  border-radius: 6px;
  background-color: rgb(255 255 255 / 72%);
  color: inherit;
  padding: 8px 10px;
  font: inherit;
  transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out, background-color 0.2s ease-out;

  @extend %rbvp-dark-input-bg;

  &:focus,
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 1px var(--theme-color-40);
    border-color: var(--theme-color);
  }
}

.rbvp-textarea {
  resize: vertical;
  min-height: 160px;
  line-height: 1.6;
}

.rbvp-field {
  @extend %rbvp-form-field;
}

.rbvp-field-label,
.rbvp-empty-state-title {
  font-size: 13px;
  font-weight: 600;
}

.rbvp-empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 132px;
}

.rbvp-status-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rbvp-status-card-value {
  line-height: 1.6;
  word-break: break-word;
}

@media (max-width: 900px) {
  .rbvp-settings-popup {
    width: min(760px, calc(100vw - 24px));
  }

  .rbvp-settings-content {
    gap: 10px;
  }

  .rbvp-tabs {
    flex-basis: 80px;
  }

  .rbvp-tab {
    min-height: 64px;
    padding: 8px 6px;
  }

  .rbvp-guide-meta,
  .rbvp-section-header,
  .rbvp-section-actions,
  .rbvp-rule-create-actions {
    flex-wrap: wrap;
  }
}
</style>
