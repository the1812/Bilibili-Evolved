import { ComponentMetadata } from '@/components/component'
import { I18nDescription } from '@/core/common-types'
import { deleteValue } from '@/core/utils'
import { CoreApis } from '../core/core-apis'
import { addData, registerData, registerAndGetData } from './data'
import { addHook, getHook } from './hook'

/** 插件初始化时的传入参数, 可以解构并调用 */
export interface PluginSetupParameters {
  coreApis: CoreApis
  addData: typeof addData
  addHook: typeof addHook
  registerData: typeof registerData
  registerAndGetData: typeof registerAndGetData
  getHook: typeof getHook
}

/** 插件基本信息 */
export interface PluginMinimalData {
  /** 初始化函数, 可在其中注册数据, 添加代码注入等 */
  setup: (params: PluginSetupParameters) => void | Promise<void>
  /** 插件名称 */
  name: string
  /** 显示名称, 默认同插件名称 */
  displayName?: string
  /** 插件描述, 类型同 `ComponentMetadata.description` */
  description?: I18nDescription
}
type PartialRequired<Target, Props extends keyof Target> = Target & {
  [P in Props]-?: Target[P]
}
export type PluginMetadata = PartialRequired<PluginMinimalData, 'displayName'>

/** 可根据插件名称检索对应的内置插件 */
export const pluginsMap: { [name: string]: PluginMetadata } = {}
const getBuiltInPlugins = lodash.once(() => {
  const context = require.context('@/plugins', true, /index\.ts$/)
  const pluginPaths = context.keys()
  return pluginPaths.map(path => {
    const m = context(path)
    if ('plugin' in m) {
      const plugin = m.plugin as PluginMetadata
      pluginsMap[plugin.name] = plugin
      return plugin
    }
    return undefined
  }).filter(it => it !== undefined) as PluginMetadata[]
})
/** 包含所有插件的数组 */
export const plugins: PluginMetadata[] = getBuiltInPlugins()

/**
 * 安装插件
 * @param input 插件数据
 */
export const installPlugin = async (code: string) => {
  const { parseExternalInput } = await import('../core/external-input')
  const plugin = await parseExternalInput<PluginMetadata>(code)
  if (plugin === null) {
    throw new Error('无效的插件代码')
  }
  const { settings } = await import('@/core/settings')
  const existingPlugin = settings.userPlugins[plugin.name]
  if (existingPlugin) {
    existingPlugin.code = code
    existingPlugin.name = plugin.name
    existingPlugin.displayName = plugin.displayName || plugin.name
    return {
      metadata: plugin,
      message: `已更新插件'${plugin.displayName}', 刷新后生效`,
    }
  }
  const newPlugin = {
    code,
    displayName: plugin.name, // 默认等于 name
    ...plugin,
  }
  settings.userPlugins[plugin.name] = newPlugin
  plugins.push(newPlugin)
  // const { coreApis } = await import('../core/core-apis')
  // plugin.setup({
  //   coreApis,
  //   addData,
  //   addHook,
  //   registerData,
  //   registerAndGetData,
  //   getHook,
  // })
  return {
    metadata: plugin,
    message: `已安装插件'${plugin.displayName || plugin.name}', 刷新后生效`,
  }
}

/**
 * 卸载插件
 * @param nameOrDisplayName 插件的名称(`name`或`displayName`)
 */
export const uninstallPlugin = async (nameOrDisplayName: string) => {
  const { settings } = await import('@/core/settings')
  const existingPlugin = Object.entries(settings.userPlugins)
    .find(([name, { displayName }]) => {
      if (name === nameOrDisplayName || displayName === nameOrDisplayName) {
        return true
      }
      return false
    })
  if (!existingPlugin) {
    throw new Error(`没有找到与名称'${nameOrDisplayName}'相关联的插件`)
  }
  const [name, metadata] = existingPlugin
  delete settings.userPlugins[name]
  deleteValue(plugins, it => it.name === name)
  return {
    metadata,
    message: `已卸载插件'${metadata.displayName}', 刷新后生效`,
  }
}

/**
 * 提取组件自带的插件
 * @param component 组件
 * @returns 插件
 */
export const extractPluginFromComponent = (component: ComponentMetadata) => {
  if (!component.plugin) {
    return null
  }
  return {
    name: `${component.name}.plugin`,
    displayName: `${component.displayName} - 附带插件`,
    ...component.plugin,
  } as PluginMetadata
}
/**
 * 载入单个插件
 * @param plugin 插件基本信息
 */
export const loadPlugin = async (plugin: PluginMetadata) => {
  if (plugin.setup) {
    const { pluginLoadTrace } = await import('@/core/performance/plugin-trace')
    await pluginLoadTrace(plugin)
    const { coreApis } = await import('../core/core-apis')
    return plugin.setup({
      coreApis,
      addData,
      addHook,
      registerData,
      registerAndGetData,
      getHook,
    })
  }
  return null
}

/**
 * 载入所有插件, 包含传入组件里定义的插件, 内置的插件, 以及用户安装的插件
 * @param components 组件列表
 */
export const loadAllPlugins = async (components: ComponentMetadata[]) => {
  const { settings, getGeneralSettings } = await import('@/core/settings')
  const { batchParseCode } = await import('@/core/external-input')
  const otherPlugins = components
    .map(extractPluginFromComponent)
    .filter(p => p !== null)
    .concat(await batchParseCode<PluginMetadata>(
      Object.values(settings.userPlugins).map(p => p.code),
    ))
  plugins.push(...otherPlugins)
  return Promise.allSettled(
    plugins.map(loadPlugin),
  ).then(async () => {
    if (getGeneralSettings().devMode) {
      const { pluginLoadTime, pluginResolveTime } = await import('@/core/performance/plugin-trace')
      const { logStats } = await import('@/core/performance/stats')
      logStats('plugins block', pluginLoadTime)
      logStats('plugins resolve', pluginResolveTime)
    }
  })
}
