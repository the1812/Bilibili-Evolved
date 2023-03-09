<template>
  <i class="be-icon" :class="classes" :style="{ '--size': size + 'px' }">
    <slot></slot>
    <div v-if="icon in customIcons" class="custom-icon" v-html="customIcons[icon]"></div>
  </i>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { customIcons } from '.'

export default defineComponent({
  name: 'VIcon',
  props: {
    icon: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 24,
    },
    colored: {
      type: Boolean,
      default: false,
    },
  },
  setup: () => ({ customIcons }),
  computed: {
    classes(): string[] {
      const icon = this.icon as string
      const base = []
      if (this.colored) {
        base.push('colored')
      }
      if (icon === '' || icon in customIcons) {
        return base
      }
      if (icon.startsWith('mdi-')) {
        return [...base, 'mdi', icon]
      }
      return [...base, `be-iconfont-${icon}`]
    },
  },
})
</script>

<style lang="scss">
/** 由于允许自定义SVG插入, 样式不能是scoped的, 否则匹配不上 */
@font-face {
  font-family: 'be-iconfont-bilifont';
  src: url('//s1.hdslb.com/bfs/seed/jinkela/header-v2/asserts/iconfont.ttf') format('truetype');
}
@font-face {
  font-family: 'be-iconfont-vanfont';
  src: url('//s1.hdslb.com/bfs/static/jinkela/video/asserts/iconfont.6401a86.ttf')
    format('truetype');
}
@import './bilifont';
@import './vanfont';
.be-icon {
  color: inherit;
  fill: inherit;
  stroke: inherit;
  font-size: var(--size);
  font-style: normal;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);
  @include bilifont();
  @include vanfont();
  &:not(.colored) svg,
  &:not(.colored) svg path {
    fill: inherit;
    stroke: inherit;
    stroke-width: 0;
  }
  .custom-icon {
    display: flex;
    > svg {
      width: var(--size);
      height: var(--size);
    }
  }
}
</style>
