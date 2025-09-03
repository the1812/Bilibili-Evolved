<template>
  <div class="collapsible-container">
    <div class="header" @click="onHeaderClick">
      <slot name="header">
        <div class="default-header">
          <slot name="title">
            <span class="default-header-title">{{ title }}</span>
          </slot>

          <VIcon
            v-if="!hideExpandButton"
            :size="18"
            class="arrow"
            :class="{ expanded: computedExpanded }"
            icon="mdi-chevron-down"
            @click="onBtnClick"
          />
        </div>
      </slot>
    </div>
    <div v-show="computedExpanded" class="content" :class="{ disabled: disableContent }">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, shallowRef, computed } from 'vue'
import { VIcon } from '@/ui'

export default defineComponent({
  name: 'CollapsibleContainer',
  components: {
    VIcon,
  },
  props: {
    /** 标题栏文本，在不重写slot的情况下修改显示文本 */
    title: {
      type: String,
      default: '',
    },

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

    /**
     * 点击标题栏任意位置是否能触发展开/收起操作
     *
     * 通常在重写了title slot，有自定义的点击事件的情况禁用
     */
    enableExpandByHeader: {
      type: Boolean,
      default: true,
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
  },
  emits: ['expanded'],
  setup(props, { emit }) {
    // 定义内部值以便在未传递参数时能正常工作
    const internalExpanded = shallowRef(props.defaultExpanded)
    const computedExpanded = computed(() =>
      props.expanded !== undefined ? props.expanded : internalExpanded.value,
    )

    // 切换展开/收起状态
    const toggleExpand = () => {
      if (props.expanded !== undefined) {
        emit('expanded', !props.expanded)
      } else {
        internalExpanded.value = !internalExpanded.value
      }
    }

    const onHeaderClick = () => {
      if (props.enableExpandByHeader) {
        toggleExpand()
      }
    }

    const onBtnClick = (e: MouseEvent) => {
      // 避免重复触发点击事件
      e.stopPropagation()

      toggleExpand()
    }

    return {
      computedExpanded,
      onBtnClick,
      onHeaderClick,
    }
  },
})
</script>

<style lang="scss" scoped>
@import 'common';

.collapsible-container {
  border: 1px solid #8884;
  border-radius: 4px;
  overflow: hidden;

  color: #000;
  background-color: #fff;

  body.dark & {
    color: var(--be-color-text-title, #eee);
    background-color: var(--be-color-popup-bg, #444);
  }

  .header {
    @include h-center();
    justify-content: space-between;
    cursor: pointer;
    user-select: none;

    background-color: #8882;

    body.dark & {
      background-color: var(--be-color-popup-bg, #333);
    }

    .default-header {
      @include h-center(8px);
      justify-content: space-between;
      width: 100%;

      &-title {
        align-content: center;
        padding: 8px 10px;
      }

      .arrow {
        transition: transform 0.3s ease;
        padding: 7px 10px;

        &.expanded {
          transform: rotate(180deg);
        }
      }
    }
  }

  .content {
    padding: 10px;

    color: #000;
    background-color: #fff;

    body.dark & {
      color: var(--be-color-text-title, #eee);
      background-color: var(--be-color-popup-bg, #444);
    }

    & > *:not(:last-child) {
      margin-bottom: 8px;
    }

    &.disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  }
}
</style>
