import { ComponentMetadata, componentsTags } from '@/components/types'
import {
  getGeneralSettings,
  getComponentSettings,
  settings,
  isUserComponent,
} from '@/core/settings'
import { descendingSort } from '@/core/utils/sort'
import { isFeatureAcceptable } from '@/core/version'
import { LaunchBarActionProvider } from '../launch-bar/launch-bar-action'
import { ComponentAction } from '../settings-panel/component-actions/component-actions'

interface UpdateCheckItem {
  url: string
  lastUpdateCheck: number
  installTime: number
  alwaysUpdate?: boolean
}
const localhost = /^http:\/\/localhost/
const name = 'autoUpdate'
type UpdateRecord = Record<string, Record<string, UpdateCheckItem>>
interface CheckSingleTypeUpdateConfig {
  filterNames?: string[]
  force?: boolean
  maxCount?: number
}
type CheckSingleTypeUpdate = (config?: CheckSingleTypeUpdateConfig) => Promise<string>
interface CheckUpdateConfig extends CheckSingleTypeUpdateConfig {
  items: Record<string, UpdateCheckItem>
  existPredicate?: (name: string) => boolean
  // installer: (code: string) => Promise<{ message: string }>
}
const isLocalItem = (url: string) => localhost.test(url)
const defaultExistPredicate = (itemName: string) => (
  settings.userComponents[itemName] !== undefined
  || settings.userPlugins[itemName] !== undefined
  || settings.userStyles[itemName] !== undefined
)
const checkUpdate = async (config: CheckUpdateConfig) => {
  const {
    items,
    existPredicate = defaultExistPredicate,
    filterNames = [],
    force = false,
    maxCount = Infinity,
  } = config
  const now = Number(new Date())
  const { devMode } = getGeneralSettings()
  const { options } = getComponentSettings(name)
  // Remove uninstalled items
  Object.keys(items).filter(it => !existPredicate(it)).forEach(key => {
    delete items[key]
  })
  const shouldUpdate = (itemName: string) => {
    if (filterNames.length === 0) {
      return true
    }
    return filterNames.includes(itemName)
  }
  let updatedCount = 0
  const results = await Promise.allSettled(
    Object.entries(items)
      .filter(([itemName, item]) => shouldUpdate(itemName) && Boolean(item.url))
      .map(async ([itemName, item]) => {
        const { url, lastUpdateCheck, alwaysUpdate } = item
        const isDebugItem = alwaysUpdate && devMode
        if (!isDebugItem && now - lastUpdateCheck <= options.minimumDuration && !force) {
          return `[${itemName}] 未超过更新间隔期, 已跳过`
        }
        if (updatedCount > maxCount && !force) {
          return `[${itemName}] 已到达单次更新量上限 (${maxCount} 个), 已跳过`
        }
        let finalUrl = url
        if (localhost.test(url) && options.localPortOverride) {
          finalUrl = url.replace(/:(\d)+/, `:${options.localPortOverride}`)
        }
        const code: string = await coreApis.ajax.monkey({ url: finalUrl })
        // 需要再检查下是否还安装着, 有可能正好在下载途中被卸载
        if (!(itemName in items)) {
          return `[${itemName}] 已被卸载, 取消更新`
        }
        if (!code) {
          return `[${itemName}] 更新下载失败, 取消更新`
        }
        if (!isFeatureAcceptable(code)) {
          return `[${itemName}] 版本不匹配, 取消更新`
        }
        const { installFeatureFromCode } = await import('@/core/install-feature')
        const { message } = await installFeatureFromCode(code, url)
        item.lastUpdateCheck = Number(new Date())
        updatedCount++
        return `[${itemName}] ${message}`
      }),
  )
  return results.map((r, index) => {
    if (r.status === 'fulfilled') {
      return r.value
    }
    const message = r.reason?.message ?? r.reason.toString()
    return `[${Object.keys(items)[index]}] ${message}`
  }).join('\n').trim()
}
const checkComponentsUpdate: CheckSingleTypeUpdate = async config => {
  const { options } = getComponentSettings(name)
  const { components } = options.urls as UpdateRecord
  return checkUpdate({
    items: components,
    ...config,
  })
}
const checkPluginsUpdate: CheckSingleTypeUpdate = async config => {
  const { options } = getComponentSettings(name)
  const { plugins } = options.urls as UpdateRecord
  return checkUpdate({
    items: plugins,
    ...config,
  })
}
const checkStylesUpdate: CheckSingleTypeUpdate = async config => {
  const { options } = getComponentSettings(name)
  const { styles } = options.urls as UpdateRecord
  return checkUpdate({
    items: styles,
    ...config,
  })
}
export const component: ComponentMetadata = {
  name,
  displayName: '自动更新器',
  description: {
    'zh-CN': '自动检查组件, 插件和样式的更新. (仅限从设置面板中安装的)',
  },
  tags: [componentsTags.utils],
  options: {
    lastUpdateCheck: {
      displayName: '最后检查更新日期',
      defaultValue: 0,
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
        components: {},
        plugins: {},
        styles: {},
      },
      hidden: true,
    },
    maxUpdateCount: {
      displayName: '单次最大更新量 (个)',
      defaultValue: 4,
      // hidden: true,
    },
  },
  entry: async ({ settings: { options }, coreApis: { pluginApis } }) => {
    const now = Number(new Date())
    const duration = now - options.lastUpdateCheck
    const checkUpdates = async () => {
      console.log('[自动更新器] 开始检查更新')
      console.log(await checkComponentsUpdate({ maxCount: options.maxUpdateCount }) || '暂无组件更新')
      console.log(await checkPluginsUpdate({ maxCount: options.maxUpdateCount }) || '暂无插件更新')
      console.log(await checkStylesUpdate({ maxCount: options.maxUpdateCount }) || '暂无样式更新')
      options.lastUpdateCheck = Number(new Date())
      console.log('[自动更新器] 完成更新检查')
    }

    if (duration >= options.minimumDuration) {
      coreApis.lifeCycle.fullyLoaded(checkUpdates)
    }

    const exportMethods = {
      checkUpdates,
      checkUpdatesAndReload: async () => {
        await checkUpdates()
        window.location.reload()
      },
      updateSingleComponent: async (...itemNames: string[]) => {
        await checkComponentsUpdate({ filterNames: itemNames, force: true })
        window.location.reload()
      },
      updateSinglePlugin: async (...itemNames: string[]) => {
        await checkPluginsUpdate({ filterNames: itemNames, force: true })
        window.location.reload()
      },
      updateSingleStyle: async (...itemNames: string[]) => {
        await checkStylesUpdate({ filterNames: itemNames, force: true })
        window.location.reload()
      },
      updateLastFeature: async () => {
        const items = Object.values(options.urls)
          .flatMap(it => Object.entries(it))
          .map(([key, record]: [string, UpdateCheckItem]) => (
            { key, time: record.lastUpdateCheck, item: record }
          ))
          .sort(descendingSort(it => it.time))
        const [firstItem] = items
        if (!firstItem) {
          console.log('没有找到最近更新的功能')
          return
        }
        await checkUpdate({
          items: { [firstItem.key]: firstItem.item },
          force: true,
        })
        window.location.reload()
      },
    }
    if (getGeneralSettings().devMode) {
      const icon = 'mdi-cloud-sync-outline'
      pluginApis.data.addData('launchBar.actions', (actions: LaunchBarActionProvider[]) => {
        actions.push({
          name: 'autoUpdateActions',
          getActions: async () => [
            {
              name: '检查所有更新',
              description: 'Check Updates',
              action: async () => {
                const { Toast } = await import('@/core/toast')
                const toast = Toast.info('正在检查更新...', '检查所有更新')
                await exportMethods.checkUpdatesAndReload()
                toast.dismiss()
              },
              icon,
            },
            {
              name: '检查最近更新的功能',
              description: 'Check Last Update',
              action: async () => {
                const { Toast } = await import('@/core/toast')
                const toast = Toast.info('正在检查更新...', '检查最近更新的功能')
                await exportMethods.updateLastFeature()
                toast.dismiss()
              },
              icon,
            },
          ],
        })
      })
    }
    return exportMethods
  },
  plugin: {
    displayName: '自动更新器 - 功能扩展',
    description: {
      'zh-CN': '记录在设置面板中的功能安装/卸载数据供自动更新使用; 并在组件详情中支持手动检查该组件的更新.',
    },
    // 非设置面板的组件如果也对能功能进行修改, 建议调用此处的 Hooks 同步状态.
    setup: ({ addData, addHook }) => {
      const types = ['components', 'plugins', 'styles']
      types.forEach(type => {
        addHook(`user${lodash.startCase(type)}.add`, {
          after: (_, url: string, metadata: { name: string }) => {
            // console.log('hook', `user${lodash.startCase(type)}.add`, metadata.name, url)
            const { options } = getComponentSettings('autoUpdate')
            const existingItem = options.urls[type][metadata.name] as UpdateCheckItem
            if (!existingItem) {
              options.urls[type][metadata.name] = {
                url,
                lastUpdateCheck: Number(new Date()),
                installTime: Number(new Date()),
                alwaysUpdate: isLocalItem(url),
              } as UpdateCheckItem
            } else {
              existingItem.url = url
              existingItem.lastUpdateCheck = Number(new Date())
              existingItem.alwaysUpdate = isLocalItem(url)
              // keep install time
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
      addData('settingsPanel.componentActions', (actions: ComponentAction[]) => {
        const { options } = getComponentSettings('autoUpdate')
        actions.push(metadata => {
          const item = options.urls.components[metadata.name] as UpdateCheckItem
          if (!item) {
            return undefined
          }
          return {
            name: 'checkUpdate',
            displayName: '检查更新',
            icon: isLocalItem(item.url) ? 'mdi-file-download-outline' : 'mdi-cloud-download-outline',
            condition: () => isUserComponent(metadata),
            title: item.url,
            action: async () => {
              const { Toast } = await import('@/core/toast')
              const toast = Toast.info('检查更新中...', '检查更新')
              const result = await checkComponentsUpdate({
                filterNames: [metadata.name],
                force: true,
              })
              toast.message = result
              toast.duration = 3000
            },
          }
        })
      })
    },
  },
}
