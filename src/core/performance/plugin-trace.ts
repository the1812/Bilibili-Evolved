import { PluginMetadata, PluginSetupParameters } from '@/plugins/plugin'

export const pluginLoadTime = new Map<PluginMetadata, number>()
export const pluginResolveTime = new Map<PluginMetadata, number>()
export const pluginLoadTrace = async (plugin: PluginMetadata) => {
  const { getGeneralSettings } = await import('../settings')
  if (!getGeneralSettings().devMode) {
    return
  }
  const originalSetup = plugin.setup
  plugin.setup = async (params: PluginSetupParameters) => {
    const start = performance.now()
    // originalSetup(params)
    let promise = originalSetup(params)
    const end = performance.now()
    if (promise instanceof Promise) {
      promise = await promise
    }
    const resolve = performance.now()
    pluginLoadTime.set(plugin, end - start)
    pluginResolveTime.set(plugin, resolve - start)
    return promise
  }
}
