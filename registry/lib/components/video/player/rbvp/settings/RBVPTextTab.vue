<template>
  <div class="rbvp-rules-editor">
    <input
      ref="ruleFileInput"
      type="file"
      class="rbvp-hidden-file-input"
      accept=".txt,text/plain"
      @change="handleRuleFileChange"
    />
    <div class="rbvp-rules-toolbar">
      <div class="rbvp-rules-toolbar-meta">
        <span>文本视图保留逐行编辑能力</span>
        <span>切回可视化视图时会重新解析当前文本</span>
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
          <VButton @click="actions.exportRules()">导出主规则</VButton>
          <VButton @click="triggerRuleFileImport()">导入主规则</VButton>
        </div>
      </div>
    </div>
    <TextArea
      :text="state.rulesText"
      class="rbvp-textarea"
      rows="12"
      placeholder="示例:&#10;UP, 123456, rememberVideoSpeed:1.5&#10;TAG, 教程, rememberVideoSpeed:MAX&#10;RULE-SET, study-list, rememberVideoSpeed:MEMORY_LOCAL&#10;FINAL, rememberVideoSpeed:MIN"
      @change="updateRulesText"
    />
  </div>
</template>
<script lang="ts">
import { Toast } from '@/core/toast'
import { TextArea, VButton } from '@/ui'

export default Vue.extend({
  name: 'RBVPTextTab',
  components: {
    TextArea,
    VButton,
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
    updateRulesText(value: string) {
      this.actions.setRulesText(value ?? '')
    },
    triggerRuleFileImport() {
      const input = this.$refs.ruleFileInput as HTMLInputElement | undefined
      if (!input) {
        Toast.error('文件选择器不可用', 'RBVP', 3000)
        return
      }
      input.value = ''
      input.click()
    },
    async handleRuleFileChange(event: Event) {
      const input = event.target as HTMLInputElement | null
      const file = input?.files?.[0]
      if (!file) {
        return
      }
      try {
        const text = await file.text()
        this.actions.importRules(text)
      } catch {
        Toast.error('读取文件失败', 'RBVP', 3000)
      } finally {
        if (input) {
          input.value = ''
        }
      }
    },
  },
})
</script>
<style lang="scss">
.rbvp-hidden-file-input {
  display: none;
}
</style>
