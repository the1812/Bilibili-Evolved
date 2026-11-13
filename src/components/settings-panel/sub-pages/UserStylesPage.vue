<template>
  <div class="user-styles-page">
    <ManagePanel :config="config">
      <template #item="{ item }">
        <UserItem :config="getStyleItemConfig(item)" />
      </template>
    </ManagePanel>
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { getHook } from '@/plugins/hook'
import { UserStyle, installStyle, styles } from '@/plugins/style'
import { getStyleItemConfig } from '../user-item'
import UserItem from '../UserItem.vue'
import type { ManagePanelConfig } from './manage-panel/manage-panel'
import ManagePanel from './manage-panel/ManagePanel.vue'

type StyleType = Required<UserStyle>
const config = reactive<ManagePanelConfig<StyleType>>({
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
})
</script>
