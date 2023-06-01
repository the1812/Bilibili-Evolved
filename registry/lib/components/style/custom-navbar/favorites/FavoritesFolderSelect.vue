<template>
  <VDropdown
    class="favorites-folder-select"
    round
    :items="folders"
    :key-mapper="f => f.id"
    :value="folder"
    @change="change($event)"
  >
    <template #item="{ item }"> {{ item.name }} ({{ item.count }}) </template>
  </VDropdown>
</template>
<script lang="ts">
import { VDropdown } from '@/ui'
import { getUID } from '@/core/utils'
import { getJsonWithCredentials } from '@/core/ajax'
import { getComponentSettings } from '@/core/settings'
import { FavoritesFolder, notSelectedFolder } from './favorites-folder'

const navbarOptions = getComponentSettings('customNavbar').options
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
    this.folders = lodash.get(json, 'data.list', []).map(
      (item: { id: number; title: string; media_count: number }) =>
        ({
          id: item.id,
          name: item.title,
          count: item.media_count,
        } as FavoritesFolder),
    )
    if (this.folders.length > 0 && this.folder.id === notSelectedFolder.id) {
      const { lastFavoriteFolder } = navbarOptions
      const folder = this.folders.find((f: FavoritesFolder) => f.id === lastFavoriteFolder)
      if (folder) {
        this.$emit('change', folder)
      } else {
        this.$emit('change', this.folders[0])
      }
    }
  },
  methods: {
    change(folder: FavoritesFolder) {
      navbarOptions.lastFavoriteFolder = folder.id
      this.$emit('change', folder)
    },
  },
})
</script>
