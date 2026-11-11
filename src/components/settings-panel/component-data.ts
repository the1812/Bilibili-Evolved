import { computed, ref, triggerRef } from 'vue'

const componentDataChange = ref()

export const invalidateComponentData = () => {
  triggerRef(componentDataChange)
}

export const useComponentData = <T>(getData: () => T) =>
  computed(() => {
    // 设置本身不受 Vue 跟踪, 通过 hook 通知重新读取.
    componentDataChange.value
    return getData()
  })
