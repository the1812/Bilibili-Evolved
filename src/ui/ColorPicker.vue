<template>
  <div class="be-color-picker">
    <div
      ref="button"
      v-hit="() => (popupOpened = !popupOpened)"
      role="button"
      tabindex="0"
      class="selected-color"
      :style="{ backgroundColor: color, width: size + 'px', height: size + 'px' }"
    ></div>
    <VPopup
      v-model="popupOpened"
      esc-close
      :auto-close="false"
      class="picker"
      :class="{ compact }"
      :style="{ '--offset': popupOffset + 'px' }"
      :trigger-element="$refs.button"
    >
      <div class="item-group">
        <div class="item-title">预设颜色</div>
        <div class="colors">
          <div
            v-for="c of colors"
            :key="c"
            v-hit="() => selectHexColor(c)"
            role="radio"
            :tabindex="popupOpened ? 0 : -1"
            class="color"
            :style="{ backgroundColor: c }"
          ></div>
        </div>
      </div>
      <div class="item-group">
        <div class="item-title">调色</div>
        <div class="bars">
          <template v-if="isRGB">
            <div class="bar">
              <div class="bar-name">R</div>
              <VSlider
                :focusable="false"
                :max="255"
                :value="wrapper.red"
                @change="wrapper.change('red', $event)"
              >
                <template #bar>
                  <div class="color-bar" :style="{ background: wrapper.redGradient }"></div>
                </template>
                <template #thumb>
                  <div class="color-thumb"></div>
                </template>
              </VSlider>
              <TextBox
                class="bar-value"
                max-length="3"
                change-on-blur
                :disabled="!popupOpened"
                :text="int(wrapper.red)"
                @change="wrapper.change('red', $event)"
              />
            </div>
            <div class="bar">
              <div class="bar-name">G</div>
              <VSlider
                :focusable="false"
                :max="255"
                :value="wrapper.green"
                @change="wrapper.change('green', $event)"
              >
                <template #bar>
                  <div class="color-bar" :style="{ background: wrapper.greenGradient }"></div>
                </template>
                <template #thumb>
                  <div class="color-thumb"></div>
                </template>
              </VSlider>
              <TextBox
                class="bar-value"
                max-length="3"
                change-on-blur
                :disabled="!popupOpened"
                :text="int(wrapper.green)"
                @change="wrapper.change('green', $event)"
              />
            </div>
            <div class="bar">
              <div class="bar-name">B</div>
              <VSlider
                :focusable="false"
                :max="255"
                :value="wrapper.blue"
                @change="wrapper.change('blue', $event)"
              >
                <template #bar>
                  <div class="color-bar" :style="{ background: wrapper.blueGradient }"></div>
                </template>
                <template #thumb>
                  <div class="color-thumb"></div>
                </template>
              </VSlider>
              <TextBox
                class="bar-value"
                max-length="3"
                change-on-blur
                :disabled="!popupOpened"
                :text="int(wrapper.blue)"
                @change="wrapper.change('blue', $event)"
              />
            </div>
          </template>
          <template v-else>
            <div class="bar">
              <div class="bar-name">H</div>
              <VSlider
                :focusable="false"
                :max="359.9"
                :value="wrapper.hue"
                @change="wrapper.change('hue', $event)"
              >
                <template #bar>
                  <div class="color-bar" :style="{ background: wrapper.hueGradient }"></div>
                </template>
                <template #thumb>
                  <div class="color-thumb"></div>
                </template>
              </VSlider>
              <TextBox
                class="bar-value"
                max-length="4"
                change-on-blur
                :disabled="!popupOpened"
                :text="fixed(wrapper.hue)"
                @change="wrapper.change('hue', $event)"
              />
            </div>
            <div class="bar">
              <div class="bar-name">S</div>
              <VSlider
                :focusable="false"
                :value="wrapper.saturation"
                @change="wrapper.change('saturationv', $event)"
              >
                <template #bar>
                  <div class="color-bar" :style="{ background: wrapper.saturationGradient }"></div>
                </template>
                <template #thumb>
                  <div class="color-thumb"></div>
                </template>
              </VSlider>
              <TextBox
                class="bar-value"
                max-length="5"
                change-on-blur
                :disabled="!popupOpened"
                :text="fixed(wrapper.saturation)"
                @change="wrapper.change('saturationv', $event)"
              />
            </div>
            <div class="bar">
              <div class="bar-name">B</div>
              <VSlider
                :focusable="false"
                :value="wrapper.brightness"
                @change="wrapper.change('value', $event)"
              >
                <template #bar>
                  <div class="color-bar" :style="{ background: wrapper.brightnessGradient }"></div>
                </template>
                <template #thumb>
                  <div class="color-thumb"></div>
                </template>
              </VSlider>
              <TextBox
                class="bar-value"
                max-length="5"
                change-on-blur
                :disabled="!popupOpened"
                :text="fixed(wrapper.brightness)"
                @change="wrapper.change('value', $event)"
              />
            </div>
          </template>
        </div>
      </div>
      <div class="info item-group">
        <VButton
          :disabled="!popupOpened"
          type="transparent"
          class="toggle-mode"
          :title="isRGB ? '切换至HSB' : '切换至RGB'"
          @click="isRGB = !isRGB"
        >
          {{ isRGB ? '切换至HSB' : '切换至RGB' }}
        </VButton>
        <div class="grow"></div>
        <div class="color-preview" :style="{ backgroundColor: wrapper.hex }"></div>
        <TextBox
          :disabled="!popupOpened"
          class="hex"
          :text="wrapper.hex"
          change-on-blur
          @change="selectHexColor($event)"
        />
      </div>
      <div class="operations item-group" @click="popupOpened = !popupOpened">
        <VButton :disabled="!popupOpened" class="cancel" @click="reset()"> 取消 </VButton>
        <VButton :disabled="!popupOpened" class="ok" type="primary" @click="ok()"> 确定 </VButton>
      </div>
    </VPopup>
  </div>
