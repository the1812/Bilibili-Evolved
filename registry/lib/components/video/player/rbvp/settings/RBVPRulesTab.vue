<template>
  <div class="rbvp-section-content">
    <div class="rbvp-guide-card">
      <div class="rbvp-guide-title">主规则</div>
      <div class="rbvp-guide-text">
        可视化视图适合逐条整理规则顺序和内容，文本视图适合一次性快速编辑，上下文视图可查看当前匹配上下文，调试视图可查看最近一次匹配时的规则尝试路径。支持使用
        <code>RULE-SET</code> 引用本地规则集，也支持通过 <code>FINAL</code>
        指定兜底行为。
      </div>
    </div>
    <div class="rbvp-section-header">
      <div class="rbvp-section-title">主规则视图</div>
      <div class="rbvp-section-actions">
        <div class="rbvp-inline-tabs">
          <button
            type="button"
            class="rbvp-inline-tab"
            :class="{ active: state.ruleEditorMode === 'visual' }"
            @click="actions.setRuleEditorMode('visual')"
          >
            可视化视图
          </button>
          <button
            type="button"
            class="rbvp-inline-tab"
            :class="{ active: state.ruleEditorMode === 'text' }"
            @click="actions.setRuleEditorMode('text')"
          >
            文本视图
          </button>
          <button
            type="button"
            class="rbvp-inline-tab"
            :class="{ active: state.ruleEditorMode === 'context' }"
            @click="actions.setRuleEditorMode('context')"
          >
            上下文视图
          </button>
          <button
            type="button"
            class="rbvp-inline-tab"
            :class="{ active: state.ruleEditorMode === 'debug' }"
            @click="actions.setRuleEditorMode('debug')"
          >
            调试视图
          </button>
        </div>
      </div>
    </div>
    <div v-if="state.ruleEditorMode === 'visual'" class="rbvp-rules-editor">
      <div class="rbvp-rules-toolbar">
        <div class="rbvp-rules-toolbar-meta">
          <span>共 {{ state.visualRules.length }} 条规则</span>
          <span>可通过移动按钮调整优先级，越靠上越先匹配</span>
        </div>
        <div class="rbvp-rules-toolbar-actions">
          <div class="rbvp-rules-toolbar-primary">
            <VButton
              :type="state.hasUnsavedRulesChanges ? 'primary' : undefined"
              @click="actions.saveRules()"
            >
              保存主规则
            </VButton>
          </div>
          <div class="rbvp-rule-create-actions">
            <VButton @click="expandAllRules()">全部展开</VButton>
            <VButton @click="collapseAllRules()">全部收起</VButton>
            <VButton @click="actions.insertBasicRule(0)">新增基础匹配</VButton>
            <VButton @click="actions.insertLogicRule(0)">新增逻辑组合</VButton>
          </div>
        </div>
      </div>
      <div v-if="state.visualRules.length === 0" class="rbvp-empty-state rbvp-rules-empty">
        <div class="rbvp-empty-state-title">还没有主规则</div>
        <div class="rbvp-empty-state-text">
          可以先新增一条规则，或切到文本视图批量粘贴已有规则。
        </div>
      </div>
      <div v-else class="rbvp-rule-cards">
        <div v-for="(rule, index) in state.visualRules" :key="rule.id" class="rbvp-rule-card">
          <div class="rbvp-rule-card-header">
            <div class="rbvp-rule-card-title-area">
              <div
                class="rbvp-rule-card-type"
                :class="{
                  logic: rule.matcher.matcherKind === 'logic',
                  basic: rule.matcher.matcherKind === 'basic',
                }"
              >
                {{ rule.matcher.matcherKind === 'logic' ? '逻辑组合' : '基础匹配' }}
              </div>
              <div v-if="rule.editingTitle" class="rbvp-rule-card-title-edit">
                <input
                  ref="titleInputs"
                  v-model.trim="rule.title"
                  class="rbvp-input rbvp-rule-title-input"
                  :placeholder="`第 ${toRuleIndex(index) + 1} 条`"
                  @blur="finishRuleTitleEdit(rule)"
                  @keydown.enter.prevent="finishRuleTitleEdit(rule)"
                  @keydown.esc.prevent="cancelRuleTitleEdit(rule)"
                />
              </div>
              <div v-else class="rbvp-rule-card-index">
                {{ getRuleDisplayTitle(rule, toRuleIndex(index)) }}
              </div>
              <button
                v-if="!rule.editingTitle"
                type="button"
                class="rbvp-icon-button rbvp-rule-title-button"
                title="编辑标题"
                @click="startRuleTitleEdit(rule)"
              >
                <VIcon icon="mdi-pencil" :size="16" />
              </button>
            </div>
            <div class="rbvp-rule-card-actions">
              <button
                type="button"
                class="rbvp-icon-button"
                :title="rule.collapsed ? '展开规则' : '收起规则'"
                @click="toggleRuleCollapsed(rule)"
              >
                <VIcon :icon="rule.collapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'" :size="16" />
              </button>
              <button
                type="button"
                class="rbvp-icon-button"
                title="上移"
                @click="moveRule(toRuleIndex(index), -1)"
              >
                <VIcon icon="mdi-arrow-up" :size="16" />
              </button>
              <button
                type="button"
                class="rbvp-icon-button"
                title="下移"
                @click="moveRule(toRuleIndex(index), 1)"
              >
                <VIcon icon="mdi-arrow-down" :size="16" />
              </button>
              <button
                type="button"
                class="rbvp-icon-button"
                title="在下方新增"
                @click="togglePendingInsertIndex(toRuleIndex(index) + 1)"
              >
                <VIcon icon="mdi-plus" :size="16" />
              </button>
              <button
                type="button"
                class="rbvp-icon-button danger"
                title="删除规则"
                @click="removeVisualRule(toRuleIndex(index))"
              >
                <VIcon icon="mdi-delete-outline" :size="16" />
              </button>
            </div>
          </div>
          <div v-if="rule.collapsed" class="rbvp-rule-card-collapsed">
            <div class="rbvp-rule-card-preview">{{ formatVisualRule(rule) }}</div>
          </div>
          <div v-else-if="rule.matcher.matcherKind === 'basic'" class="rbvp-rule-basic-editor">
            <div class="rbvp-rule-card-body">
              <label class="rbvp-field">
                <span class="rbvp-field-label">规则类型</span>
                <VDropdown
                  v-model="rule.matcher.matcherType"
                  :items="state.visualMatcherTypes"
                  :key-mapper="item => item"
                  @change="newType => handleBasicMatcherTypeChange(rule.matcher, newType)"
                >
                  <template #item="{ item }">{{ item }}</template>
                </VDropdown>
              </label>
              <label v-if="needsMatcherArgument(rule.matcher)" class="rbvp-field">
                <span class="rbvp-field-label">匹配参数</span>
                <VDropdown
                  v-if="rule.matcher.matcherType === 'RULE-SET'"
                  v-model="rule.matcher.matcherArgument"
                  :items="state.ruleSetNames"
                  :key-mapper="item => item"
                  :disabled="state.ruleSetNames.length === 0"
                >
                  <template #item="{ item }">{{ item }}</template>
                </VDropdown>
                <TextBox
                  v-else
                  v-model="rule.matcher.matcherArgument"
                  :validator="v => v.trim()"
                  :placeholder="getMatcherArgumentPlaceholder(rule.matcher.matcherType)"
                />
              </label>
              <label class="rbvp-field">
                <span class="rbvp-field-label">执行动作</span>
                <TextBox
                  v-model="rule.actions"
                  :validator="v => v.trim()"
                  placeholder="rememberVideoSpeed:1"
                />
              </label>
            </div>
          </div>
          <RBVPLogicConditionEditor
            v-else
            v-model="rule.matcher"
            :default-matcher-arguments="state.defaultMatcherArguments"
            :rule-set-names="state.ruleSetNames"
            :visual-matcher-types="state.visualMatcherTypes"
            :logic-matcher-types="state.logicMatcherTypes"
          />
          <div
            v-if="!rule.collapsed && state.pendingInsertIndex === toRuleIndex(index) + 1"
            class="rbvp-rule-insert"
          >
            <button
              type="button"
              class="rbvp-rule-choice"
              @click="actions.insertBasicRule(toRuleIndex(index) + 1)"
            >
              新增基础匹配
            </button>
            <button
              type="button"
              class="rbvp-rule-choice"
              @click="actions.insertLogicRule(toRuleIndex(index) + 1)"
            >
              新增逻辑组合
            </button>
            <button
              type="button"
              class="rbvp-rule-choice-cancel"
              @click="actions.setPendingInsertIndex(null)"
            >
              取消
            </button>
          </div>
          <div
            v-if="!rule.collapsed && rule.matcher.matcherKind === 'logic'"
            class="rbvp-rule-card-body rbvp-rule-card-body-actions"
          >
            <label class="rbvp-field">
              <span class="rbvp-field-label">执行动作</span>
              <TextBox
                v-model="rule.actions"
                :validator="v => v.trim()"
                placeholder="rememberVideoSpeed:1"
              />
            </label>
          </div>
          <div v-if="!rule.collapsed" class="rbvp-rule-card-hint">
            {{ getMatcherHint(rule.matcher) }}
          </div>
          <div v-if="!rule.collapsed" class="rbvp-rule-card-preview">
            {{ formatVisualRule(rule) }}
          </div>
        </div>
      </div>
    </div>
    <RBVPTextTab v-else-if="state.ruleEditorMode === 'text'" :state="state" :actions="actions" />
    <RBVPContextTab v-else-if="state.ruleEditorMode === 'context'" :state="state" />
    <RBVPDebugTab v-else :state="state" />
  </div>
