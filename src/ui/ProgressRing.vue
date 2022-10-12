<template>
  <div class="be-progress-ring">
    <svg :height="size" :width="size" :style="{ width: size + 'px', height: size + 'px' }">
      <circle
        class="progress"
        :class="{ transition }"
        fill="transparent"
        stroke-linecap="round"
        :stroke-dasharray="circumference + ' ' + circumference"
        :style="{ strokeDashoffset }"
        :stroke-width="stroke"
        :r="radius"
        :cx="size / 2"
        :cy="size / 2"
      />
      <circle
        class="progress-background"
        fill="transparent"
        :stroke-width="stroke"
        :r="radius"
        :cx="size / 2"
        :cy="size / 2"
      />
    </svg>
  </div>
</template>

<script lang="ts">
// https://css-tricks.com/building-progress-ring-quickly/
export default Vue.extend({
  name: 'ProgressRing',
  props: {
    size: {
      type: Number,
      required: true,
    },
    progress: {
      type: Number,
      default: 50,
    },
    stroke: {
      type: Number,
      default: 4,
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
  data() {
    const radius = this.size / 2 - this.stroke
    const circumference = radius * 2 * Math.PI

    return {
      radius,
      circumference,
    }
  },
  computed: {
    strokeDashoffset() {
      let progress = this.progress as number
      if (progress > this.max) {
        progress = this.max
      } else if (progress < this.min) {
        progress = this.min
      }
      const percent: number = (progress - this.min) / (this.max - this.min)
      return (1 - percent) * this.circumference
    },
  },
})
</script>

<style lang="scss" scoped>
.be-progress-ring {
  --ring-color: var(--theme-color);
  --ring-background: #8884;
  display: flex;
  svg {
    transform: rotate(-90deg);
    .progress {
      &.transition {
        transition: stroke-dashoffset 0.3s ease-out;
      }
      stroke: var(--ring-color);
    }
    .progress-background {
      stroke: var(--ring-background);
    }
  }
}
</style>
