import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'

/** 弹幕合并器组件设置 */
export const options = defineOptionsMetadata({
  showMaintenanceActions: {
    defaultValue: true,
    displayName: '显示维护操作',
  },
})

export type MergerOptions = OptionsOfMetadata<typeof options>
