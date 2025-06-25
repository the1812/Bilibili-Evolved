<template>
  <VPopup v-model="showPopup" class="bigger-preview-video-container" @popup-change="onPopupChange">
    <div ref="popupContent"></div>
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
      // 移动到popupContent
      const popupContent = this.$refs.popupContent as HTMLElement
      if (popupContent && dom.parentNode !== popupContent) {
        popupContent.appendChild(dom)
        this.movedDom = dom
      }

      this.showPopup = true
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
