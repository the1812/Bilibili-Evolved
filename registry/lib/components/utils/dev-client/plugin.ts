import { PluginSetupParameters } from '@/plugins/plugin'
import { ComponentAction } from '@/components/settings-panel/component-actions/component-actions'
import { monkey } from '@/core/ajax'
import { getComponentSettings } from '@/core/settings'
import { OptionsOfMetadata } from '@/components/define'
import { autoUpdateOptions, devClientOptionsMetadata } from './options'

export const setupPlugin = async ({ addData }: PluginSetupParameters) => {
  const { options } = getComponentSettings<OptionsOfMetadata<typeof devClientOptionsMetadata>>('devClient')
  const { devClient } = await import('./client')
  addData('settingsPanel.componentActions', (actions: ComponentAction[]) => {
    const converter = {
      toDevUrl: (url: string) => {
        if (!url) {
          return null
        }
        const devUrlMatch = url.match(new RegExp(`localhost:${options.port}\\/registry\\/components\\/(.+)$`))
        if (devUrlMatch) {
          return url
        }
        const localhostMatch = url.match(/localhost:(\d+?)\/components\/(.+)$/)
        if (localhostMatch) {
          return `http://localhost:${options.port}/registry/dist/components/${localhostMatch[2]}`
        }
        const onlineMatch = url.match(/\/registry\/dist\/components\/(.+)$/)
        if (onlineMatch) {
          return `http://localhost:${options.port}/registry/dist/components/${onlineMatch[2]}`
        }
        return null
      },
    }
    actions.push(
      metadata => {
        const autoUpdateRecord = autoUpdateOptions.urls.components[metadata.name]
        const componentUpdateUrl = autoUpdateRecord?.url
        const isDebugging = componentUpdateUrl && devClient.sessions.some(path => {
          const { pathname } = new URL(componentUpdateUrl)
          return path === pathname
        })
        return {
          name: 'startDebug',
          displayName: '开始调试',
          icon: 'mdi-play-network-outline',
          condition: () => !isDebugging && converter.toDevUrl(componentUpdateUrl) !== null,
          action: async () => {
            const devUrl = converter.toDevUrl(componentUpdateUrl)
            if (autoUpdateRecord.url !== devUrl) {
              options.devRecords[metadata.name] = {
                name: metadata.name,
                originalUrl: componentUpdateUrl,
              }
              autoUpdateRecord.url = devUrl
            }
            await monkey({ url: autoUpdateRecord.url })
          },
        }
      },
      metadata => {
        const autoUpdateRecord = autoUpdateOptions.urls.components[metadata.name]
        const componentUpdateUrl = autoUpdateRecord?.url
        const isDebugging = devClient.sessions.some(path => {
          const { pathname } = new URL(componentUpdateUrl)
          return path === pathname
        })
        return {
          name: 'stopDebug',
          displayName: '停止调试',
          icon: 'mdi-minus-network-outline',
          condition: () => Boolean(isDebugging && componentUpdateUrl),
          action: async () => {
            const { pathname } = new URL(componentUpdateUrl)
            devClient.stopDebugging(pathname)
            if (options.devRecords[metadata.name]) {
              autoUpdateRecord.url = options.devRecords[metadata.name].originalUrl
            }
          },
        }
      },
    )
  })
}
