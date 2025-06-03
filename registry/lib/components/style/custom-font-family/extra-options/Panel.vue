<template>
  <ExtraOptionsPanel
    ref="extraOptionsPanel"
    class="custom-font-family-extra-options-panel"
    :class="{ peek: isPeeking }"
    :init-data="initData"
  >
    <template #input0>
      <TextArea v-model="inputFontFamily" />
    </template>

    <template #input1>
      <SwitchOptionsMin :options="switchOptionsComponentOptions"></SwitchOptionsMin>
    </template>
  </ExtraOptionsPanel>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, useTemplateRef } from 'vue'
import { TextArea } from '@/ui'
import SwitchOptionsMin from './SwitchOptionsMin.vue'
import type { SwitchMetadataOption } from '@/components/switch-options'
import ExtraOptionsPanel from './ExtraOptionsPanel.vue'
import { getComponentSettings } from '@/core/settings'
import { Toast } from '@/core/toast'
import { delay } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { fontFamilyDefaultValue, coverOptionsName, coverOptionsDefaultValue } from '../data'
import type { ExtraOptionsPanelInitData } from './extra-options-panel'

const initData: ExtraOptionsPanelInitData = {
  header: {
    title: {
      text: '自定义字体',
      icon: 'mdi-format-font',
    },
    actions: [
      {
        id: 0,
        title: '重置面板中的所有选项为默认值',
        icon: 'mdi-cog-sync-outline',
        actionClassNameSuffix: 'reset',
      },
      {
        id: 1,
        title: '透视',
        icon: 'mdi-eye-outline',
        actionClassNameSuffix: 'peek',
      },
    ],
  },
  content: {
    options: [
      {
        id: 0,
        title: '自定义字体',
        description: '输入需要设置的字体，不同字体之间必须以英文逗号分隔',
        inputClassNameSuffix: 'input-font-family',
      },
      {
        id: 1,
        title: '覆盖选项',
        description: '下面的元素使用了特殊字体，启用选项后可在对应的元素上应用组件提供的字体设置',
        inputClassNameSuffix: 'cover-options',
      },
    ],
  },
}

const switchOptionsComponentOptions: SwitchMetadataOption<string, string> = {
  name: 'customFontFamilyCoverOptions',
  switches: {},
  radio: false,
  dimAt: 'notChecked',
  switchProps: {
    checkedIcon: 'mdi-checkbox-marked-circle',
    notCheckedIcon: 'mdi-checkbox-blank-circle-outline',
  },
  componentName: 'customFontFamily',
  optionDisplayName: '自定义字体覆盖选项',
}

for (const coverOptionName of coverOptionsName) {
  switchOptionsComponentOptions.switches[coverOptionName.camel] = {
    displayName: coverOptionName.display,
    defaultValue: coverOptionsDefaultValue[coverOptionName.camel],
  }
}

const console = useScopedConsole('自定义字体')

const extraOptionsPanel =
  useTemplateRef<InstanceType<typeof ExtraOptionsPanel>>('extraOptionsPanel')
const isPeeking = ref(false)
const isMouseOverPeekIcon = ref(false)
const inputFontFamily = ref(getComponentSettings('customFontFamily').options.fontFamily)

watch(
  () => inputFontFamily.value,
  lodash.debounce((value: string) => {
    getComponentSettings('customFontFamily').options.fontFamily = value
  }, 1000),
)

watch(isMouseOverPeekIcon, async (value: boolean) => {
  if (!value) {
    isPeeking.value = false
    return
  }
  if (value) {
    await delay(200)
  }
  if (isMouseOverPeekIcon.value) {
    isPeeking.value = true
  }
})

const toggleDisplay = () => {
  extraOptionsPanel.value.popupOpen = !extraOptionsPanel.value.popupOpen
}

const setIsMouseOverPeekIconToTrue = () => {
  isMouseOverPeekIcon.value = true
}

const setIsMouseOverPeekIconToFalse = () => {
  isMouseOverPeekIcon.value = false
}

const resetOptions = () => {
  // 重置字体选项
  getComponentSettings('customFontFamily').options.fontFamily = fontFamilyDefaultValue
  inputFontFamily.value = fontFamilyDefaultValue

  // 重置覆盖选项
  for (const coverOptionName of coverOptionsName) {
    const defaultValue = coverOptionsDefaultValue[coverOptionName.camel]
    getComponentSettings('customFontFamily').options[coverOptionName.camel] = defaultValue
  }

  Toast.success('更多选项面板中的所有选项已成功被重置为默认值', '自定义字体', 2000)
  console.log('更多选项面板中的所有选项已成功被重置为默认值')
}

const confirmResetOptions = () => {
  if (confirm('确定将面板中的所有选项重置为默认值吗？')) {
    resetOptions()
  }
}
onMounted(() => {
  // 当在 v-for 中使用模板引用时，相应的引用中包含的值是一个数组
  // 但 ref 数组并不保证与源数组相同的顺序，所以统一命名且不加用以区分的后缀，仅靠数组选择元素是不现实的
  // https://cn.vuejs.org/guide/essentials/template-refs.html#refs-inside-v-for

  const panel = extraOptionsPanel.value
  const action0Reset = panel.$refs.action0[0].$el as HTMLElement
  action0Reset.addEventListener('click', confirmResetOptions)

  const action1Peek = panel.$refs.action1[0].$el as HTMLElement
  action1Peek.addEventListener('mouseover', setIsMouseOverPeekIconToTrue)
  action1Peek.addEventListener('mouseout', setIsMouseOverPeekIconToFalse)
})

defineExpose({
  toggleDisplay,
})
</script>

<style lang="scss">
.custom-font-family-extra-options-panel {
  &.peek {
    opacity: 0.1;
  }

  > .be-eop-content > .be-eop-c-option > .be-eop-c-o-input.input-input-font-family > .be-text-area {
    min-height: 160px;
  }
}
</style>
