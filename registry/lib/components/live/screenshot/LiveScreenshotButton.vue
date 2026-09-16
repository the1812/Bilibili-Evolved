<template>
  <div class="tip-wrap be-live-screenshot-tip">
    <div class="tip panel">截图</div>
    <button class="be-live-screenshot-button">
      <VIcon :size="24" icon="mdi-camera"></VIcon>
    </button>
  </div>
</template>
<script lang="ts">
import { VIcon } from '@/ui'

export default Vue.extend({
  components: {
    VIcon,
  },
})
</script>

<style lang="scss">
.be-live-screenshot-tip.tip-wrap {
  position: relative;

  // 气泡外观来自原生 .tip.panel, 这里只补充原生 scoped 样式覆盖不到的显隐与文本布局。
  // 显隐动画与播放器一致: 200ms cubicOut, 从下方 10px 滑入并淡入;
  // 位移用 translate 属性而非 transform, 以免覆盖 .panel 用于定位的 transform。
  .tip.panel {
    visibility: hidden;
    opacity: 0;
    translate: 0 10px;
    padding: 6px 10px;
    line-height: 21px;
    white-space: nowrap;
    transition: 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  &:hover .tip.panel {
    visibility: visible;
    opacity: 0.9;
    translate: 0 0;
  }
}

.be-live-screenshot-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  background: none;
  color: #fff;
  cursor: pointer;
  outline: none !important;

  // 原生控制栏按钮悬停时图标会放大到 28px 再回到 24px (.icon:hover svg 动画宽高)。
  // VIcon 是字体图标, 盒子尺寸跟 --size (宽高), 字形大小跟 font-size, 两者都要动画
  &:hover .be-icon {
    animation: 0.2s be-live-screenshot-icon-zoom;
  }

  @keyframes be-live-screenshot-icon-zoom {
    50% {
      width: 28px;
      height: 28px;
      font-size: 28px;
    }
  }
}
</style>
