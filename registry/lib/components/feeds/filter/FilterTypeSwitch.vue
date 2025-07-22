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
import { ref, watch, onMounted, computed } from 'vue'
import { getComponentSettings } from '@/core/settings'
import { VIcon } from '@/ui'
import { FeedsFilterOptions } from './options'

interface Props {
  name: string
  type: {
    id: number
    name: string
  }
}

const props = defineProps<Props>()

const { options } = getComponentSettings<FeedsFilterOptions>('feedsFilter')

const optionKey = computed(() => (props.type.id >= 0 ? 'types' : 'specialTypes'))

const disabled = ref(options[optionKey.value].includes(props.type.id))

const setFilter = (isDisabled: boolean, updateSettings = true) => {
  if (isDisabled) {
    document.body.classList.add(`feeds-filter-block-${props.name}`)
  } else {
    document.body.classList.remove(`feeds-filter-block-${props.name}`)
  }

  if (!updateSettings) {
    return
  }

  const key = optionKey.value as 'types' | 'specialTypes'
  if (isDisabled) {
    options[key].push(props.type.id)
  } else {
    const index = options[key].indexOf(props.type.id)
    if (index !== -1) {
      options[key].splice(index, 1)
    }
  }
}

watch(disabled, (newValue: boolean) => {
  setFilter(newValue)
})

onMounted(() => {
  setFilter(disabled.value, false)
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
