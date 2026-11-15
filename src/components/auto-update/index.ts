import { ComponentEntry, componentsTags } from '@/components/types'
import { meta } from '@/core/meta'
import { getComponentSettings, getGeneralSettings } from '@/core/settings'
import { isIframe } from '@/core/utils'
import { Version } from '@/core/version'
import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { LaunchBarActionProvider } from '../launch-bar/launch-bar-action'
import type {
  SettingsBatchAction,
  SettingsDetailActionProvider,
} from '../settings-panel/component-actions/settings-action-types'
import type { SettingsFeature } from '../settings-panel/settings-feature'
import type { UpdateSourceProvider } from '../settings-panel/feature-update-source'
import { name, UpdateCheckItem, updateKinds } from './utils'
import {
  FeatureSource,
  getFeatureSource,
  isLocalFeatureUrl,
  getFeatureUrl,
} from '@/core/feature-source'
import { createSwitchUpdateChannelAction } from './channel-switch'
import * as checkerMethods from './checker'

const {
  checkComponentsUpdate,
  checkPluginsUpdate,
  checkLastFeature,
  forceCheckUpdate,
  forceCheckUpdateAndReload,
  silentCheckUpdate,
} = checkerMethods

const optionsMetadata = defineOptionsMetadata({
  lastUpdateCheck: {
    displayName: '最后检查更新日期',
    defaultValue: 0,
    hidden: true,
  },
  lastInstalledVersion: {
    displayName: '最后安装版本',
    defaultValue: '2.0.0',
    hidden: true,
  },
  localPortOverride: {
    displayName: '本地组件链接端口',
    defaultValue: '',
    hidden: true,
  },
  minimumDuration: {
    displayName: '更新间隔 (ms)',
    defaultValue: 1000 * 3600 * 24,
  },
  urls: {
    displayName: '更新链接',
    defaultValue: {
      components: {} as Record<string, UpdateCheckItem>,
      plugins: {} as Record<string, UpdateCheckItem>,
      styles: {} as Record<string, UpdateCheckItem>,
    },
    hidden: true,
  },
  maxUpdateCount: {
    displayName: '单次最大更新量 (个)',
    defaultValue: 4,
    // hidden: true,
  },
})

export type Options = OptionsOfMetadata<typeof optionsMetadata>

const entry: ComponentEntry<Options> = async ({ settings: { options } }) => {
  if (isIframe()) {
    return checkerMethods
  }
  const now = Number(new Date())
  const duration = now - options.lastUpdateCheck

  const isDurationExceeded = duration >= options.minimumDuration
  const isVersionOutdated = new Version(meta.version).greaterThan(
    new Version(options.lastInstalledVersion),
  )
  if (isDurationExceeded) {
    coreApis.lifeCycle.fullyLoaded(() => silentCheckUpdate())
  } else if (isVersionOutdated) {
    coreApis.lifeCycle.fullyLoaded(() => forceCheckUpdate())
  }

  return checkerMethods
}

export type AutoUpdateOptions = OptionsOfMetadata<typeof optionsMetadata>

