import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'

/** 弹幕合并器组件设置 */
export const options = defineOptionsMetadata({
  showMaintenanceActions: {
    defaultValue: true,
    displayName: '显示维护操作',
  },
  /** 合并会话与分 P 模式等持久化数据（经 BE settings 代理写入 GM） */
  mergerPersist: {
    defaultValue: { keys: [] as string[], data: {} as Record<string, unknown> },
    hidden: true,
  },
})

export type MergerOptions = OptionsOfMetadata<typeof options>
