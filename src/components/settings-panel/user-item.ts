import type { ComponentMetadata } from '@/components/types'
import { uninstallComponent } from '@/components/user-component'
import { isUserComponent, isUserPlugin } from '@/core/settings'
import { getHook } from '@/plugins/hook'
import { PluginMetadata, uninstallPlugin } from '@/plugins/plugin'
import { UserStyle, uninstallStyle } from '@/plugins/style'

type UserItem = { name: string; displayName: string }

export interface UserItemConfig<Item extends UserItem = UserItem> {
  item: Item
  isUserItem: boolean
  onItemRemove(item: Item): Promise<void>
}

const removeUserItem = async (
  hook: string,
  item: UserItem,
  uninstall: (name: string) => Promise<unknown>,
) => {
  const { before, after } = getHook(hook, item)
  await before()
  await uninstall(item.name)
  await after()
}

export const removeUserComponent = (item: ComponentMetadata) =>
  removeUserItem('userComponents.remove', item, uninstallComponent)

export const getComponentItemConfig = (
  item: ComponentMetadata,
): UserItemConfig<ComponentMetadata> => ({
  item,
  isUserItem: isUserComponent(item),
  onItemRemove: removeUserComponent,
})

export const getPluginItemConfig = (item: PluginMetadata): UserItemConfig<PluginMetadata> => ({
  item,
  isUserItem: isUserPlugin(item),
  onItemRemove: plugin => removeUserItem('userPlugins.remove', plugin, uninstallPlugin),
})

export const getStyleItemConfig = (
  item: Required<UserStyle>,
): UserItemConfig<Required<UserStyle>> => ({
  item,
  isUserItem: true,
  onItemRemove: style => removeUserItem('userStyles.remove', style, uninstallStyle),
})
