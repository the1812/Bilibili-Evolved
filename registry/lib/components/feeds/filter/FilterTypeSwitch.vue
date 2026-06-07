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

<script setup lang="ts">
import { watch, computed } from 'vue'
import { VIcon } from '@/ui'
import { useFeedsFilterState } from './state'

interface Props {
  name: string
  type: {
    id: number
    name: string
  }
}

const props = defineProps<Props>()

const { isTypeDisabled, setTypeDisabled } = useFeedsFilterState()

const updateTypeFilterClass = (disabled: boolean) => {
  if (disabled) {
    document.body.classList.add(`feeds-filter-block-${props.name}`)
  } else {
    document.body.classList.remove(`feeds-filter-block-${props.name}`)
  }
}

const disabled = computed({
  get: () => isTypeDisabled(props.type.id),
  set: (value: boolean) => {
    setTypeDisabled(props.type.id, value)
  },
})

watch(
  disabled,
  (value: boolean) => {
    updateTypeFilterClass(value)
  },
  { immediate: true },
)
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
    border: 1px solid var(--be-color-card-border, #8884);

    .name {
      font-size: 12px;
    }
    .disabled {
      color: var(--theme-color) !important;
    }
    &:hover {
      background-color: var(--be-color-highlight-bg-hover, #8882);
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
