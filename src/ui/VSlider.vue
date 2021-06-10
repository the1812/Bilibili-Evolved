<template>
  <div
    class="be-slider"
    role="slider"
    :tabindex="focusable ? 0 : -1"
    @keydown.left="moveBy(-1)"
    @keydown.right="moveBy(1)"
  >
    <div ref="barContainer" class="bar-container">
      <slot name="bar">
        <div class="default-bar"></div>
      </slot>
    </div>
    <div ref="thumbContainer" class="thumb-container">
      <slot name="thumb">
        <div class="default-thumb"></div>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
export default Vue.extend({
  name: 'VSlider',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    focusable: {
      type: Boolean,
      default: true,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    value: {
      type: Number,
      required: true,
      default: 0,
    },
    step: {
      type: Number,
      default: 1,
    },
  },
  watch: {
    value(value: number) {
      this.updateThumbPosition(value)
    },
  },
  mounted() {
    this.normalizeValue()
    this.setupEvents()
    this.updateThumbPosition(this.value)
  },
  methods: {
    /** 有传入 value 时, 对 value 进行 normalize
     * 否则对 this.value 进行
     */
    normalizeValue(value: number | undefined) {
      if (value !== undefined) {
        if (value < this.min) {
          return this.min
        } if (value > this.max) {
          return this.max
        }
        return value
      }

      if (this.value < this.min) {
        this.$emit('change', this.min)
      } else if (this.value > this.max) {
        this.$emit('change', this.max)
      }
      return undefined
    },
    updateThumbPosition(value: number) {
      const thumbContainer = this.$refs.thumbContainer as HTMLElement
      thumbContainer.style.left = `${((100 * (value - this.min)) / (this.max - this.min)).toString()}%`
    },
    setupEvents() {
      const barContainer = this.$refs.barContainer as HTMLElement
      const thumbContainer = this.$refs.thumbContainer as HTMLElement
      const updateValue = (value: number) => {
        this.$emit('change', value)
      }

      barContainer.addEventListener('click', e => {
        const x = e.offsetX
        const totalWidth = barContainer.getBoundingClientRect().width
        const value = this.max * (x / totalWidth)
        updateValue(Math.trunc(value / this.step) * this.step)
      })
      thumbContainer.addEventListener('mousedown', () => this.$el.focus())
      thumbContainer.addEventListener('touchstart', () => this.$el.focus())

      let dragging = false
      let lastValue = 0
      let startPoint: [number, number] = [0, 0]
      const startDrag = (e: { screenX: number; screenY: number }) => {
        dragging = true
        lastValue = this.value
        startPoint = [e.screenX, e.screenY]
        const endDrag = () => (dragging = false)
        document.body.addEventListener('mouseup', endDrag, { once: true })
        document.body.addEventListener('touchend', endDrag, { once: true })
      }
      thumbContainer.addEventListener('mousedown', e => {
        e.preventDefault()
        startDrag(e)
      })
      thumbContainer.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
          e.preventDefault()
          startDrag(e.touches[0])
        }
      })
      const doDrag = (e: { screenX: number; screenY: number }) => {
        const [startX] = startPoint
        const deltaX = e.screenX - startX
        const totalWidth = barContainer.getBoundingClientRect().width
        const valueChange: number = (this.max - this.min) * (deltaX / totalWidth)
        const value: number = this.normalizeValue(
          lastValue + Math.trunc(valueChange / this.step) * this.step,
        )
        updateValue(value)
      }
      document.body.addEventListener('mousemove', e => {
        if (dragging) {
          e.preventDefault()
          doDrag(e)
        }
      })
      document.body.addEventListener(
        'touchmove',
        e => {
          if (dragging && e.touches.length === 1) {
            e.preventDefault()
            doDrag(e.touches[0])
          }
        },
        { passive: false },
      )
    },
    moveBy(count) {
      const valueChange = count * this.step
      this.$emit('change', this.normalizeValue(this.value + valueChange))
    },
  },
})
</script>

<style lang="scss" scoped>
@import './common';
.be-slider {
  min-width: 50px;
  position: relative;
  outline: none !important;
  .bar-container {
    padding: 6px 0;
  }
  .default-bar {
    height: 4px;
    @include round-corner(2px);
    background-color: #8882;
  }
  .thumb-container {
    position: absolute;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    cursor: pointer;
    transition: none;
  }
  .default-thumb {
    width: 16px;
    height: 16px;
    @include round-corner(50%);
    background-color: var(--theme-color);
    box-shadow: 0 0 0 2px var(--theme-color-20);
    transition: box-shadow 0.2s ease-out;
  }
}
</style>
