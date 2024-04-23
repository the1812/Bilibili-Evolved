import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'

export enum DisplayMode {
  Auto = '自动',
  Icon = '图标',
  IconAndText = '图标 + 文字',
}
export const options = defineOptionsMetadata({
  favoriteFolderID: {
    defaultValue: 0,
    displayName: '快速收藏夹ID',
    hidden: true,
  },
  showInFavoritePages: {
    defaultValue: false,
    displayName: '在收藏夹播放页面仍然显示',
  },
  displayMode: {
    defaultValue: DisplayMode.Auto,
    displayName: '显示方式',
    dropdownEnum: DisplayMode,
  },
})

export type Options = OptionsOfMetadata<typeof options>
