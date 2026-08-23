<template>
  <div v-if="hasRbvp" class="remember-video-collection-extra-options">
    <CheckBox v-model="useRbvp">交由 RBVP 决定恢复策略</CheckBox>
    <div class="remember-video-collection-extra-options-tip">
      启用后，「记忆合集」不再自行决定是否恢复和记录合集进度，而是由 RBVP 通过
      `rememberVideoCollection:ON` / `rememberVideoCollection:OFF` 控制当前视频的行为。
    </div>
  </div>
</template>
<script lang="ts">
import { componentsMap } from '@/components/component'
import { getComponentSettings } from '@/core/settings'
import { CheckBox } from '@/ui'
import {
  getRememberVideoCollectionRbvpTakeoverState,
  setRememberVideoCollectionRbvpTakeoverState,
} from '../rbvp'

export default Vue.extend({
  components: {
    CheckBox,
  },
  computed: {
    hasRbvp() {
      return Boolean(componentsMap.rbvp) && getComponentSettings('rbvp').enabled
    },
    useRbvp: {
      get() {
        return getRememberVideoCollectionRbvpTakeoverState()
      },
      set(value: boolean) {
        setRememberVideoCollectionRbvpTakeoverState(value)
      },
    },
  },
})
</script>
<style lang="scss">
.remember-video-collection-extra-options {
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
