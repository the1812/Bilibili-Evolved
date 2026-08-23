import { OptionsOfMetadata, defineOptionsMetadata } from '@/components/define'

export const liveDanmakuHelperOptions = defineOptionsMetadata({
  compatibleSend: {
    displayName: '兼容发送',
    defaultValue: false,
  },
  favorites: {
    displayName: '收藏的弹幕',
    hidden: true,
    defaultValue: [] as string[],
  },
})

export type LiveDanmakuHelperOptions = OptionsOfMetadata<typeof liveDanmakuHelperOptions>
