import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'

export enum DisplayMode {
  Auto = '自动',
  Icon = '图标',
  IconAndText = '图标 + 文字',
}
export const options = defineOptionsMetadata({
  showInWatchlaterPages: {
    defaultValue: false,
    displayName: '在稍后再看页面中仍然显示',
  },
  displayMode: {
    defaultValue: DisplayMode.Auto,
    displayName: '显示方式',
    dropdownEnum: DisplayMode,
  },
})

export type Options = OptionsOfMetadata<typeof options>
