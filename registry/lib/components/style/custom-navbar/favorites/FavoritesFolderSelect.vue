<template>
  <VDropdown
    class="favorites-folder-select"
    round
    :items="folders"
    :key-mapper="f => f.id"
    :value="folder"
    @change="$emit('change', $event)"
  >
    <template #item="{ item }">
      {{ item.name }}
    </template>
  </VDropdown>
</template>
<script lang="ts">
import {
  VDropdown,
} from '@/ui'
import { getUID } from '@/core/utils'
import { getJsonWithCredentials } from '@/core/ajax'
import { FavoritesFolder, notSelectedFolder } from './favorites-folder'

export default Vue.extend({
  components: {
    VDropdown,
  },
  model: {
    prop: 'folder',
    event: 'change',
  },
  props: {
    folder: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      folders: [],
    }
  },
  async created() {
    const uid = getUID()
    if (!uid) {
      return
    }
    const url = `https://api.bilibili.com/medialist/gateway/base/created?pn=1&ps=100&up_mid=${uid}&is_space=0`
    const json = await getJsonWithCredentials(url)
    if (json.code !== 0) {
      throw new Error(`获取收藏夹列表失败: ${json.message}`)
    }
    this.folders = lodash.get(json, 'data.list', []).map((item: {
      id: number
      title: string
      media_count: number
    }) => (
      {
        id: item.id,
        name: item.title,
        count: item.media_count,
      } as FavoritesFolder
    ))
    if (this.folders.length > 0 && this.folder.id === notSelectedFolder.id) {
      this.$emit('change', this.folders[0])
    }
  },
})
</script>
