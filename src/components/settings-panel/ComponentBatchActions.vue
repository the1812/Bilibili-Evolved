<template>
  <MiniToast
    v-if="selection.length > 0 && referenceRect"
    ref="menu"
    class="component-batch-actions"
    placement="right"
    trigger="manual"
    show
    :hide-on-click="false"
    :get-reference-client-rect="referenceRect"
  >
    <template #toast>
      <div class="batch-actions-header">
        <span>已选 {{ selection.length }} 个组件</span>
        <VIcon icon="close" :size="14" title="清除选择" @click="emit('close')" />
      </div>
      <ComponentAction
        v-for="action of actions"
        :key="action.name"
        :item="action"
        :disabled="pending || !action.count"
      />
    </template>
  </MiniToast>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Toast, ToastType } from '@/core/toast'
import { MiniToast, VIcon } from '@/ui'
import { componentsMap } from '../component'
import ComponentAction from './component-actions/ComponentAction.vue'
import { componentBatchActions } from './component-actions/component-actions'
import { useComponentData } from './component-data'

const props = defineProps<{ selection: string[]; scrollContainer?: HTMLElement }>()
const emit = defineEmits<{ (event: 'close'): void }>()
const menu = ref<InstanceType<typeof MiniToast>>()
const referenceRect = computed(() => {
  const container = props.scrollContainer
  if (!container) {
    return null
  }
  return Object.assign(
    () => {
      const rows = container.querySelectorAll('.component-settings.selected')
      const { left, top, bottom, width } = container.getBoundingClientRect()
      const selectionTop = rows[0]?.getBoundingClientRect().top ?? top
      const selectionBottom = rows[rows.length - 1]?.getBoundingClientRect().bottom ?? selectionTop
      const visibleTop = lodash.clamp(selectionTop, top, bottom)
      const visibleBottom = lodash.clamp(selectionBottom, top, bottom)
      const center = (visibleTop + visibleBottom) / 2
      return new DOMRect(left, center, width, 0)
    },
    { contextElement: container },
  )
})
watch(
  () => props.selection,
  () => menu.value?.toast?.tippy.popperInstance?.update(),
  { flush: 'post' },
)

const pending = ref(false)
const runBatchAction = async (verb: string, count: number, run: () => Promise<string>) => {
  if (pending.value || count === 0) {
    return
  }
  const title = `批量${verb}`
  if (!window.confirm(`确定要${verb}所选的 ${count} 个组件吗?`)) {
    return
  }
  pending.value = true
  const toast = Toast.info('处理中...', title)
  try {
    toast.message = lodash.escape(await run())
  } catch (error) {
    toast.type = ToastType.Error
    toast.message = lodash.escape(String(error))
  } finally {
    toast.duration = 5000
    pending.value = false
  }
}

const actions = useComponentData(() => {
  const selectedComponents = props.selection.map(name => componentsMap[name]).filter(Boolean)
  return componentBatchActions.map(({ filter, run, verb, ...action }) => {
    const items = selectedComponents.filter(filter)
    return {
      ...action,
      count: items.length,
      action: () => runBatchAction(verb, items.length, () => run(items)),
    }
  })
})
</script>

<style lang="scss">
@import 'common';

.component-batch-actions {
  position: absolute;
  inset: 0 0 auto;

  > .be-mini-toast {
    display: none;
  }
  .tippy-content {
    padding: 4px;
  }
  .batch-actions-header {
    @include h-center(10px);
    justify-content: space-between;
    padding: 4px 6px;
    opacity: 0.8;
    .be-icon {
      cursor: pointer;
    }
  }
}
</style>
