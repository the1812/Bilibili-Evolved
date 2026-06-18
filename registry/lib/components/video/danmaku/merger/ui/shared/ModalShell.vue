<template>
  <div v-show="visible" class="dm-merger-modal-mask" :class="maskClass" @click="onMaskClick">
    <div class="dm-merger-modal" :style="modalStyle">
      <div class="dm-merger-header">
        <span class="dm-merger-title">{{ title }}</span>
        <span class="dm-merger-close" @click="onCloseClick">×</span>
      </div>
      <div class="dm-merger-body">
        <slot></slot>
      </div>
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script lang="ts">
export default Vue.extend({
  name: 'ModalShell',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    width: {
      type: String,
      default: '850px',
    },
    maskClass: {
      type: String,
      default: '',
    },
  },
  computed: {
    modalStyle(): { width: string } {
      return { width: this.width }
    },
  },
  methods: {
    onMaskClick(event: MouseEvent) {
      if (event.target === event.currentTarget) {
        this.$emit('close')
      }
    },
    onCloseClick() {
      this.$emit('close')
    },
  },
})
</script>

<style lang="scss">
@import './merger-global.scss';

/* 弹窗遮罩内联于组件，避免 merger.scss 未注入时沉到页面底部 */
.dm-merger-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.dm-merger-modal {
  /* 独立色板，不继承 B 站页面 --text1/--bg1，避免白字白底 */
  --dm-bg1: #ffffff;
  --dm-bg2: #f4f5f7;
  --dm-text1: #222222;
  --dm-text2: #61666d;
  --dm-text3: #9499a0;
  --dm-line-regular: #e3e5e7;
  --dm-line-light: #f1f2f3;
  /* 兼容子组件 scoped 样式中的 var(--text1) 等写法 */
  --bg1: var(--dm-bg1);
  --bg2: var(--dm-bg2);
  --text1: var(--dm-text1);
  --text2: var(--dm-text2);
  --text3: var(--dm-text3);
  --line_regular: var(--dm-line-regular);
  --line_light: var(--dm-line-light);

  background: var(--dm-bg1);
  color: var(--dm-text1);
  border-radius: 12px;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  overflow: hidden;
  border: 1px solid var(--dm-line-light);
  box-sizing: border-box;
}

html[data-dark-theme='true'] .dm-merger-modal,
body.dark .dm-merger-modal {
  --dm-bg1: #222222;
  --dm-bg2: #333333;
  --dm-text1: #eeeeee;
  --dm-text2: #cccccc;
  --dm-text3: #999999;
  --dm-line-regular: #444444;
  --dm-line-light: #333333;
}

.dm-merger-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--dm-line-regular);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.dm-merger-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dm-text1);
}

.dm-merger-close {
  cursor: pointer;
  font-size: 20px;
  color: var(--dm-text3);
  padding: 0 5px;
}

.dm-merger-close:hover {
  color: var(--dm-text1);
}

.dm-merger-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}
</style>
