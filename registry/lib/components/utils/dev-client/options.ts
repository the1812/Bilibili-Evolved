import { defineOptionsMetadata } from '@/components/define'
import { getNumberValidator } from '@/core/utils'
import { CoreUpdateMethod, RegistryUpdateMethod } from './update-method'

export const options = defineOptionsMetadata({
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
})
