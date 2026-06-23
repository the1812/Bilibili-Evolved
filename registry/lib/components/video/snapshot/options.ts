import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'

export const options = defineOptionsMetadata({
  gridRows: {
    displayName: '快照图网格行数', //
    defaultValue: 6,
  },
  gridColumns: {
    displayName: '快照图网格列数', //
    defaultValue: 5,
  },
  gridBackgroundColor: {
    displayName: '快照图背景颜色',
    color: true,
    defaultValue: '#000000',
  },
  gridtextColor: {
    displayName: '快照图文字颜色',
    color: true,
    defaultValue: '#ffffff',
  },
  gridInfoHeader: {
    displayName: '快照图呈现视频信息',
    defaultValue: true,
  },
})

export type Options = OptionsOfMetadata<typeof options>
