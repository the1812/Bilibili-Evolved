import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import type { InitialState } from './bisect'

export const bisectorOptionsMetadata = defineOptionsMetadata({
  // 原始的组件启用状态
  originalComponentEnableState: {
    defaultValue: {} as Record<string, boolean>,
    hidden: true,
  },
  // 保持禁用状态的组件内部名称数组
  keepDisabledComponents: {
    defaultValue: [] as string[],
    hidden: true,
  },
  // 保持启用状态的组件内部名称数组
  keepEnabledComponents: {
    defaultValue: [] as string[],
    hidden: true,
  },
  // bisect 生成器的初始状态
  bisectInitialState: {
    defaultValue: {} as Partial<InitialState>,
    hidden: true,
  },
})

export const getBisectorOptions = () =>
  getComponentSettings<OptionsOfMetadata<typeof bisectorOptionsMetadata>>('bisector').options

export type BisectorOptions = ReturnType<typeof getBisectorOptions>
