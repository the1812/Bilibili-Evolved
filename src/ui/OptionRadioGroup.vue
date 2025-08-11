<template>
  <OptionWidgetLayout :title="title" :is-popup="isPopup" :icon="icon">
    <component
      :is="currentComponent"
      v-bind="
        currentComponent === 'div'
          ? { class: 'container' }
          : { defaultExpanded: true, title: title }
      "
    >
      <RadioGroupItem
        v-for="[key, itemVM] of Object.entries(itemVMs)"
        :key="key"
        :title="itemVM.displayName"
        :default-expanded="!!itemVM.optionsFiltered"
        :hide-expand-button="!itemVM.optionsFiltered"
        :checked="itemVM.checked"
        :group="groupName"
        @change="checked => onRadioChange(itemVM, checked)"
      >
        <div v-if="itemVM.optionsFiltered">
          <ComponentOption
            v-for="[name, option] of Object.entries(itemVM.optionsFiltered)"
            :key="name"
            :name="name"
            :display-name="option.displayName"
            :option="option"
            :component="componentData"
          />
        </div>
      </RadioGroupItem>
    </component>
  </OptionWidgetLayout>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { OptionMetadata } from '@/components/types'
import ComponentOption from '@/components/settings-panel/ComponentOption.vue'
import RadioGroupItem from './RadioGroupItem.vue'
import CollapsibleContainer from './CollapsibleContainer.vue'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import { componentsMap } from '@/components/component'
import OptionWidgetLayout from './OptionWidgetLayout.vue'

export type RadioItem = {
  /**
   * 选项名称
   *
   * isOption为false时直接显示文本
   * isOption为true时显示对应选项的displayName
   */
  name: string

  /** 是否为脚本设置选项 */
  isOption?: boolean

  /** 下拉面板中包含的选项名称，可以是名称数组或正则表达式 */
  optionsIncluded?: string[] | RegExp

  /**
   * 是否选中
   *
   * isOption为true时将忽略设置，自动绑定为选项状态
   */
  checked?: boolean

  /** 选项变化时的回调 */
  onChange?: (checked: boolean) => void
}

type RadioItemVM = RadioItem & {
  /** 最终显示名称 */
  displayName?: string

  /** 过滤后的选项 */
  optionsFiltered?: Record<string, OptionMetadata>
}

export default defineComponent({
  components: {
    ComponentOption,
    RadioGroupItem,
    CollapsibleContainer,
    OptionWidgetLayout,
  },
  props: {
    /** 选项组标题 */
    title: {
      type: String,
      default: '',
    },
    /** RadioButton分组名称，全局唯一 */
    groupName: {
      type: String,
      required: true,
    },
    /** 选项组定义 */
    items: {
      type: Object as PropType<Record<string, RadioItem>>,
      required: true,
    },
    /** 组件名称 */
    componentName: {
      type: String,
      required: true,
    },
    /** 是否弹出显示，false：直接显示内容，true：显示一个按钮，点击弹出显示内容 */
    isPopup: {
      type: Boolean,
      required: true,
    },
    /** 按钮Icon */
    icon: {
      type: String,
      default: '',
    },
    /** 是否包含容器（CollapsibleContainer） */
    hasContainer: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const componentData = componentsMap[props.componentName]
    const optionDefs = componentData.options
    const optionValues = getComponentSettings(componentData).options

    // 转换 itemVMs
    const vms: Record<string, RadioItemVM> = Object.fromEntries(
      Object.entries(props.items).map(([key, item]) => {
        const vm: RadioItemVM = {
          ...item,
        }

        // 检测选项名称是否为保留占位相关选项
        const matchOption = (option: string, def: RadioItem): boolean => {
          if (def.optionsIncluded) {
            const pattern = def.optionsIncluded
            if (pattern instanceof RegExp) {
              return pattern.test(option)
            }

            if (Array.isArray(pattern)) {
              return pattern.includes(option)
            }

            return false
          }

          // 默认不过滤
          return true
        }

        // 检测是否为脚本设置选项
        if (item.isOption) {
          vm.displayName = optionDefs[item.name]?.displayName ?? item.name
          vm.checked = !!optionValues[item.name]

          // 监测其他组件的选项值更新
          addComponentListener(`${props.componentName}.${item.name}`, value => {
            vm.checked = value
          })
        } else {
          vm.displayName = item.name
        }

        // 检测是否包含下拉内容
        if (item.optionsIncluded) {
          // 过滤出需要的 options
          vm.optionsFiltered = Object.fromEntries(
            Object.entries(optionDefs).filter(([name]) => matchOption(name, item)),
          )
        }

        return [key, vm] as [string, RadioItemVM]
      }),
    )
    const itemVMs = ref(vms)

    /** 处理单选按钮变化 */
    function onRadioChange(itemVM: RadioItemVM, checked: boolean) {
      // 更新 checked 状态
      itemVM.checked = checked

      if (itemVM.isOption) {
        // 如果是脚本设置选项，更新值
        optionValues[itemVM.name] = checked
      }

      // 回调
      if (itemVM.onChange) {
        itemVM.onChange(checked)
      }
    }

    return {
      componentData,
      itemVMs,
      onRadioChange,
      currentComponent: props.hasContainer ? CollapsibleContainer : 'div',
    }
  },
})
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
