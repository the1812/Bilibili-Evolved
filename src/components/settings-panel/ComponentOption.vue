<template>
  <div class="component-option" :data-type="type">
    <div class="option-name">
      {{ displayName }}
    </div>
    <TextBox
      v-if="type === 'text' || type === 'number'"
      change-on-blur
      :validator="option.validator"
      :text="value.toString()"
      :placeholder="value.toString()"
      @change="type === 'text' ? valueChange($event) : numberChange($event)"
    ></TextBox>
    <TextArea
      v-if="type === 'textArea'"
      change-on-blur
      :validator="option.validator"
      :text="value.toString()"
      :placeholder="value.toString()"
      @change="valueChange($event)"
    ></TextArea>
    <SwitchBox v-if="type === 'boolean'" :checked="value" @change="valueChange($event)"></SwitchBox>
    <ColorPicker
      v-if="type === 'color'"
      :compact="true"
      :popup-offset="-95"
      :color="value"
      @change="valueChange($event)"
    ></ColorPicker>
    <RangeInput
      v-if="type === 'range'"
      :validator="option.validator"
      :range="value"
      @change="valueChange($event)"
    ></RangeInput>
    <ImagePicker v-if="type === 'image'" :image="value" @change="valueChange($event)"></ImagePicker>
    <VDropdown
      v-if="type === 'dropdown'"
      :value="value"
      :items="getDropdownItems(option.dropdownEnum)"
      :key-mapper="it => it"
      @change="valueChange($event)"
    >
      <template #item="{ item }">
        {{ item }}
      </template>
    </VDropdown>
    <SwitchOptions
      v-if="type === 'switch'"
      small-size
      :popup-mode="false"
      :options="option.defaultValue"
    ></SwitchOptions>
    <VSlider
      v-if="type === 'slider'"
      v-bind="option.slider"
      :value="value"
      @change="debounceValueChange($event)"
    ></VSlider>
    <div v-if="type === 'unknown'" class="unknown-option-type">未知的选项类型</div>
  </div>
</template>

<script lang="ts">
import {
  TextBox,
  TextArea,
  SwitchBox,
  ColorPicker,
  RangeInput,
  VDropdown,
  ImagePicker,
  VSlider,
} from '@/ui'
import { getComponentSettings, ComponentSettings } from '@/core/settings'
import { OptionMetadata } from '../component'
import { getDropdownItems } from './dropdown'
import SwitchOptions from '../SwitchOptions.vue'

function valueChange(newValue: unknown) {
  const settings = this.settings as ComponentSettings
  settings.options[this.name] = newValue
  this.value = newValue
}
export default {
  name: 'ComponentOption',
  components: {
    SwitchOptions,
    TextBox,
    TextArea,
    SwitchBox,
    ColorPicker,
    RangeInput,
    VDropdown,
    ImagePicker,
    VSlider,
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      default: '',
    },
    option: {
      type: Object,
      required: true,
    },
    component: {
      type: Object,
      required: true,
    },
  },
  data() {
    const settings = getComponentSettings(this.component)
    return {
      settings,
      value: settings.options[this.name],
    }
  },
  computed: {
    type() {
      const option = this.option as OptionMetadata
      const { defaultValue } = option
      // console.log(option)
      switch (typeof defaultValue) {
        case 'boolean':
          return 'boolean'
        case 'number': {
          if (option.slider) {
            return 'slider'
          }
          return 'number'
        }
        case 'string': {
          if (option.color) {
            return 'color'
          }
          if (option.dropdownEnum) {
            return 'dropdown'
          }
          if (option.multiline) {
            return 'textArea'
          }
          return 'text'
        }
        case 'object': {
          if ('start' in defaultValue && 'end' in defaultValue) {
            return 'range'
          }
          if ('name' in defaultValue && 'url' in defaultValue) {
            return 'image'
          }
          if ('name' in defaultValue && 'switches' in defaultValue) {
            return 'switch'
          }
          return 'unknown'
        }
        default:
          return 'unknown'
      }
    },
  },
  methods: {
    getDropdownItems,
    numberChange(newValue: string) {
      const settings = this.settings as ComponentSettings
      const numberValue = parseFloat(newValue)
      if (Number.isNaN(numberValue)) {
        return
      }
      settings.options[this.name] = numberValue
      this.value = numberValue
    },
    debounceValueChange: lodash.debounce(valueChange, 200),
    valueChange,
  },
}
</script>

<style lang="scss">
.component-option {
  display: flex;
  align-items: center;
  min-height: 24px;
  .unknown-option-type,
  .be-slider,
  .be-range-input,
  .be-text-box {
    flex: 1 0 0;
  }
  @each $type in ('boolean', 'dropdown', 'color') {
    &[data-type='#{$type}'] .option-name {
      flex: 1 0 0;
    }
  }
  &[data-type='switch'] {
    justify-content: center;
    .option-name {
      display: none;
    }
  }
  .option-name {
    margin-right: 8px;
  }
  .be-slider {
    margin: 0 8px;
  }
  textarea {
    resize: vertical;
    min-height: 16px;
  }
}
</style>
