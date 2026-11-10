import { convertToPinyin } from 'tiny-pinyin'
import { onUnmounted, ref } from 'vue'
import { getFeatureAuthors } from '@/components/author'
import { getDescriptionText } from '@/components/description'
import { componentsTags } from '@/components/types'
import { monkey } from '@/core/ajax'
import { getCdnConfig } from '@/core/cdn-types'
import { installFeature } from '@/core/install-feature'
import { branches, meta } from '@/core/meta'
import {
  addSettingsChangeListener,
  getGeneralSettings,
  removeSettingsChangeListener,
  settings,
} from '@/core/settings'
import { logError } from '@/core/utils/log'
import type { DocSourceItem, RegistryItemData } from './types'

const readInstalled = () => ({
  component: new Set(Object.keys(settings.userComponents)),
  plugin: new Set(Object.keys(settings.userPlugins)),
})

export const useRegistryData = () => {
  const general = getGeneralSettings()
  const branch = [branches.preview, 'preview-features'].includes(meta.compilationInfo.branch)
    ? branches.preview
    : branches.stable

  const list = ref<RegistryItemData[] | null>(null)
  const loading = ref(false)
  const loadFailed = ref(false)
  const installed = ref(readInstalled())
  const installing = ref<RegistryItemData[]>([])

  const isInstalled = (item: RegistryItemData) => installed.value[item.type].has(item.name)
  const refreshInstalled = () => {
    installed.value = readInstalled()
  }
  addSettingsChangeListener('userComponents', refreshInstalled)
  addSettingsChangeListener('userPlugins', refreshInstalled)
  onUnmounted(() => {
    removeSettingsChangeListener('userComponents', refreshInstalled)
    removeSettingsChangeListener('userPlugins', refreshInstalled)
  })

  const loadFeatures = async () => {
    if (loading.value || list.value) {
      return
    }
    loading.value = true
    loadFailed.value = false
    try {
      const cdn = getCdnConfig(general.cdnRoot)
      const url = `${cdn.root(branch, cdn.repo)}doc/features/features.json`
      const entries = await monkey<DocSourceItem[]>({ url, responseType: 'json' })
      if (!Array.isArray(entries)) {
        throw new Error(`无效的在线仓库索引: ${url}`)
      }
      list.value = await Promise.all(
        entries.map(async item => {
          const descriptionText = await getDescriptionText(item)
          const authors = getFeatureAuthors(item.author).map(author => `@${author.name}`)
          return {
            ...item,
            nameSortKey: convertToPinyin(item.displayName),
            repo: item.repo ?? (item.owner ? `${item.owner}/Bilibili-Evolved` : cdn.repo),
            componentTags:
              item.type === 'component'
                ? (item.tags ?? []).map(tag => componentsTags[tag]).filter(Boolean)
                : [],
            descriptionText,
            searchText: [item.name, item.displayName, ...authors, descriptionText]
              .join('\n')
              .toLowerCase(),
          }
        }),
      )
    } catch (error) {
      loadFailed.value = true
      console.error('获取在线仓库索引失败', error)
    } finally {
      loading.value = false
    }
  }

  const install = async (item: RegistryItemData) => {
    if (installing.value.includes(item)) {
      return
    }
    installing.value.push(item)
    try {
      await installFeature({
        kind: 'github',
        repo: item.repo,
        ref: branch,
        path: item.fullAbsolutePath,
        cdn: general.cdnRoot,
      })
    } catch (error) {
      logError(error)
    } finally {
      installing.value = installing.value.filter(entry => entry !== item)
    }
  }

  return { list, loading, loadFailed, installing, isInstalled, loadFeatures, install }
}