</template>

<script lang="ts">
import Color from 'color'
import palette from '@/core/theme-color/palette.json'
import { createColorWrapper } from './color-picker-wrapper'

export default Vue.extend({
  name: 'ColorPicker',
  components: {
    TextBox: () => import('./TextBox.vue').then(m => m.default),
    VSlider: () => import('./VSlider.vue').then(m => m.default),
    VButton: () => import('./VButton.vue').then(m => m.default),
    VPopup: () => import('./VPopup.vue').then(m => m.default),
  },
  model: {
    prop: 'color',
    event: 'change',
  },
  props: {
    color: {
      type: String,
      default: '#000000',
      required: true,
    },
    size: {
      type: Number,
      default: 24,
      required: false,
    },
    compact: {
      type: Boolean,
      default: false,
    },
    popupOffset: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      popupOpened: false,
      wrapper: createColorWrapper(this.color),
      colors: palette,
      isRGB: false,
    }
  },
  watch: {
    popupOpened(value: boolean) {
      if (value) {
        document.body.addEventListener('mousedown', e => {
          if (!this.$el.contains(e.target) && this.$el !== e.target) {
            document.body.addEventListener(
              'mouseup',
              () => {
                // this.reset()
                this.popupOpened = false
              },
              { once: true },
            )
          }
        })
        document.body.addEventListener('touchstart', e => {
          if (e.touches.length === 1 && !this.$el.contains(e.target) && this.$el !== e.target) {
            document.body.addEventListener(
              'touchend',
              () => {
                // this.reset()
                this.popupOpened = false
              },
              { once: true },
            )
          }
        })
      }
    },
  },
  methods: {
    ok() {
      this.$emit('change', this.wrapper.hex)
    },
    reset() {
      this.wrapper.color = new Color(this.color)
    },
    selectHexColor(hex: string) {
      try {
        const newColor = new Color(hex, 'hex')
        this.wrapper.color = newColor
      } catch (error) {
        // Do nothing
      }
    },
    fixed(num: number) {
      return (Math.round(num * 10) / 10).toString()
    },
    int(num: number) {
      return Math.round(num).toString()
    },
  },
})
</script>

<style lang="scss" scoped>
@import './common';
.be-color-picker {
  font-size: 14px;
  display: flex;
  position: relative;
  color: #000;
  &,
  & * {
    -webkit-tap-highlight-color: transparent;
  }
  body.dark & {
    color: #eee;
  }
  .selected-color {
    cursor: pointer;
    border-radius: 50%;
    outline: none !important;
    transition: box-shadow 0.2s ease-out;
    &:focus-within {
      box-shadow: 0 0 0 3px var(--theme-color-20);
    }
  }
  .picker {
    left: calc(50% + var(--offset));
    top: 100%;
    transition: 0.12s ease-out;
    transform: translateX(-50%) translateY(8px) scale(0.75);
    transform-origin: top;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 14px;
    width: 240px;
    @include popup();
    box-sizing: content-box;
    &.open {
      transform: translateX(-50%) translateY(8px) scale(1);
    }
    .item-group {
      display: flex;
      flex-direction: column;
      .item-title {
        @include semi-bold();
        margin-bottom: 8px;
      }
      &.info,
      &.operations {
        flex-direction: row;
      }
      &.operations {
        .ok,
        .cancel {
          // cursor: pointer;
          padding: 6px 8px;
          flex: 1 0 0;
          text-align: center;
          // background-color: #8882;
          font-size: 14px;
          // opacity: 0.75;
          // @include round-corner(4px);
          // &:hover {
          //   opacity: 1;
          // }
        }
        .cancel {
          margin-right: 4px;
        }
        .ok {
          margin-left: 4px;
        }
      }
      &.info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .color-preview {
          transition: none;
          width: 24px;
          height: 24px;
          margin-right: 8px;
          @include round-corner(50%);
        }
        .grow {
          flex: 1 0 0;
        }
        .toggle-mode {
          font-size: 14px;
          padding: 4px 8px;
          // background-color: #8882;
          // cursor: pointer;
          // @include round-corner(4px);
        }
        .hex {
          flex: 1 1 64px;
        }
      }
      .colors {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        .color {
          outline: none !important;
          margin-right: 6px;
          margin-bottom: 6px;
          height: 24px;
          width: 24px;
          cursor: pointer;
          @include round-corner(50%);
          transition: transform 0.2s ease-out;
          &:hover,
          &:focus-within {
            transform: scale(1.1);
          }
          &:active {
            transform: scale(1.05);
          }
        }
      }
      .bars {
        display: flex;
        flex-direction: column;
        .bar {
          display: flex;
          align-items: center;
          font-size: 14px;
          margin-bottom: 4px;
          .color-bar {
            height: 4px;
            border-radius: 2px;
            box-shadow: 0 0 0 2px #8882;
          }
          .color-thumb {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 2px solid var(--theme-color-20);
            transition: border 0.2s ease-out;
            background-color: #fff;
          }
          .be-slider:focus-within .color-thumb {
            border-color: var(--theme-color);
          }
        }
        .bar-name {
          flex-shrink: 0;
          width: 24px;
        }
        .bar-value {
          flex: 0 0 48px;
          margin-left: 6px;
          text-align: right;
        }
        .be-slider {
          flex: 1 0 0;
          margin: 4px 6px;
        }
      }
      &:not(:last-child) {
        margin-bottom: 16px;
      }
    }

    &.compact {
      width: 200px;
      .item-group .colors .color {
        width: 19px;
        height: 19px;
      }
    }
  }
}
</style>
