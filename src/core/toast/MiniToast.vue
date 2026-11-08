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
import type { Placement } from '@popperjs/core'
import { createMiniToast } from './mini'

const props = withDefaults(
  defineProps<{ show?: boolean; container?: 'body' | 'local'; placement?: Placement }>(),
  { container: 'local', placement: undefined },
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
  toast.value = createMiniToast(toastElement.value, content.value, {
    placement: props.placement,
    showOnCreate: props.show,
    trigger: 'mouseenter focusin',
    onHide: () => {
      emit('change', false)
    },
    onShow: () => {
      emit('change', true)
    },
    appendTo: props.container === 'body' ? document.body : undefined,
    ...attrs,
  })
})
onBeforeUnmount(() => toast.value?.tippy.destroy())
defineExpose({ toast })
</script>
<script lang="ts">
export default {
  model: {
    prop: 'show',
    event: 'change',
  },
}
</script>
