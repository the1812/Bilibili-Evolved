<template>
  <div>
    <div class="label-input-line form-line">
      <div class="label">
        当前位置
      </div>
      <TextBox class="input" :text="String(curPosition)" change-on-blur readonly linear />
    </div>

    <div class="inputs-line form-line">
      <VButton
        class="input"
        @click="$emit('set-default-location', curPosition)"
      >
        将当前位置设为默认值
      </VButton>
    </div>

    <div class="input-btn-line form-line">
      <TextBox
        v-model="locationInput"
        class="input"
        linear
        change-on-blur
        @change="onLocationInput"
      />
      <VButton class="btn" @click="locateTo">
        定位
      </VButton>
    </div>

    <div class="input-btn-line form-line">
      <TextBox
        v-model="offsetInput"
        class="input"
        linear
        change-on-blur
        @change="onOffsetInput"
      />
      <VButton class="btn" @click="offsetTo">
        偏移
      </VButton>
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

<style lang="scss" scoped>
.form-line {
  margin: 8px 0;
  display: flex;
  align-items: center;
  column-gap: 10px;
  &>* {
    hight: min-content;
  }
}

.label-input-line {
  .label {
    flex: 0 auto;
  }
  .input {
    flex: 1;
  }
}

.inputs-line .input {
  flex: 1;
}

.input-btn-line {
  .input {
    flex: 1;
  }
  .btn {
    flex: 0 auto;
  }
}
</style>
