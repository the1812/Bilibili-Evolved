import type { OptionsOfMetadata } from '@/components/define'
import { defineOptionsMetadata } from '@/components/define'

export const downloadDanmakuOptions = defineOptionsMetadata({
  speed: {
    defaultValue: 'auto' as 'auto' | number,
    hidden: true,
  },
})

export type DownloadDanmakuOptions = OptionsOfMetadata<typeof downloadDanmakuOptions>
