<template>
  <div class="be-progress-bar">
    <div class="progress" :class="{ transition }" :style="{ width }"></div>
  </div>
</template>

<script lang="ts">
export default Vue.extend({
  name: 'ProgressBar',
  props: {
    progress: {
      type: Number,
      default: 50,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    transition: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    width() {
      let progress = this.progress as number
      if (progress > this.max) {
        progress = this.max
      } else if (progress < this.min) {
        progress = this.min
      }
      const percent: number = (progress - this.min) / (this.max - this.min)
      return `${100 * percent}%`
    },
  },
})
</script>

<style lang="scss" scoped>
.be-progress-bar {
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  height: 4px;
  background-color: #8884;
  border-radius: 2px;
  min-width: 24px;
  overflow: hidden;
  .progress {
    border-radius: 2px;
    background-color: var(--theme-color);
    &.transition {
      transition: width 0.3s ease-out;
    }
  }
}
</style>
