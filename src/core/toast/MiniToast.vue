<template>
  <div class="be-mini-toast-wrapper">
    <div ref="content" class="be-mini-toast-content">
      <slot />
    </div>
    <div ref="toastElement" class="be-mini-toast">
      <slot name="toast" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, useAttrs, watch } from 'vue'
import type { Props as TippyProps } from 'tippy.js'
import { createMiniToast } from './mini'

const props = withDefaults(
  defineProps<{
    show?: boolean
    container?: 'body' | 'local'
    placement?: TippyProps['placement']
    trigger?: TippyProps['trigger']
    arrow?: TippyProps['arrow']
    delay?: TippyProps['delay']
    getReferenceClientRect?: TippyProps['getReferenceClientRect']
    hideOnClick?: TippyProps['hideOnClick']
    offset?: TippyProps['offset']
    popperOptions?: TippyProps['popperOptions']
    theme?: TippyProps['theme']
  }>(),
  {
    container: 'local',
    placement: undefined,
    trigger: 'mouseenter focusin',
    arrow: undefined,
    delay: undefined,
    getReferenceClientRect: undefined,
    hideOnClick: undefined,
    offset: undefined,
    popperOptions: undefined,
    theme: undefined,
  },
)
const emit = defineEmits<{ (event: 'change', show: boolean): void }>()
const attrs = useAttrs()
const content = ref<HTMLElement>()
const toastElement = ref<HTMLElement>()
const toast = shallowRef<ReturnType<typeof createMiniToast>>()

watch(
  () => props.placement,
  placement => {
    if (placement && toast.value) {
      toast.value.placement = placement
    }
  },
)
onMounted(async () => {
  await nextTick()
  if (!toastElement.value || !content.value) {
    return
  }
  const { show, container, ...tippyProps } = props
  toast.value = createMiniToast(toastElement.value, content.value, {
    showOnCreate: show,
    onHide: () => {
      emit('change', false)
    },
    onShow: () => {
      emit('change', true)
    },
    appendTo: container === 'body' ? document.body : undefined,
    ...lodash.omitBy(tippyProps, lodash.isUndefined),
    ...attrs,
  })
})
onBeforeUnmount(() => toast.value?.tippy.destroy())
defineExpose({ toast })
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
  model: {
    prop: 'show',
    event: 'change',
  },
}
</script>
