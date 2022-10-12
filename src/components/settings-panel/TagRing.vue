<template>
  <div class="tag-ring">
    <svg :height="size" :width="size">
      <circle
        v-for="(t, index) of tags"
        :key="t.name"
        class="tag-stroke"
        fill="transparent"
        :stroke-dasharray="circumference + ' ' + circumference"
        :style="getStyle(t, index)"
        :stroke-width="stroke"
        :r="radius"
        :cx="size / 2"
        :cy="size / 2"
      />
    </svg>
  </div>
</template>
<script lang="ts">
export default Vue.extend({
  props: {
    tags: {
      type: Array,
      required: true,
    },
    size: {
      type: Number,
      default: 18,
    },
    stroke: {
      type: Number,
      default: 3,
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
  methods: {
    getStyle(tag: { color: string }, index: number) {
      const strokeDashoffset = (index / this.tags.length) * this.circumference
      return {
        strokeDashoffset,
        stroke: tag.color,
      }
    },
  },
})
</script>
<style lang="scss">
.tag-ring {
  display: flex;
  transform: scaleX(-1) rotate(-90deg);
  svg {
    height: 18px;
    width: 18px;
  }
}
</style>
