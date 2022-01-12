<template>
  <div
    ref="slider"
    class="be-slider"
    role="slider"
    :tabindex="focusable ? 0 : -1"
    @keydown.left.prevent.stop="offsetByStep(-1)"
    @keydown.right.prevent.stop="offsetByStep(1)"
  >
    <div
      ref="barContainer"
      class="bar-container"
      @click="setByCoord($event.offsetX)"
    >
      <slot name="bar">
        <div class="default-bar"></div>
      </slot>
    </div>
    <MiniToast
      ref="thumbContainer"
      class="thumb-container"
      placement="top"
      :arrow="false"
      :style="{ left: thumbLeft }"
    >
      <slot name="thumb">
        <div class="default-thumb"></div>
      </slot>
      <template #toast>
        {{ displayFun(realValue) }}
      </template>
    </MiniToast>
  </div>
</template>

<script lang="ts">
/**
 * 提供一种数值输入方式
 *
 * 组件的值受 step 严格影响，且以 center 对齐。例如：若 `center == 0.8`、`step == 1`
 * `max == 3`，则组件的真实最大值为 `2.8`。在 step 的约束后，最终值还会接受 fix-num 的修正。
 *
 * min, max 仅代表组件值的上下限（含），不等于真实最大最小可取值。
 * 真实最大最小值是 min, max 在对齐 step、接受 fix-num 修正之后得到的值。
 *
 * # Props
 *
 * - focusable {boolean} {default: true} 是否可由 Tab 键获取到焦点
 * - min {number} {default: 0} 最小值下限。真实最小值会结合 step 与 center 共同决定
 * - max {number} {default: 100} 最大值上限。真实最大值会结合 step 与 center 共同决定
 * - value {number} {default: 0} 当前组件的值
 * - center {number} {default: 0} 对齐的中心。
 *   当该值被改变时，组件值也会被改变到新 center 下其最接近的刻度。
 * - step {number} {default: 1} 单步的跨度
 * - fix-num {(v: number) => number} {default: v => v}
 *   修正组件最终得到的值（包括真实最大最小值）。
 * - display-fun {(v: number) => string} {default: v => String(v)}
 *   仅修改提示中显示内容的函数，不修改真实组件值。接受当前的组件值，返回用于显示的字符串
 *
 * # Emits
 *
 * - change 当值被改变时触发
 *
 *   params：
 *   - value {number} 改变时的值
 * - start 开始滑动时触发
 *
 *   params：
 *   - value {number} 触发时的值
 * - end 结束滑动时触发
 *
 *   params：
 *   - value {number} 触发时的值
 */

/*
 * 给定一个 value，其变为组件允许的值（即 this.realValue）需经历以下几步：
 * round -> fix -> limit
 * round: 将值限制到 step 和 center 共同决定的刻度上
 * fix: 使用用户传入的 fixNum 进行修正
 * limit: 将值限制到 this.realMin 和 this.realMax 的范围内
 *
 * 受限制的 value 用以下名称称呼：
 * rounded：以 center 为中心，偏移整数个 step 的 value 值。
 *   除 this.realMin 和 this.realMax 外，取整方式使用 Math.round
 * fixed：在 rounded 基础上被 fixNum 修正的值
 * limited: 在 fixed 基础上被 this.realMin、this.realMax 约束的值
 *
 * 长度相关：
 * length：slider bar 上的一段长度，单位为像素
 * coord：slider bar 上某一点到左端点的像素距离
 */

import MiniToast from '@/core/toast/MiniToast.vue'

// 将实数化为整数的函数，如 Math.round，Math.ceil
type IntoIntCallback = (value: number) => number;

