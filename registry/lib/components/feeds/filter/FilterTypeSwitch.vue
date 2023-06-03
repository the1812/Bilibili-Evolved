<template>
  <div class="filter-type-switch feeds-filter-switch">
    <label :class="{ disabled }">
      <span class="name" :class="{ disabled }">{{ type.name }}</span>
      <input v-model="disabled" type="checkbox" />
      <VIcon v-if="disabled" :size="16" class="disabled" icon="mdi-cancel"></VIcon>
      <VIcon v-else :size="16" icon="mdi-check"></VIcon>
    </label>
  </div>
</template>

<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { VIcon } from '@/ui'
import { FeedsFilterOptions } from './options'

const { options } = getComponentSettings<FeedsFilterOptions>('feedsFilter')
export default Vue.extend({
  components: {
    VIcon,
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
      document.body.classList[disabled ? 'add' : 'remove'](`feeds-filter-block-${this.name}`)
      if (!updateSettings) {
        return
      }
      const optionKey = this.optionKey as 'types' | 'specialTypes'
      if (disabled) {
        options[optionKey].push(this.type.id)
      } else {
        const index = options[optionKey].indexOf(this.type.id)
        if (index !== -1) {
          options[optionKey].splice(index, 1)
        }
      }
    },
  },
})
</script>
<style lang="scss">
.feeds-filter-switch {
  &:not(:last-child) {
    margin-bottom: 4px;
  }
  label {
    cursor: pointer;
    margin: 0;
    padding: 4px 6px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #8884;

    .name {
      font-size: 12px;
    }
    .disabled {
      color: var(--theme-color) !important;
    }
    &:hover {
      background-color: #8882;
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
