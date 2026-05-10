<template>
  <div v-if="hasRbvp" class="remember-speed-extra-options">
    <CheckBox v-model="useRbvp">交由 RBVP 决定还原策略</CheckBox>
    <div class="remember-speed-extra-options-tip">
      启用后，「固定全局倍速值」与「各视频分别记忆」不再参与自动还原策略。在 RBVP
      规则中可通过以下动作值调用本组件：填写倍速数值（如
      1.5）、MAX（最高可用倍速）、MIN（最低可用倍速）、MEMORY_LOCAL（当前视频记忆的倍速）、MEMORY_GLOBAL（全局记忆的倍速）。
    </div>
  </div>
</template>
<script lang="ts">
import { componentsMap } from '@/components/component'
import { getComponentSettings } from '@/core/settings'
import { CheckBox } from '@/ui'
import type { Options } from '..'

const rememberSpeedOptions = getComponentSettings<Options>('rememberVideoSpeed').options

export default Vue.extend({
  components: {
    CheckBox,
  },
  computed: {
    hasRbvp() {
      return Boolean(componentsMap.rbvp)
    },
    useRbvp: {
      get() {
        return rememberSpeedOptions.useRbvp
      },
      set(value: boolean) {
        rememberSpeedOptions.useRbvp = value
      },
    },
  },
})
</script>
<style lang="scss">
.remember-speed-extra-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
  &-tip {
    font-size: 12px;
    opacity: 0.8;
    line-height: 1.5;
  }
}
</style>
