<template>
  <ModalShell :visible="visible" :title="title" width="420px" @close="onCancel">
    <div class="dm-confirm-content">{{ body }}</div>
    <template #footer>
      <div class="dm-confirm-btns">
        <button type="button" class="dm-confirm-btn primary" @click="onConfirm">确认</button>
        <button type="button" class="dm-confirm-btn cancel" @click="onCancel">取消</button>
      </div>
    </template>
  </ModalShell>
</template>

<script lang="ts">
import ModalShell from './shared/ModalShell.vue'

export default Vue.extend({
  name: 'ConfirmModal',
  components: {
    ModalShell,
  },
  data() {
    return {
      visible: false,
      title: '',
      body: '',
      resolver: null as ((value: boolean) => void) | null,
    }
  },
  methods: {
    showConfirm(title: string, body: string): Promise<boolean> {
      return new Promise(resolve => {
        this.title = title
        this.body = body
        this.resolver = resolve
        this.visible = true
      })
    },
    settle(value: boolean) {
      this.visible = false
      const resolve = this.resolver
      this.resolver = null
      resolve?.(value)
    },
    onConfirm() {
      this.settle(true)
    },
    onCancel() {
      this.settle(false)
    },
  },
})
</script>
