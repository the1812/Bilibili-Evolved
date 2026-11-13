<template>
  <div class="user-components-page">
    <ManagePanel :config="config">
      <template #item="{ item }">
        <UserItem :config="getComponentItemConfig(item)" />
      </template>
    </ManagePanel>
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { ComponentMetadata, components } from '@/components/component'
import { installComponent } from '@/components/user-component'
import { isUserComponent } from '@/core/settings'
import { getHook } from '@/plugins/hook'
import { getComponentItemConfig } from '../user-item'
import UserItem from '../UserItem.vue'
import type { ManagePanelConfig } from './manage-panel/manage-panel'
import ManagePanel from './manage-panel/ManagePanel.vue'

const config = reactive<ManagePanelConfig<ComponentMetadata>>({
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
})
</script>
