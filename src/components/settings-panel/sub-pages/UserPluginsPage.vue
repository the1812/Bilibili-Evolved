<template>
  <div class="user-plugins-page">
    <ManagePanel :config="config">
      <template #item="{ item }">
        <UserItem :config="getItemConfig(item)" />
      </template>
    </ManagePanel>
  </div>
</template>
<script lang="ts">
import { isUserPlugin } from '@/core/settings'
import { getHook } from '@/plugins/hook'
import { installPlugin, PluginMetadata, plugins, uninstallPlugin } from '@/plugins/plugin'
import { ManageItem, ManagePanelConfig } from './manage-panel/manage-panel'
import ManagePanel from './manage-panel/ManagePanel.vue'
import UserItem from './manage-panel/UserItem.vue'

const config: ManagePanelConfig<PluginMetadata> = {
  key: 'userPlugins',
  icon: 'mdi-puzzle-outline',
  title: '插件',
  description:
    '可以在此处管理插件, 插件能够增强现有组件的功能. 内置插件包括脚本本体包含的插件和组件自带的插件, 组件自带的插件会自动随组件卸载而卸载.',
  list: plugins,
  listFilter: (item, search, excludeBuiltIn) => {
    if (
      search &&
      !`${item.name}\n${item.displayName}`.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }
    if (excludeBuiltIn && !isUserPlugin(item.name)) {
      return false
    }
    return true
  },
  async onItemAdd(code, url) {
    const { before, after } = getHook('userPlugins.add', code, url)
    await before()
    const { message, metadata } = await installPlugin(code)
    await after(metadata)
    return message
  },
}
const getItemConfig = (item: PluginMetadata): ManageItem<PluginMetadata> => ({
  key: 'userPlugins',
  item,
  isUserItem: isUserPlugin(item.name),
  onItemRemove: async it => {
    const { before, after } = getHook('userPlugins.remove', it)
    await before()
    uninstallPlugin(it.name)
    await after()
  },
})
export default Vue.extend({
  components: {
    ManagePanel,
    UserItem,
  },
  data() {
    return {
      config,
    }
  },
  methods: {
    getItemConfig,
  },
})
</script>
