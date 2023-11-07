<template>
  <DefaultWidget
    name="记录弹幕"
    icon="mdi-record-rec"
    class="record-live-danmaku"
    @click="startRecord()"
  ></DefaultWidget>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { DefaultWidget } from '@/ui'
import type DanmakuRecorder from './DanmakuRecorder.vue'

let recorderVM: InstanceType<typeof DanmakuRecorder> | undefined
export default defineComponent({
  components: {
    DefaultWidget,
  },
  methods: {
    async startRecord() {
      if (dq('.live-danmaku-recorder')) {
        recorderVM.opened = !recorderVM.opened
      } else {
        const { mountVueComponent } = await import('@/core/utils')
        const [el, vm] = mountVueComponent(await import('./DanmakuRecorder.vue'))
        recorderVM = vm
        document.body.insertAdjacentElement('beforeend', el)
        recorderVM.opened = true
      }
    },
  },
})
</script>

<style lang="scss">
.record-live-danmaku .be-icon {
  transform: scale(1.2);
}
</style>
