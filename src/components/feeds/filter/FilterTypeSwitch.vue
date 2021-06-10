<template>
  <div class="filter-type-switch feeds-filter-swtich">
    <label :class="{disabled}">
      <span class="name" :class="{disabled}">{{ type.name }}</span>
      <input v-model="disabled" type="checkbox" />
      <VIcon v-if="disabled" :size="16" class="disabled" icon="mdi-cancel"></VIcon>
      <VIcon v-else :size="16" icon="mdi-check"></VIcon>
    </label>
  </div>
</template>

<script lang="ts">
import { getComponentSettings } from '@/core/settings'

const { options } = getComponentSettings('feedsFilter')
export default Vue.extend({
  components: {
    VIcon: () => import('@/ui/icon/VIcon.vue'),
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: Object,
      required: true,
    },
  },
  data() {
    const optionKey = this.type.id >= 0 ? 'types' : 'specialTypes'
    const disabled = options[optionKey].includes(this.type.id)
    return {
      disabled,
      optionKey,
    }
  },
  watch: {
    disabled(newValue: boolean) {
      this.setFilter(newValue)
    },
  },
  created() {
    this.setFilter(this.disabled, false)
  },
  methods: {
    setFilter(disabled: boolean, updateSettings = true) {
      document.body.classList[disabled ? 'add' : 'remove'](
        `feeds-filter-block-${this.name}`,
      )
      if (!updateSettings) {
        return
      }
      if (disabled) {
        options[this.optionKey].push(this.type.id)
      } else {
        const index = options[this.optionKey].indexOf(this.type.id)
        if (index !== -1) {
          options[this.optionKey].splice(index, 1)
        }
      }
    },
  },
})
</script>
<style lang="scss">
.feeds-filter-swtich {
  &:not(:last-child) {
    margin-bottom: 4px;
  }
  label {
    cursor: pointer;
    margin: 0;
    padding: 4px 8px;
    border-radius: 4px;
    background-color: #0001;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid transparent;

    .name {
      font-size: 12px;
    }
    .disabled {
      color: var(--theme-color) !important;
    }
    &:hover {
      background-color: #0002;
    }
    input {
      display: none;
    }
    .be-icon {
      &.disabled {
        display: none;
      }
    }
    &.disabled {
      .be-icon {
        display: none;
        &.disabled {
          display: block;
        }
      }
    }
  }
}
</style>