</template>
<script lang="ts">
import { TextBox, VButton, VDropdown, VIcon } from '@/ui'
import RBVPContextTab from './RBVPContextTab.vue'
import RBVPDebugTab from './RBVPDebugTab.vue'
import {
  formatVisualRule,
  getMatcherArgumentPlaceholder,
  getMatcherHint,
  getRuleDisplayTitle,
  needsMatcherArgument,
  type VisualRuleItem,
} from './helpers'
import RBVPLogicConditionEditor from './RBVPLogicConditionEditor.vue'
import RBVPTextTab from './RBVPTextTab.vue'

export default Vue.extend({
  name: 'RBVPRulesTab',
  components: {
    RBVPContextTab,
    RBVPDebugTab,
    RBVPLogicConditionEditor,
    RBVPTextTab,
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
    actions: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatVisualRule,
    getMatcherArgumentPlaceholder,
    getMatcherHint,
    getRuleDisplayTitle,
    needsMatcherArgument,
    toRuleIndex(index: string | number) {
      return Number(index)
    },
    handleBasicMatcherTypeChange(
      condition: { matcherType: string; matcherArgument: string },
      type: string,
    ) {
      condition.matcherArgument = this.state.defaultMatcherArguments[type] ?? ''
    },
    startRuleTitleEdit(rule: VisualRuleItem) {
      rule.editingTitle = true
      this.$nextTick(() => {
        const inputs = this.$refs.titleInputs as HTMLInputElement[] | HTMLInputElement | undefined
        const input = Array.isArray(inputs)
          ? inputs.find(it => it?.value === rule.title) ?? inputs[0]
          : inputs
        input?.focus()
        input?.select()
      })
    },
    finishRuleTitleEdit(rule: VisualRuleItem) {
      rule.title = rule.title.trim()
      rule.editingTitle = false
    },
    cancelRuleTitleEdit(rule: VisualRuleItem) {
      rule.title = rule.title.trim()
      rule.editingTitle = false
    },
    moveRule(index: number, offset: number) {
      const nextIndex = index + offset
      if (nextIndex < 0 || nextIndex >= this.state.visualRules.length) {
        return
      }
      const nextRules = [...this.state.visualRules]
      const [rule] = nextRules.splice(index, 1)
      nextRules.splice(nextIndex, 0, rule)
      this.actions.setVisualRules(nextRules)
    },
    toggleRuleCollapsed(rule: VisualRuleItem) {
      rule.collapsed = !rule.collapsed
    },
    removeVisualRule(index: number) {
      const nextRules = [...this.state.visualRules]
      nextRules.splice(index, 1)
      this.actions.setVisualRules(nextRules)
      if (this.state.pendingInsertIndex === index || this.state.pendingInsertIndex === index + 1) {
        this.actions.setPendingInsertIndex(null)
      }
    },
    expandAllRules() {
      this.actions.setVisualRules(
        this.state.visualRules.map((rule: VisualRuleItem) => ({ ...rule, collapsed: false })),
      )
    },
    collapseAllRules() {
      this.actions.setVisualRules(
        this.state.visualRules.map((rule: VisualRuleItem) => ({ ...rule, collapsed: true })),
      )
      this.actions.setPendingInsertIndex(null)
    },
    togglePendingInsertIndex(index: number) {
      this.actions.setPendingInsertIndex(this.state.pendingInsertIndex === index ? null : index)
    },
  },
})
</script>
<style lang="scss">
@import 'shared';

