import { ComponentMetadata } from '@/components/types'
import { installComponent } from '@/components/user-component'
import { getHook } from '@/plugins/hook'
import { installPlugin, PluginMetadata } from '@/plugins/plugin'
import { installStyle, UserStyle } from '@/plugins/style'

type FeatureType = ComponentMetadata | PluginMetadata | UserStyle
const isComponent = (item: FeatureType): item is ComponentMetadata =>
  Boolean((item as ComponentMetadata)?.entry)
const isPlugin = (item: FeatureType): item is PluginMetadata =>
  Boolean((item as PluginMetadata)?.setup)
const isStyle = (item: FeatureType): item is UserStyle => Boolean((item as UserStyle)?.style)

/** 如果输入的功能链接是 .zip, 则尝试解压. 仅支持单个功能, 不能批量, 只是为了能方便在 GitHub 直接以 .zip 格式分享功能. */
export const tryParseZip = async (url: string) => {
  const { JSZipLibrary } = await import('./runtime-library')
  const { monkey } = await import('../core/ajax')
  const isZip = url.endsWith('.zip')
  const responseType = isZip ? 'blob' : 'text'
  const response = (await monkey({ url, method: 'GET', responseType })) as Blob | string
  if (!isZip || typeof response === 'string') {
    return response as string
  }
  const JSZip = await JSZipLibrary
  const zip = await JSZip.loadAsync(response)
  const files = Object.values(zip.files)
  if (files.length === 0) {
    throw new Error('Empty zip file')
  }
  return files[0].async('text')
}
export const installFeatureFromCode = async (
  code: string,
  url?: string,
): Promise<{
  metadata: FeatureType
  message: string
}> => {
  const { loadFeatureCode } = await import('../core/external-input')
  const item = loadFeatureCode(code) as FeatureType
  const { type, installer } = (() => {
    if (isComponent(item)) {
      return {
        type: 'component',
        installer: () => installComponent(code),
      }
    }
    if (isPlugin(item)) {
      return {
        type: 'plugin',
        installer: () => installPlugin(code),
      }
    }
    if (isStyle(item)) {
      return {
        type: 'style',
        installer: () => installStyle(code),
      }
    }
    throw new Error('无效的功能代码')
  })()

  const { before, after } = getHook(`user${lodash.startCase(type)}s.add`, code, url)
  await before()
  const installerResult = await installer()
  await after(installerResult.metadata)
  return installerResult
}
export const installFeature = async (
  url: string,
): Promise<{
  metadata: FeatureType
  message: string
}> => {
  const code = await tryParseZip(url)
  return installFeatureFromCode(code, url)
}
