<template>
  <div class="user-components-page">
    <ManagePanel :config="config">
      <template #item="{ item }">
        <UserItem :config="getItemConfig(item)" />
      </template>
    </ManagePanel>
  </div>
</template>
<script lang="ts">
import { ComponentMetadata, components } from '@/components/component'
import { installComponent, uninstallComponent } from '@/components/user-component'
import { getComponentSettings, isUserComponent } from '@/core/settings'
import { getHook } from '@/plugins/hook'
import { ManageItem, ManagePanelConfig } from './manage-panel/manage-panel'
import ManagePanel from './manage-panel/ManagePanel.vue'
import UserItem from './manage-panel/UserItem.vue'

const config: ManagePanelConfig<ComponentMetadata> = {
  key: 'userComponents',
  icon: 'mdi-cube-scan',
  title: '组件',
  description: '可以在此处添加或删除组件, 要查看组件详情, 请回到设置面板查看.',
  list: components,
  listFilter: (item, search, excludeBuiltIn) => {
    // if (item.hidden) {
    //   return false
    // }
    if (
      search &&
      !`${item.name}\n${item.displayName}`.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }
    if (excludeBuiltIn && !isUserComponent(item)) {
      return false
    }
    return true
  },
  async onItemAdd(code, url) {
    const { before, after } = getHook('userComponents.add', code, url)
    await before()
    const { metadata, message } = await installComponent(code)
    await after(metadata)
    return message
  },
}
const getItemConfig = (item: ComponentMetadata): ManageItem<ComponentMetadata> => ({
  key: 'userComponents',
  item,
  isUserItem: isUserComponent(item),
  getSettings: it => getComponentSettings(it),
  onItemRemove: async it => {
    const { before, after } = getHook('userComponents.remove', it)
    await before()
    uninstallComponent(it.name)
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
