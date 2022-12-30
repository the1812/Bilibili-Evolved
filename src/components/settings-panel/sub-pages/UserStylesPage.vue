<template>
  <div class="user-styles-page">
    <ManagePanel :config="config">
      <template #item="{ item }">
        <UserItem :config="getItemConfig(item)" />
      </template>
    </ManagePanel>
  </div>
</template>
<script lang="ts">
import { getHook } from '@/plugins/hook'
import { UserStyle, installStyle, uninstallStyle, styles } from '@/plugins/style'
import { ManageItem, ManagePanelConfig } from './manage-panel/manage-panel'
import ManagePanel from './manage-panel/ManagePanel.vue'
import UserItem from './manage-panel/UserItem.vue'

type StyleType = Required<UserStyle>
const config: ManagePanelConfig<StyleType> = {
  key: 'userStyles',
  icon: 'mdi-tune',
  title: '样式',
  description:
    '可以在此处管理自定义样式, 自定义样式能简单修改界面元素以满足您的需求, 对于更复杂的样式, 推荐使用 Stylus 浏览器插件来管理.',
  list: styles,
  listFilter: (item, search) => {
    if (
      search &&
      !`${item.name}\n${item.displayName}`.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }
    return true
  },
  async onItemAdd(code, url) {
    const { before, after } = getHook('userStyles.add', code, url)
    await before()
    const { message, metadata } = await installStyle(code)
    await after(metadata)
    return message
  },
}
const getItemConfig = (item: StyleType): ManageItem<StyleType> => ({
  key: 'userStyles',
  item,
  isUserItem: true,
  onItemRemove: async it => {
    const { before, after } = getHook('userStyles.remove', it)
    await before()
    uninstallStyle(it.name)
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
