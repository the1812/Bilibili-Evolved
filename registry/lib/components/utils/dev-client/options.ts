import type { AutoUpdateOptions } from '@/components/auto-update'
import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import { getNumberValidator } from '@/core/utils'
import { RefreshMethod, HotReloadMethod } from './update-method'

export const { options: autoUpdateOptions } = getComponentSettings<AutoUpdateOptions>('autoUpdate')
export const getDevClientOptions = () =>
  getComponentSettings<OptionsOfMetadata<typeof devClientOptionsMetadata>>('devClient').options
export interface DevRecord {
  name: string
  originalUrl: string
}
export const devClientOptionsMetadata = defineOptionsMetadata({
  port: {
    defaultValue: 23333,
    displayName: '端口',
    validator: getNumberValidator(1024, 65535),
  },
  autoConnect: {
    defaultValue: true,
    displayName: '自动连接',
  },
  coreRefreshMethod: {
    defaultValue: RefreshMethod.AlwaysRefresh,
    displayName: '本体刷新策略',
    dropdownEnum: RefreshMethod,
  },
  registryRefreshMethod: {
    defaultValue: RefreshMethod.AlwaysRefresh,
    displayName: '功能刷新策略',
    dropdownEnum: RefreshMethod,
  },
  registryReloadMethod: {
    defaultValue: HotReloadMethod.Enabled,
    displayName: '功能热重载策略',
    dropdownEnum: HotReloadMethod,
  },
  devRecords: {
    defaultValue: {} as Record<string, DevRecord>,
    displayName: '调试模式临时存储',
    hidden: true,
  },
})
