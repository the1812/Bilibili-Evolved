<template>
  <DefaultWidget
    name="记录弹幕"
    icon="mdi-record-rec"
    class="record-live-danmaku"
    @click="startRecord()"
  ></DefaultWidget>
</template>

<script lang="ts">
import { dq } from '@/core/utils'

let recorderVM: Vue & { opened: boolean }
export default Vue.extend({
  components: {
    DefaultWidget: () => import('@/widgets/DefaultWidget.vue').then(m => m.default),
  },
  methods: {
    async startRecord() {
      if (dq('.live-danmaku-recorder')) {
        recorderVM.opened = !recorderVM.opened
      } else {
        const DanmakuRecorder = await import('./DanmakuRecorder.vue')
        const { mountVueComponent } = await import('@/core/utils')
        recorderVM = mountVueComponent(DanmakuRecorder)
        document.body.insertAdjacentElement('beforeend', recorderVM.$el)
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
