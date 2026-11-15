import type { ComponentMetadata } from '@/components/types'
import { uninstallComponent } from '@/components/user-component'
import { WithName } from '@/core/common-types'
import { getHook } from '@/plugins/hook'
import { PluginMetadata, uninstallPlugin } from '@/plugins/plugin'
import { UserStyle, uninstallStyle } from '@/plugins/style'

const removeUserItem = async (
  hook: string,
  item: WithName,
  uninstall: (name: string) => Promise<unknown>,
) => {
  const { before, after } = getHook(hook, item)
  await before()
  await uninstall(item.name)
  await after()
}

export const removeUserComponent = (item: ComponentMetadata) =>
  removeUserItem('userComponents.remove', item, uninstallComponent)

export const removeUserPlugin = (item: PluginMetadata) =>
  removeUserItem('userPlugins.remove', item, uninstallPlugin)

export const removeUserStyle = (item: Required<UserStyle>) =>
  removeUserItem('userStyles.remove', item, uninstallStyle)
