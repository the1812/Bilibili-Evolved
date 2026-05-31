import { OptionsOfMetadata, defineOptionsMetadata } from '@/components/define'

export const liveDanmakuHelperOptions = defineOptionsMetadata({
  enableSidebarActions: {
    displayName: '启用侧边栏弹幕悬浮',
    defaultValue: true,
  },
  enablePlayerActions: {
    displayName: '启用播放器弹幕悬停',
    defaultValue: false,
  },
  favorites: {
    displayName: '收藏的弹幕',
    hidden: true,
    defaultValue: [] as string[],
  },
})

export type LiveDanmakuHelperOptions = OptionsOfMetadata<typeof liveDanmakuHelperOptions>
