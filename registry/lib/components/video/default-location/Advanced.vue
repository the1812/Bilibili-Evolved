<template>
  <div>
    <div class="video-default-location-form-line">
      <div class="video-default-location-form-item-not-grow">当前位置</div>
      <TextBox
        class="video-default-location-form-item-grow"
        :text="String(curPosition)"
        change-on-blur
        readonly
        linear
      />
    </div>

    <div class="video-default-location-vertical-space"></div>

    <div class="video-default-location-form-line">
      <VButton
        class="video-default-location-form-item-grow"
        @click="$emit('set-default-location', curPosition)"
      >
        将当前位置设为默认值
      </VButton>
    </div>

    <div class="video-default-location-vertical-space"></div>

    <div class="video-default-location-form-line">
      <TextBox
        v-model="locationInput"
        class="video-default-location-form-item-grow"
        linear
        change-on-blur
        @change="onLocationInput"
      />
      <VButton @click="locateTo"> 定位 </VButton>
    </div>

    <div class="video-default-location-vertical-space"></div>

    <div class="video-default-location-form-line">
      <TextBox
        v-model="offsetInput"
        class="video-default-location-form-item-grow"
        linear
        change-on-blur
        @change="onOffsetInput"
      />
      <VButton @click="offsetTo"> 偏移 </VButton>
    </div>
  </div>
</template>

<script lang="ts">
import { VButton, TextBox } from '@/ui'

let scrollObserver = null

const getScrollY = (): number => Math.round(window.scrollY)

const stringIntoInt = (value: string): number | null => {
  const num = parseFloat(value)
  if (isNaN(num)) {
    return null
  }
  return Math.round(num)
}

export default Vue.extend({
  components: { VButton, TextBox },
  props: {
    observePosition: {
      type: Boolean,
      default: false,
    },
    locationLimit: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      curPosition: getScrollY(),
      locationInput: '0',
      offsetInput: '0',
      location: 0,
      offset: 0,
    }
  },
  created() {
    this.setupObserveScroll()
  },
  beforeDestroy() {
    scrollObserver.stop()
  },
  methods: {
    setLocation(value: number) {
      this.location = value
      this.locationInput = String(value)
    },
    onLocationInput(value: string) {
      let num = stringIntoInt(value)
      if (num === null) {
        this.setLocation(0)
      } else {
        num = lodash.clamp(num, 0, this.locationLimit)
        this.setLocation(num)
      }
    },
    locateTo() {
      unsafeWindow.scrollTo(0, this.location)
    },
    setOffset(value: number) {
      this.offset = value
      this.offsetInput = String(value)
    },
    onOffsetInput(value) {
      let num = stringIntoInt(value)
      if (num === null) {
        this.setOffset(0)
      } else {
        num = lodash.clamp(num, -this.locationLimit, this.locationLimit)
        this.setOffset(num)
      }
    },
    offsetTo() {
      unsafeWindow.scrollBy(0, this.offset)
    },
    setupObserveScroll() {
      const updateCurPosition = () => {
        this.curPosition = getScrollY()
      }
      let observing = false
      scrollObserver = {
        start: () => {
          if (!observing) {
            updateCurPosition()
            window.addEventListener('scroll', updateCurPosition)
            observing = true
          }
        },
        stop: () => {
          if (observing) {
            window.removeEventListener('scroll', updateCurPosition)
            observing = false
          }
        },
      }
      this.$watch(
        'observePosition',
        shouldObserve => scrollObserver[shouldObserve ? 'start' : 'stop'](),
        { immediate: true },
      )
    },
  },
})
</script>

<style lang="scss"></style>