export const component = defineComponentMetadata({
  name,
  displayName: '自动更新器',
  description: {
    'zh-CN': '自动检查组件, 插件和样式的更新. (仅限从设置面板中安装的)',
  },
  tags: [componentsTags.utils],
  options: optionsMetadata,
  extraOptions: () => import('./ExtraOptions.vue').then(m => m.default),
  entry,
  plugin: {
    displayName: '自动更新器 - 功能扩展',
    description: {
      'zh-CN':
        '记录在设置面板中的功能安装/卸载数据供自动更新使用; 并在组件和插件详情中支持手动检查更新.',
    },
    // 非设置面板的组件如果也对能功能进行修改, 建议调用此处的 Hooks 同步状态.
    setup: ({ addData, addHook }) => {
      const getUpdateSource = (type: 'components' | 'plugins', featureName: string) => {
        const { options } = getComponentSettings<AutoUpdateOptions>(name)
        return options.urls[type][featureName]?.source
      }
      addData('settingsPanel.componentUpdateSources', (providers: UpdateSourceProvider[]) => {
        providers.push(featureName => getUpdateSource('components', featureName))
      })
      addData('settingsPanel.pluginUpdateSources', (providers: UpdateSourceProvider[]) => {
        providers.push(featureName => getUpdateSource('plugins', featureName))
      })
      updateKinds.forEach(type => {
        addHook(`user${lodash.startCase(type)}.add`, {
          after: (
            _,
            url: string,
            metadata: { name: string },
            source: FeatureSource | undefined = getFeatureSource(url),
          ) => {
            const { options } = getComponentSettings<AutoUpdateOptions>(name)
            const items = options.urls[type]
            const now = Date.now()
            items[metadata.name] = {
              source,
              lastUpdateCheck: now,
              installTime: items[metadata.name]?.installTime ?? now,
              alwaysUpdate: isLocalFeatureUrl(url),
            }
          },
        })
        addHook(`user${lodash.startCase(type)}.remove`, {
          after: (metadata: { name: string }) => {
            const { options } = getComponentSettings('autoUpdate')
            if (!options.urls[type][metadata.name]) {
              return
            }
            delete options.urls[type][metadata.name]
          },
        })
      })
      const checkByCollection = { components: checkComponentsUpdate, plugins: checkPluginsUpdate }
      const getUpdate = (feature: SettingsFeature) => {
        const { removal, registry } = feature.operations
        const target = removal && registry?.target
        const source = target && getUpdateSource(target.collection, target.name)
        return source && { target, source }
      }
      addData('settingsPanel.featureActions', (providers: SettingsDetailActionProvider[]) => {
        providers.unshift(feature => {
          const update = getUpdate(feature)
          if (!update) {
            return {}
          }
          const { target, source } = update
          const url = getFeatureUrl(source)
          const channelAction = createSwitchUpdateChannelAction(target.kind, target.name, source)
          return {
            buttons: [
              {
                name: 'checkUpdate',
                displayName: '检查更新',
                icon: isLocalFeatureUrl(url)
                  ? 'mdi-file-download-outline'
                  : 'mdi-cloud-download-outline',
                title: url,
                action: async () => {
                  const { Toast } = await import('@/core/toast')
                  const toast = Toast.info('检查更新中...', '检查更新')
                  toast.message = await checkByCollection[target.collection]({
                    filterNames: [target.name],
                    force: true,
                  })
                  toast.duration = 3000
                },
              },
            ],
            menu: channelAction ? [channelAction] : [],
          }
        })
      })
      addData('settingsPanel.featureBatchActions', (actions: SettingsBatchAction[]) => {
        actions.unshift({
          name: 'update',
          displayName: '批量更新',
          icon: 'mdi-cloud-download-outline',
          title: '更新所选功能中有更新链接的组件和插件',
          verb: '更新',
          prepare: selection => {
            const targets = selection.flatMap(feature => {
              const update = getUpdate(feature)
              return update ? [update.target] : []
            })
            const groups = Object.values(lodash.groupBy(targets, target => target.collection))
            return {
              count: targets.length,
              run: async () => {
                const results = await Promise.all(
                  groups.map(items =>
                    checkByCollection[items[0].collection]({
                      filterNames: items.map(item => item.name),
                      force: true,
                    }),
                  ),
                )
                return results.filter(Boolean).join('\n') || '所选功能暂无更新'
              },
            }
          },
        })
      })

      const icon = 'mdi-cloud-sync-outline'
      addData('launchBar.actions', (actions: LaunchBarActionProvider[]) => {
        actions.push({
          name: 'updateAllFeaturesActions',
          getActions: async () => [
            {
              name: '检查所有更新',
              description: 'Check Updates',
              action: async () => {
                const { Toast } = await import('@/core/toast')
                const toast = Toast.info('正在检查更新...', '检查所有更新')
                await forceCheckUpdateAndReload()
                toast.close()
              },
              icon,
            },
          ],
        })
      })
      if (getGeneralSettings().devMode) {
        addData('launchBar.actions', (actions: LaunchBarActionProvider[]) => {
          actions.push({
            name: 'updateLastFeatureActions',
            getActions: async () => [
              {
                name: '检查最近更新的功能',
                description: 'Check Last Update',
                action: async () => {
                  const { Toast } = await import('@/core/toast')
                  const toast = Toast.info('正在检查更新...', '检查最近更新的功能')
                  await checkLastFeature()
                  toast.close()
                },
                icon,
              },
            ],
          })
        })
      }
    },
  },
})