export default Vue.extend({
  name: 'VSlider',
  components: { MiniToast },
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
      default: 0,
    },
    center: {
      type: Number,
      default: 0,
    },
    step: {
      type: Number,
      default: 1,
    },
    fixNum: {
      type: Function,
      default: (v: number) => v,
    },
    displayFun: {
      type: Function,
      default: (v: number) => String(v),
    },
  },
  data() {
    return {
      // 用户输入值通过各种处理后得到的最终值，
      // 用与显示给用户以及作为 change 事件的实际传入参数
      realValue: 0,
    }
  },
  computed: {
    realMax() {
      return this.valueToFixed(this.max, Math.floor)
    },
    realMin() {
      return this.valueToFixed(this.min, Math.ceil)
    },
    thumbLeft() {
      const totalValueLength = this.realMax - this.realMin
      if (totalValueLength === 0) {
        return 0
      }
      const percent = 100 * ((this.realValue - this.realMin) / totalValueLength)
      return `${percent}%`
    },
    // center 处的 coord
    centerCoord() {
      return this.valueToLength(this.center - this.realMin)
    },
  },
  watch: {
    value(value: number) {
      if (value !== this.realValue) {
        this.setByValue(value)
      }
    },
    center() {
      this.setByValue(this.realValue)
    },
    min() {
      this.setByFixed(this.realValue)
    },
    max() {
      this.setByFixed(this.realValue)
    },
  },
  created() {
    this.setByValue(this.value)
  },
  mounted() {
    this.setupDrag()
  },
  methods: {
    // 以 0 为中心，计算 value 对应的 step 数。intoIntCallback 用于化整。
    valueToStep(
      value: number,
      intoIntCallback: IntoIntCallback = Math.round,
    ): number {
      return intoIntCallback(value / this.step)
    },
    // 以 0 为中心，将 value 调整到 step 的整数倍上。intoIntCallback 用于化整。
    valueToStepped(
      value: number,
      intoIntCallback: IntoIntCallback = Math.round,
    ): number {
      return this.valueToStep(value, intoIntCallback) * this.step
    },
    // 计算 slider bar 上 length 像素所对应的 value 偏移。（可计算负偏移）
    lengthToValue(length: number): number {
      const bar = this.$refs.barContainer as HTMLElement
      const totalLength = bar.getBoundingClientRect().width
      const totalValueLength = this.realMax - this.realMin
      return totalValueLength * (length / totalLength)
    },
    // 计算 slider bar 上 length 像素所对应的 step 偏移。（可计算负偏移）
    lengthToStep(length: number): number {
      return this.valueToStep(this.lengthToValue(length))
    },
    // 计算 slider bar 上 length 像素所对应的对齐 step 的 value 偏移。（可计算负偏移）
    lengthToStepped(length: number): number {
      return this.lengthToStep(length) * this.step
    },
    // 计算 slider bar 上 value 偏移所对应的 length 像素。（可计算负偏移）
    valueToLength(value: number): number {
      const bar = this.$refs.barContainer as HTMLElement
      const totalLength = bar.getBoundingClientRect().width
      const totalValueLength = this.realMax - this.realMin
      if (totalValueLength === 0) {
        return 0
      }
      return totalLength * (value / totalValueLength)
    },
    // 将一个 value 按步骤转化为 rounded
    valueToRounded(
      value: number,
      intoIntCallback: IntoIntCallback = Math.round,
    ): number {
      return (
        this.center + this.valueToStepped(value - this.center, intoIntCallback)
      )
    },
    // 将一个 value 按步骤转化为 fixed
    valueToFixed(
      value: number,
      intoIntCallback: IntoIntCallback = Math.round,
    ): number {
      return this.fixNum(this.valueToRounded(value, intoIntCallback))
    },
    // 执行 limit 步骤的函数，不含其他步骤的处理
    limitValue(value: number): number {
      if (value < this.realMin) {
        value = this.realMin
      } else if (value > this.realMax) {
        value = this.realMax
      }
      return value
    },
    // 改变组件的值，将其偏移 offset 个 step
    offsetByStep(offset: number) {
      this.setByRounded(this.realValue + offset * this.step)
    },
    // 用 limited 设置组件的值，设置前完成剩余步骤
    setByLimited(limited: number) {
      if (limited !== this.realValue) {
        this.realValue = limited
        this.$emit('change', this.realValue)
      }
    },
    // 用 fixed 设置组件的值，设置前完成剩余步骤
    setByFixed(fixed: number) {
      this.setByLimited(this.limitValue(fixed))
    },
    // 用 rounded 设置组件的值，设置前完成剩余步骤
    setByRounded(rounded: number) {
      this.setByFixed(this.fixNum(rounded))
    },
    // 用任意 value 设置组件的值，设置前完成所有步骤
    setByValue(value: number) {
      this.setByRounded(this.valueToRounded(value))
    },
    // 用 coord 设置组件的值，自动完成所有步骤
    setByCoord(coord: number) {
      this.setByRounded(
        this.center + this.lengthToStepped(coord - this.centerCoord),
      )
    },
    // 设置拖拽相关的事件
    setupDrag() {
      type Listener = (pageX: number) => void;
      type Stopper = () => void | null;

      // addEventListener 的简单包装。统一鼠标和触摸事件的注册。
      // 已经屏蔽事件默认行为。触摸事件仅在单个触摸点时触发。
      function startListen(
        target: EventTarget,
        type: string,
        listener: Listener,
        once = false,
      ): Stopper {
        const listener0 = (e: MouseEvent | TouchEvent) => {
          e.preventDefault()
          if (e instanceof MouseEvent) {
            listener(e.pageX)
          } else if (e.touches.length === 1) {
            listener(e.touches[0].pageX)
          }
        }
        target.addEventListener(type, listener0, { once, passive: false })
        if (once) {
          return null
        }
        return () => target.removeEventListener(type, listener0)
      }

      const thumb = this.$refs.thumbContainer.$el
      const types = [
        { start: 'mousedown', move: 'mousemove', end: 'mouseup' },
        { start: 'touchstart', move: 'touchmove', end: 'touchend' },
      ]
      for (const type of types) {
        let startPageX = 0
        let startRealValue = 0
        startListen(thumb, type.start, pageX => {
          this.$emit('start', this.realValue)
          this.$refs.slider.focus()
          startPageX = pageX
          startRealValue = this.realValue
          const stopListenMove = startListen(window, type.move, pageX0 => {
            this.setByValue(
              startRealValue + this.lengthToValue(pageX0 - startPageX),
            )
          })
          startListen(
            window,
            type.end,
            () => {
              this.$emit('end', this.realValue)
              stopListenMove()
            },
            true,
          )
        })
      }
    },
  },
})
</script>

<style lang="scss" scoped>
@import "./common";
.be-slider {
  min-width: 50px;
  position: relative;
  outline: none !important;
  .bar-container {
    padding: 6px 0;
  }
  .default-bar {
    height: 4px;
    cursor: pointer;
    @include round-corner(2px);
    background-color: #8882;
  }
  .thumb-container {
    position: absolute;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    transition: none;
  }
  .default-thumb {
    width: 16px;
    height: 16px;
    cursor: pointer;
    @include round-corner(50%);
    background-color: var(--theme-color);
    box-shadow: 0 0 0 2px var(--theme-color-20);
    transition: box-shadow 0.2s ease-out;
  }
}
</style>
