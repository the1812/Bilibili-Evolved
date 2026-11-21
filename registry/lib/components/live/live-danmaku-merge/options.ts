import { OptionsOfMetadata, defineOptionsMetadata } from '@/components/define'

export const liveDanmakuMergeOptions = defineOptionsMetadata({
  mergeDistanceRatio: {
    displayName: '允许合并路程比例 (%)',
    defaultValue: 50,
    slider: {
      min: 20,
      max: 80,
      step: 5,
    },
  },
  scaleStep: {
    displayName: '每次合并膨胀步长 (%)',
    defaultValue: 12,
    slider: {
      min: 5,
      max: 30,
      step: 1,
    },
  },
  maxScale: {
    displayName: '最大膨胀倍率上限 (%)',
    defaultValue: 180,
    slider: {
      min: 120,
      max: 300,
      step: 10,
    },
  },
  badgeSymbolScaleRatio: {
    displayName: '角标乘号比例 (%)',
    defaultValue: 55,
    slider: {
      min: 0,
      max: 100,
      step: 1,
    },
  },
  badgeNumScaleRatio: {
    displayName: '角标数字比例 (%)',
    defaultValue: 72,
    slider: {
      min: 0,
      max: 120,
      step: 1,
    },
  },
})

export type LiveDanmakuMergeOptions = OptionsOfMetadata<typeof liveDanmakuMergeOptions>
