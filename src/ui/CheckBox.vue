<template>
  <VButton
    class="be-check-box"
    :class="{ checked, 'left-icon': iconPosition === 'left' }"
    role="checkbox"
    :aria-checked="checked"
    type="transparent"
    v-bind="$attrs"
    @click="$emit('change', !checked)"
  >
    <div class="text-container">
      <slot>CheckBox</slot>
    </div>
    <div class="icon-container">
      <VIcon :size="16" class="not-checked" :icon="notCheckedIcon"></VIcon>
      <VIcon :size="16" class="checked" :icon="checkedIcon"></VIcon>
    </div>
  </VButton>
</template>

<script lang="ts">
export default Vue.extend({
  name: 'CheckBox',
  components: {
    VButton: () => import('./VButton.vue').then(m => m.default),
    VIcon: () => import('./icon/VIcon.vue').then(m => m.default),
  },
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: {
    checked: {
      type: Boolean,
      required: true,
    },
    iconPosition: {
      type: String,
      default: 'left',
    },
    checkedIcon: {
      type: String,
      default: 'mdi-checkbox-marked-circle',
    },
    notCheckedIcon: {
      type: String,
      default: 'mdi-checkbox-blank-circle-outline',
    },
  },
})
</script>

<style lang="scss" scoped>
.be-check-box {
  .text-container {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
  }
  .icon-container {
    flex-shrink: 0;
    position: relative;
    margin: 2px 0 2px 8px;
    > * {
      transition: 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    }
    .not-checked {
      opacity: 0.75;
    }
    .checked {
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
      transform: scale(0);
    }
  }
  &.checked {
    .icon-container {
      color: var(--theme-color);
      .not-checked {
        transform: scale(0);
        opacity: 0;
      }
      .checked {
        transform: scale(1);
        opacity: 1;
      }
    }
  }
  &.left-icon {
    .icon-container {
      order: -1;
      margin: 2px 6px 2px 0;
    }
  }
}
</style>
