<template>
  <MiniToast
    v-if="selection.length > 0 && referenceRect"
    ref="menu"
    class="component-batch-actions"
    placement="right"
    trigger="manual"
    show
    v-bind="{ hideOnClick: false, getReferenceClientRect: referenceRect }"
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
import { getComponentSettings, isUserComponent } from '@/core/settings'
import { Toast, ToastType } from '@/core/toast'
import { MiniToast, VIcon } from '@/ui'
import type { AutoUpdateOptions } from '../auto-update'
import { componentsMap, ComponentMetadata } from '../component'
import ComponentAction from './component-actions/ComponentAction.vue'
import { removeUserComponent } from './component-actions/component-actions'

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
const userComponents = computed(() =>
  props.selection.filter(isUserComponent).map(name => componentsMap[name]),
)
const updatableComponents = computed(() => {
  const { options } = getComponentSettings<AutoUpdateOptions>('autoUpdate')
  return userComponents.value.filter(({ name }) => options.urls.components[name]?.source)
})

const runBatchAction = async (
  verb: string,
  items: ComponentMetadata[],
  run: (items: ComponentMetadata[]) => Promise<string>,
) => {
  if (pending.value || items.length === 0) {
    return
  }
  const title = `批量${verb}`
  if (!window.confirm(`确定要${verb}所选的 ${items.length} 个组件吗?`)) {
    return
  }
  pending.value = true
  const toast = Toast.info('处理中...', title)
  try {
    toast.message = lodash.escape(await run(items))
  } catch (error) {
    toast.type = ToastType.Error
    toast.message = lodash.escape(String(error))
  } finally {
    toast.duration = 5000
    pending.value = false
  }
}

const actions = computed(() => [
  {
    name: 'update',
    displayName: '批量更新',
    icon: 'mdi-cloud-download-outline',
    title: '更新所选组件中有更新链接的组件',
    count: updatableComponents.value.length,
    action: () =>
      runBatchAction('更新', updatableComponents.value, async items => {
        const { checkComponentsUpdate } = await import('../auto-update/checker')
        const result = await checkComponentsUpdate({
          filterNames: items.map(({ name }) => name),
          force: true,
        })
        return result || '所选组件暂无更新'
      }),
  },
  {
    name: 'uninstall',
    displayName: '批量卸载',
    icon: 'mdi-trash-can-outline',
    title: '卸载所选的自定义组件',
    count: userComponents.value.length,
    action: () =>
      runBatchAction('卸载', userComponents.value, async items => {
        const failures: string[] = []
        for (const item of items) {
          try {
            await removeUserComponent(item)
          } catch (error) {
            failures.push(`[${item.displayName}] ${String(error)}`)
          }
        }
        const count = items.length - failures.length
        return [`已卸载 ${count} 个组件, 刷新后生效`, ...failures].join('\n')
      }),
  },
])
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
