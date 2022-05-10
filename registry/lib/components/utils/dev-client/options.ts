import type { AutoUpdateOptions } from '@/components/auto-update'
import { defineOptionsMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import { getNumberValidator } from '@/core/utils'
import { CoreUpdateMethod, RegistryUpdateMethod } from './update-method'

export const { options: autoUpdateOptions } = getComponentSettings<AutoUpdateOptions>('autoUpdate')
export interface DevRecord {
  name: string
  originalUrl: string
}
export const devClientOptionsMetadata = defineOptionsMetadata({
  port: {
    defaultValue: 2333,
    displayName: '端口',
    validator: getNumberValidator(1024, 65535),
  },
  coreUpdateMethod: {
    defaultValue: CoreUpdateMethod.AlwaysReload,
    displayName: '本体刷新策略',
    dropdownEnum: CoreUpdateMethod,
  },
  registryUpdateMethod: {
    defaultValue: RegistryUpdateMethod.PreferInstantStyles,
    displayName: '功能刷新策略',
    dropdownEnum: RegistryUpdateMethod,
  },
  devRecords: {
    defaultValue: {} as Record<string, DevRecord>,
    displayName: '调试模式临时存储',
    hidden: true,
  },
})
