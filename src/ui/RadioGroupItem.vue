<template>
  <CollapsibleContainer
    :expanded="computedExpanded"
    :default-expanded="defaultExpanded"
    :hide-expand-button="hideExpandButton"
    :enable-expand-by-header="false"
    :disable-content="disableContent"
    @expanded="onExpanded"
  >
    <template #title>
      <RadioButton
        class="group-title"
        no-effects
        :checked="computedChecked"
        :allow-uncheck="allowUncheck"
        :group="group"
        :checked-icon="checkedIcon"
        :not-checked-icon="notCheckedIcon"
        @change="onRadioChanged"
      >
        {{ title }}
      </RadioButton>
    </template>

    <slot />
  </CollapsibleContainer>
</template>

<script lang="ts">
import { computed, defineComponent, shallowRef } from 'vue'
import { RadioButton } from '@/ui'
import CollapsibleContainer from './CollapsibleContainer.vue'

export default defineComponent({
  components: {
    RadioButton,
    CollapsibleContainer,
  },
  props: {
    /** 选项文本 */
    title: {
      type: String,
      default: '',
    },

    // #region CollapsibleContainer 参数
    /** 当前展开状态 */
    expanded: {
      type: Boolean,
      default: undefined,
    },
    /** 初始展开状态 */
    defaultExpanded: {
      type: Boolean,
      default: false,
    },
    /** 隐藏展开按钮 */
    hideExpandButton: {
      type: Boolean,
      default: false,
    },
    /** 禁用内容区域 */
    disableContent: {
      type: Boolean,
      default: false,
    },
    // #endregion

    // #region RadioButton 参数
    checked: {
      type: Boolean,
      default: undefined,
    },
    allowUncheck: {
      type: Boolean,
      default: false,
    },
    group: {
      type: String,
      default: '',
    },
    checkedIcon: {
      type: String,
      default: 'mdi-radiobox-marked',
    },
    notCheckedIcon: {
      type: String,
      default: 'mdi-radiobox-blank',
    },
    // #endregion
  },
  emits: ['expanded', 'change'],
  setup(props, { emit }) {
    // 定义内部值以便在未传递参数时能正常工作
    const internalExpanded = shallowRef(props.defaultExpanded)
    const computedExpanded = computed(() =>
      props.expanded !== undefined ? props.expanded : internalExpanded.value,
    )
    // 切换展开/收起状态
    const onExpanded = (expanded: boolean) => {
      if (props.expanded !== undefined) {
        emit('expanded', expanded)
      } else {
        internalExpanded.value = expanded
      }
    }

    // 定义内部值以便在未传递参数时能正常工作
    const internalChecked = shallowRef(false)
    const computedChecked = computed(() =>
      props.checked !== undefined ? props.checked : internalChecked.value,
    )
    // 切换选择状态
    const onRadioChanged = (checked: boolean) => {
      if (props.checked !== undefined) {
        emit('change', checked)
      } else {
        internalChecked.value = checked
      }
    }

    return {
      computedExpanded,
      onExpanded,
      computedChecked,
      onRadioChanged,
    }
  },
})
</script>
<style lang="scss" scoped>
@import 'common';

.group-title {
  flex-grow: 1;
  padding: 6px 8px;
}
</style>
