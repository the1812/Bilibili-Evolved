import { meta } from '@/core/meta'
import { getGeneralSettings, getComponentSettings } from '@/core/settings'
import { useScopedConsole } from '@/core/utils/log'
import { descendingSort } from '@/core/utils/sort'
import { isFeatureAcceptable } from '@/core/version'
import { getFeatureUrl, isLocalFeatureUrl } from '@/core/feature-source'
import {
  name,
  CheckUpdateConfig,
  defaultExistPredicate,
  CheckSingleTypeUpdate,
  UpdateRecord,
  CheckSingleTypeUpdateConfig,
  updateKinds,
} from './utils'
import type { Options } from '.'
import { isDataSaveMode } from '@/core/utils'

export const checkUpdate = async (config: CheckUpdateConfig) => {
  const {
    kind,
    items,
    existPredicate = itemName => defaultExistPredicate(itemName, kind),
    filterNames = [],
    force = false,
    maxCount = Infinity,
  } = config
  if (isDataSaveMode()) {
    return '当前为流量计费网络, 跳过更新检查.'
  }
  const now = Number(new Date())
  const { devMode } = getGeneralSettings()
  const { options } = getComponentSettings<Options>(name)
  // Remove uninstalled items
  Object.keys(items)
    .filter(it => !existPredicate(it))
    .forEach(key => {
      delete items[key]
    })
  const shouldUpdate = (itemName: string) => {
    if (filterNames.length === 0) {
      return true
    }
    return filterNames.includes(itemName)
  }
  let startedCount = 0
  const updateItems = Object.entries(items).filter(
    ([itemName, item]) => shouldUpdate(itemName) && Boolean(item.source),
  )
  const results = await Promise.allSettled(
    updateItems.map(async ([itemName, item]) => {
      const { source, lastUpdateCheck, alwaysUpdate } = item
      const isDebugItem = alwaysUpdate && devMode
      if (!isDebugItem && now - lastUpdateCheck <= options.minimumDuration && !force) {
        return `[${itemName}] 未超过更新间隔期, 已跳过`
      }
      if (startedCount >= maxCount && !force) {
        return `[${itemName}] 已到达单次更新量上限 (${maxCount} 个), 已跳过`
      }
      startedCount++
      let url = getFeatureUrl(source)
      if (isLocalFeatureUrl(url) && options.localPortOverride) {
        const localUrl = new URL(url)
        localUrl.port = options.localPortOverride
        url = localUrl.href
      }
      const { tryParseZip, installFeatureFromCode } = await import('@/core/install-feature')
      const code = await tryParseZip(url)
      if (!code) {
        return `[${itemName}] 更新下载失败, 取消更新`
      }
      if (!(await isFeatureAcceptable(code))) {
        return `[${itemName}] 版本不匹配, 取消更新`
      }
      if (items[itemName] !== item || item.source !== source || !existPredicate(itemName)) {
        return `[${itemName}] 功能安装记录已变化, 取消更新`
      }
      const { message } = await installFeatureFromCode(code, source)
      if (items[itemName] === item) {
        item.lastUpdateCheck = Date.now()
      }
      return `[${itemName}] ${message}`
    }),
  )
  return results
    .map((r, index) => {
      if (r.status === 'fulfilled') {
        return r.value
      }
      const message = r.reason?.message ?? r.reason.toString()
      return `[${updateItems[index][0]}] ${message}`
    })
    .join('\n')
    .trim()
}
export const checkComponentsUpdate: CheckSingleTypeUpdate = async config => {
  const { options } = getComponentSettings(name)
  const { components } = options.urls as UpdateRecord
  return checkUpdate({
    kind: 'components',
    items: components,
    ...config,
  })
}
export const checkPluginsUpdate: CheckSingleTypeUpdate = async config => {
  const { options } = getComponentSettings(name)
  const { plugins } = options.urls as UpdateRecord
  return checkUpdate({
    kind: 'plugins',
    items: plugins,
    ...config,
  })
}
export const checkStylesUpdate: CheckSingleTypeUpdate = async config => {
  const { options } = getComponentSettings(name)
  const { styles } = options.urls as UpdateRecord
  return checkUpdate({
    kind: 'styles',
    items: styles,
    ...config,
  })
}

const reload =
  <T extends any[]>(method: (...args: T) => Promise<any>) =>
  async (...args: T) => {
    await method(...args)
    window.location.reload()
  }
const checkByName = (method: CheckSingleTypeUpdate) =>
  reload(async (...itemNames: string[]) => {
    await method({ filterNames: itemNames, force: true })
  }) as (...itemNames: string[]) => Promise<void>

export const checkAllUpdate = async (config: CheckSingleTypeUpdateConfig) => {
  const { options } = getComponentSettings(name)
  const console = useScopedConsole('检查所有更新')
  console.log('开始检查更新')
  const updateMessages = [
    (await checkComponentsUpdate(config)) || '暂无组件更新',
    (await checkPluginsUpdate(config)) || '暂无插件更新',
    (await checkStylesUpdate(config)) || '暂无样式更新',
  ]
  options.lastUpdateCheck = Number(new Date())
  options.lastInstalledVersion = meta.version
  console.groupCollapsed('完成更新检查')
  updateMessages.forEach(message => console.log(message))
  console.groupEnd()
}
export const silentCheckUpdate = () =>
  checkAllUpdate({
    maxCount: getComponentSettings<Options>(name).options.maxUpdateCount,
  })
export const silentCheckUpdateAndReload = reload(silentCheckUpdate)

export const forceCheckUpdate = () =>
  checkAllUpdate({
    force: true,
  })
export const forceCheckUpdateAndReload = reload(forceCheckUpdate)

export const checkComponentsByName = checkByName(checkComponentsUpdate)
export const checkPluginsByName = checkByName(checkPluginsUpdate)
export const checkStylesByName = checkByName(checkStylesUpdate)
export const checkLastFeature = async () => {
  const { options } = getComponentSettings<Options>(name)
  const items = updateKinds
    .flatMap(kind =>
      Object.entries(options.urls[kind]).map(([key, { lastUpdateCheck }]) => ({
        kind,
        key,
        time: lastUpdateCheck,
      })),
    )
    .sort(descendingSort(it => it.time))
  const [firstItem] = items
  if (!firstItem) {
    console.log('没有找到最近更新的功能')
    return
  }
  await checkUpdate({
    kind: firstItem.kind,
    items: options.urls[firstItem.kind],
    filterNames: [firstItem.key],
    force: true,
  })
  window.location.reload()
}
