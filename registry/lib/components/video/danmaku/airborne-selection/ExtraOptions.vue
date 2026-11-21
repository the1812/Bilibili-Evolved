<template>
  <div class="airborne-options">
    <div class="airborne-analysis-strategy">
      <div class="option-label">弹幕分析策略</div>
      <div class="strategy-items">
        <RadioButton
          :checked="strategyValue === 'full'"
          group="airborne-analysis-strategy"
          @change="onStrategyChange('full', $event)"
        >
          完整分析
        </RadioButton>
        <RadioButton
          :checked="strategyValue === 'realtime'"
          group="airborne-analysis-strategy"
          @change="onStrategyChange('realtime', $event)"
        >
          实时分析（默认）
        </RadioButton>
      </div>
      <div class="strategy-hint">
        完整分析会预取全部弹幕，仍按弹幕出现时间提示；实时分析仅处理播放中出现的弹幕。
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { RadioButton } from '@/ui'

const componentName = 'airborneSelection'
const settings = getComponentSettings(componentName)
const strategyValue = ref(settings.options.analysisStrategy as string)

const strategyListenerPath = `${componentName}.analysisStrategy`
const strategyListener = (newValue: string) => {
  strategyValue.value = newValue
}
addComponentListener(strategyListenerPath, strategyListener)
onBeforeUnmount(() => removeComponentListener(strategyListenerPath, strategyListener))

const onStrategyChange = (value: string, checked: boolean) => {
  if (!checked) {
    return
  }
  settings.options.analysisStrategy = value
  strategyValue.value = value
}
</script>
<style lang="scss" scoped>
.airborne-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.airborne-analysis-strategy {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 4px 0;
  .option-label {
    font-size: 13px;
  }
  .strategy-items {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .strategy-hint {
    font-size: 12px;
    opacity: 0.7;
  }
}
</style>
