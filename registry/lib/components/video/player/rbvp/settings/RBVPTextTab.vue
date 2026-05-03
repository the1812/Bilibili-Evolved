<template>
  <div class="rbvp-rules-editor">
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
        <div class="rbvp-rule-create-actions"></div>
      </div>
    </div>
    <textarea
      :value="state.rulesText"
      class="rbvp-textarea"
      rows="12"
      placeholder="示例:&#10;UP, 123456, rememberVideoSpeed:1.5&#10;TAG, 教程, rememberVideoSpeed:MAX&#10;RULE-SET, study-list, rememberVideoSpeed:MEMORY_LOCAL&#10;FINAL, rememberVideoSpeed:MIN"
      @input="updateRulesText"
    ></textarea>
  </div>
</template>
<script lang="ts">
import { VButton } from '@/ui'

export default Vue.extend({
  name: 'RBVPTextTab',
  components: {
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
    updateRulesText(event: Event) {
      const target = event.target as HTMLTextAreaElement | null
      this.actions.setRulesText(target?.value ?? '')
    },
  },
})
</script>
