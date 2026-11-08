import { ComponentEntry, componentsTags } from '@/components/types'
import { branches, matchingUpdateBranches, meta, stableUpdateBranches } from '@/core/meta'
import { getComponentSettings, getGeneralSettings, isUserComponent } from '@/core/settings'
import { isIframe } from '@/core/utils'
import { Version } from '@/core/version'
import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { LaunchBarActionProvider } from '../launch-bar/launch-bar-action'
import { ComponentAction } from '../settings-panel/component-actions/component-actions'
import { name, UpdateCheckItem, updateFeature, updateKinds } from './utils'
import {
  FeatureSource,
  getFeatureSource,
  isLocalFeatureUrl,
  getFeatureUrl,
  switchGithubBranch,
} from '@/core/feature-source'
import * as checkerMethods from './checker'

const {
  checkComponentsUpdate,
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
        '记录在设置面板中的功能安装/卸载数据供自动更新使用; 并在组件详情中支持手动检查该组件的更新.',
    },
    // 非设置面板的组件如果也对能功能进行修改, 建议调用此处的 Hooks 同步状态.
    setup: ({ addData, addHook }) => {
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
      addData('settingsPanel.componentActionButtons', (actions: ComponentAction[]) => {
        const { options } = getComponentSettings<AutoUpdateOptions>('autoUpdate')
        actions.unshift(metadata => {
          const item = options.urls.components[metadata.name]
          if (!item?.source) {
            return undefined
          }
          const url = getFeatureUrl(item.source)
          return {
            name: 'checkUpdate',
            displayName: '检查更新',
            icon: isLocalFeatureUrl(url)
              ? 'mdi-file-download-outline'
              : 'mdi-cloud-download-outline',
            visible: isUserComponent(metadata),
            title: url,
            action: async () => {
              const { Toast } = await import('@/core/toast')
              const toast = Toast.info('检查更新中...', '检查更新')
              toast.message = await checkComponentsUpdate({
                filterNames: [metadata.name],
                force: true,
              })
              toast.duration = 3000
            },
          }
        })
      })
      addData('settingsPanel.componentActions', (actions: ComponentAction[]) => {
        const { options } = getComponentSettings<AutoUpdateOptions>(name)
        actions.push(metadata => {
          const source = options.urls.components[metadata.name]?.source
          if (source?.kind !== 'github' || !isUserComponent(metadata)) {
            return undefined
          }
          const isPreview = source.ref === branches.preview
          if (!isPreview && !stableUpdateBranches.includes(source.ref)) {
            return undefined
          }
          const { branch } = meta.compilationInfo
          const stableBranch = branch === branches.stableCdn ? branches.stableCdn : branches.stable
          const target = switchGithubBranch(source, isPreview ? stableBranch : branches.preview)
          const displayName = isPreview ? '切换到稳定版' : '切换到预览版'
          const confirmPreview =
            !isPreview && matchingUpdateBranches.get(branch)?.includes(branches.stable)
          return {
            name: 'switchUpdateChannel',
            displayName,
            icon: 'mdi-source-branch',
            action: async () => {
              if (
                confirmPreview &&
                !window.confirm(
                  '当前本体是稳定版，确定要将此组件切换到预览版吗？这可能导致组件出现不兼容的情况而失效。',
                )
              ) {
                return
              }
              const { Toast } = await import('@/core/toast')
              const toast = Toast.info('正在切换版本...', displayName)
              try {
                const { message } = await updateFeature(target)
                Toast.success(message, displayName, 3000)
              } catch (error) {
                Toast.error((error as Error).message ?? String(error), displayName, 5000)
              } finally {
                toast.close()
              }
            },
          }
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
