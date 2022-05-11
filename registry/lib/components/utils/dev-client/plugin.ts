import { PluginSetupParameters } from '@/plugins/plugin'
import { ComponentAction } from '@/components/settings-panel/component-actions/component-actions'
import { isIframe } from '@/core/utils'
import { Toast } from '@/core/toast'
import { getComponentSettings } from '@/core/settings'
import { ComponentMetadata } from '@/components/types'
import { OptionsOfMetadata } from '@/components/define'
import { autoUpdateOptions, devClientOptionsMetadata } from './options'

export const setupPlugin = async ({ addData }: PluginSetupParameters) => {
  if (isIframe()) {
    return
  }
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
          return `http://localhost:${options.port}/registry/dist/components/${onlineMatch[1]}`
        }
        return null
      },
    }
    const getDebugInfo = (metadata: ComponentMetadata) => {
      const autoUpdateRecord = autoUpdateOptions.urls.components[metadata.name]
      const componentUpdateUrl = autoUpdateRecord?.url
      const isDebugging = () => componentUpdateUrl && devClient.sessions.some(path => {
        const { pathname } = new URL(componentUpdateUrl)
        return path === pathname
      })
      const canStartDebug = () => !isDebugging() && converter.toDevUrl(componentUpdateUrl) !== null
      const canStopDebug = () => Boolean(isDebugging() && componentUpdateUrl)
      return {
        autoUpdateRecord,
        componentUpdateUrl,
        canStartDebug,
        canStopDebug,
      }
    }
    actions.push(
      metadata => {
        const { componentUpdateUrl, autoUpdateRecord, canStartDebug } = getDebugInfo(metadata)
        const result = {
          name: 'startDebug',
          displayName: '开始调试',
          icon: 'mdi-play-network-outline',
          visible: canStartDebug(),
          action: async () => {
            const devUrl = converter.toDevUrl(componentUpdateUrl)
            console.log('devUrl:', devUrl, 'autoUpdateRecord.url:', autoUpdateRecord.url)
            if (autoUpdateRecord.url !== devUrl) {
              options.devRecords[metadata.name] = {
                name: metadata.name,
                originalUrl: componentUpdateUrl,
              }
              autoUpdateRecord.url = devUrl
            }
            const toast = Toast.info('启动调试中...', 'DevClient')
            try {
              await devClient.startDebug(autoUpdateRecord.url)
            } catch (error) {
              console.error(error)
            } finally {
              toast.close()
              result.visible = canStartDebug()
              console.log('visible', result.visible)
            }
          },
        }
        return result
      },
      metadata => {
        const { componentUpdateUrl, autoUpdateRecord, canStopDebug } = getDebugInfo(metadata)
        const result = {
          name: 'stopDebug',
          displayName: '停止调试',
          icon: 'mdi-minus-network-outline',
          visible: canStopDebug(),
          action: async () => {
            const { pathname } = new URL(componentUpdateUrl)
            await devClient.stopDebug(pathname)
            if (options.devRecords[metadata.name]) {
              autoUpdateRecord.url = options.devRecords[metadata.name].originalUrl
              delete options.devRecords[metadata.name]
            }
            result.visible = canStopDebug()
            console.log('visible', result.visible)
          },
        }
        return result
      },
    )
  })
}