.rbvp-inline-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rbvp-inline-tab {
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  background-color: #8881;
  color: inherit;
  cursor: pointer;
  transition: 0.2s ease-out;

  &:hover {
    background-color: #8882;
  }

  &.active {
    background-color: var(--theme-color-20);
    color: var(--theme-color);
    box-shadow: 0 0 0 1px var(--theme-color-40);
  }
}

.rbvp-rules-toolbar {
  @extend %rbvp-card-base;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.rbvp-rules-toolbar-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1.5;
  opacity: 0.78;
}

.rbvp-rules-toolbar-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.rbvp-rules-toolbar-primary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rbvp-rule-cards {
  @extend %rbvp-flex-col-12;
}

.rbvp-rule-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 1px solid #8883;
  border-radius: 10px;
  background-color: #8881;
  transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out, background-color 0.2s ease-out;
}

.rbvp-rule-card-header {
  @extend %rbvp-flex-header;
}

.rbvp-rule-card-title-area {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  &:hover {
    .rbvp-rule-title-button {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

.rbvp-rule-card-type {
  padding: 4px 8px;
  border-radius: 999px;
  background-color: #8882;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;

  &.logic {
    background-color: var(--theme-color-10);
    color: var(--theme-color);
  }

  &.basic {
    background-color: rgb(127 127 127 / 14%);
    color: inherit;
  }
}

.rbvp-rule-card-index {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--theme-color);
}

.rbvp-rule-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rbvp-rule-card-title-edit,
.rbvp-rule-title-input {
  min-width: 220px;
}

.rbvp-rule-title-button {
  opacity: 0;
  pointer-events: none;
}

.rbvp-rule-card-body {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.rbvp-rule-card-body-actions {
  grid-template-columns: 1fr;
}

.rbvp-rule-basic-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rbvp-rule-basic-editor .rbvp-rule-card-body {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.rbvp-rule-card-collapsed {
  display: flex;
  flex-direction: column;
}

.rbvp-rule-card-preview {
  padding: 10px 12px;
  border-radius: 8px;
  background-color: rgb(127 127 127 / 8%);
  font-family: consolas, 'Courier New', monospace;
  line-height: 1.5;
  word-break: break-word;
}

.rbvp-rule-card-hint {
  padding: 10px 12px;
  border-radius: 8px;
  background-color: var(--theme-color-10);
  color: var(--theme-color);
  line-height: 1.6;
}

.rbvp-rule-insert {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background-color: rgb(127 127 127 / 8%);
}

.rbvp-rule-choice,
.rbvp-rule-choice-cancel {
  @extend %rbvp-btn-pill;
}

.rbvp-rules-empty {
  min-height: 180px;
}

@media (max-width: 900px) {
  .rbvp-rules-toolbar,
  .rbvp-rule-card-header,
  .rbvp-rule-create-actions,
  .rbvp-rule-insert {
    flex-wrap: wrap;
  }

  .rbvp-rule-card-body {
    grid-template-columns: 1fr;
  }
}
</style>
