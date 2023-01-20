import { ComponentMetadata, FeatureBase } from '@/components/component'
import { deleteValue } from '@/core/utils'
import { CoreApis } from '@/core/core-apis'
import { addData, registerAndGetData, registerData } from './data'
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
export interface PluginMinimalData extends FeatureBase {
  /** 初始化函数, 可在其中注册数据, 添加代码注入等 */
  setup: (params: PluginSetupParameters) => void | Promise<void>
  /** 插件名称 */
  name: string
  /** 显示名称, 默认同插件名称 */
  displayName?: string
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
  return pluginPaths
    .map(path => {
      const m = context(path)
      if ('plugin' in m) {
        const plugin = m.plugin as PluginMetadata
        pluginsMap[plugin.name] = plugin
        return plugin
      }
      return undefined
    })
    .filter(it => it !== undefined) as PluginMetadata[]
})
/** 包含所有插件的数组 */
export const plugins: PluginMetadata[] = getBuiltInPlugins()

/**
 * 安装插件
 * @param code 插件代码
 */
export const installPlugin = async (code: string) => {
  const { loadFeatureCode } = await import('@/core/external-input')
  let plugin: PluginMetadata
  try {
    plugin = loadFeatureCode(code) as PluginMetadata
  } catch (e) {
    throw new Error('无效的插件代码', e)
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
  const existingPlugin = Object.entries(settings.userPlugins).find(
    ([name, { displayName }]) => name === nameOrDisplayName || displayName === nameOrDisplayName,
  )
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
  const { loadFeatureCode } = await import('@/core/external-input/load-feature-code')
  for (const component of components) {
    const plugin = extractPluginFromComponent(component)
    if (plugin) {
      plugins.push(plugin)
    }
  }
  for (const [name, setting] of Object.entries(settings.userPlugins)) {
    const { code } = setting
    let metadata: PluginMetadata
    try {
      metadata = loadFeatureCode(code) as PluginMetadata
    } catch (e) {
      console.error('从代码加载用户插件失败。代码可能包含语法错误或执行时产生了异常', {
        pluginName: name,
        error: e,
      })
      continue
    }
    plugins.push(metadata)
  }
  return Promise.allSettled(plugins.map(loadPlugin)).then(async () => {
    if (getGeneralSettings().devMode) {
      const { pluginLoadTime, pluginResolveTime } = await import('@/core/performance/plugin-trace')
      const { logStats } = await import('@/core/performance/stats')
      logStats('plugins block', pluginLoadTime)
      logStats('plugins resolve', pluginResolveTime)
    }
  })
}
