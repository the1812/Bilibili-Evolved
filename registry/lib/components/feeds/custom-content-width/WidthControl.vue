<template>
  <OptionWidgetLayout
    class="custom-content-width-control"
    :title="title"
    :is-popup="isPopup"
    icon="mdi-arrow-expand-horizontal"
  >
    <div class="width-editor">
      <div class="width-editor-title">{{ title }}</div>
      <div class="width-editor-fields">
        <TextBox
          change-on-blur
          :text="numberText"
          :validator="validateNumber"
          @change="writeWidth"
        ></TextBox>
        <VDropdown :value="unit" :items="units" @change="onUnitChange">
          <template #item="{ item }">{{ unitConfig[item].displayName }}</template>
        </VDropdown>
      </div>
    </div>
  </OptionWidgetLayout>
</template>

<script lang="ts">
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import { OptionWidgetLayout, TextBox, VDropdown } from '@/ui'
import { convertWidth, parseWidth, validateWidth, widthUnits, WidthUnit } from './width'

const widthOption = 'width'
const title = '动态页内容宽度'

export default Vue.extend({
  components: {
    OptionWidgetLayout,
    TextBox,
    VDropdown,
  },
  props: {
    componentName: {
      type: String,
      required: true,
    },
    isPopup: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    const { number, unit } = parseWidth(
      getComponentSettings(this.componentName).options[widthOption],
    )
    return {
      title,
      units: Object.keys(widthUnits),
      unitConfig: widthUnits,
      numberText: String(number),
      unit,
    }
  },
  mounted() {
    addComponentListener(`${this.componentName}.${widthOption}`, this.onWidthChanged)
  },
  beforeDestroy() {
    removeComponentListener(`${this.componentName}.${widthOption}`, this.onWidthChanged)
  },
  methods: {
    /** 选项被其它入口修改时同步到控件 */
    onWidthChanged(value: string) {
      const { number, unit } = parseWidth(value)
      this.numberText = String(number)
      this.unit = unit
    },
    onUnitChange(unit: WidthUnit) {
      const converted = convertWidth({ number: Number(this.numberText), unit: this.unit }, unit)
      this.writeWidth(converted.number, unit)
    },
    writeWidth(number: number | string, unit: WidthUnit = this.unit) {
      const { options } = getComponentSettings(this.componentName)
      options[widthOption] = validateWidth(`${number}${unit}`, String(options[widthOption]))
    },
    validateNumber(value: string, oldValue: string) {
      return value.trim() !== '' && Number.isFinite(Number(value)) ? value : oldValue
    },
  },
})
</script>

<style lang="scss">
@import 'common';

.custom-content-width-control {
  .width-editor {
    @include v-stretch(6px);
  }
  .width-editor-fields {
    @include h-stretch(6px);
    align-items: center;
  }
  .option-widget-popup {
    padding: 10px 12px;
    overflow: visible;
  }
}
</style>
