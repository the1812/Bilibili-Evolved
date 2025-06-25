<template>
  <VPopup
    ref="popup"
    v-model="showPopup"
    class="bigger-preview-video-container"
    @popup-change="onPopupChange"
  >
  </VPopup>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { VPopup } from '@/ui'

export default defineComponent({
  name: 'VideoContainer',
  components: {
    VPopup,
  },
  model: {
    prop: 'showPopup',
    event: 'popup-change',
  },
  data() {
    return {
      showPopup: false,
      movedDom: null as HTMLElement | null,
      originalParent: null as Node | null,
      originalNextSibling: null as Node | null,
    }
  },
  methods: {
    openPopup(dom: HTMLElement) {
      this.restoreDom()
      if (!dom) {
        return
      }

      // 保存原父节点和下一个兄弟节点
      this.originalParent = dom.parentNode
      this.originalNextSibling = dom.nextSibling

      this.togglePopup()
      // 移动到popup
      this.$nextTick(() => {
        const popup = this.$refs.popup as any
        if (popup && dom.parentNode !== popup) {
          popup.$el.appendChild(dom)
          this.movedDom = dom
        }
      })
    },
    closePopup() {
      this.restoreDom()
      this.togglePopup()
    },
    restoreDom() {
      if (this.movedDom && this.originalParent) {
        if (this.originalNextSibling) {
          this.originalParent.insertBefore(this.movedDom, this.originalNextSibling)
        } else {
          this.originalParent.appendChild(this.movedDom)
        }
        this.movedDom = null
        this.originalParent = null
        this.originalNextSibling = null
      }
    },
    onPopupChange(val: boolean) {
      if (!val) {
        this.restoreDom()
      }
      this.$emit('popup-change', val)
    },
    togglePopup() {
      // 调用VPopup的toggle方法
      const popup = this.$refs.popup as any
      if (popup && typeof popup.toggle === 'function') {
        popup.toggle()
      }
    },
  },
})
</script>

<style lang="scss">
.bigger-preview-video-container {
  position: fixed;
  width: 80%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
