import { ComponentMetadata } from '@/components/types'
import { installComponent } from '@/components/user-component'
import { getHook } from '@/plugins/hook'
import { installPlugin, PluginMetadata } from '@/plugins/plugin'
import { installStyle, UserStyle } from '@/plugins/style'
import { FeatureSource, getFeatureSource, getFeatureUrl } from './feature-source'
import type { FeatureType } from './feature-types'

type FeatureMetadata = ComponentMetadata | PluginMetadata | UserStyle
const isComponent = (item: FeatureMetadata): item is ComponentMetadata =>
  typeof (item as ComponentMetadata)?.entry === 'function'
const isPlugin = (item: FeatureMetadata): item is PluginMetadata =>
  typeof (item as PluginMetadata)?.setup === 'function'
const isStyle = (item: FeatureMetadata): item is UserStyle =>
  typeof (item as UserStyle)?.style === 'string'

export const readFeatureZip = async (response: Blob) => {
  const { FflateLibrary } = await import('./runtime-library')
  const fflate = await FflateLibrary
  const buffer = new Uint8Array(await response.arrayBuffer())
  const files = await new Promise<Record<string, Uint8Array>>((resolve, reject) => {
    fflate.unzip(buffer, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
  const fileNames = Object.keys(files)
  if (fileNames.length === 0) {
    throw new Error('Empty zip file')
  }
  return new TextDecoder().decode(files[fileNames[0]])
}
/** ZIP 链接用于分享单个功能文件 */
export const tryParseZip = async (url: string) => {
  const { monkey } = await import('./ajax')
  const isZip = url.endsWith('.zip')
  const responseType = isZip ? 'blob' : 'text'
  const response = (await monkey({ url, method: 'GET', responseType })) as Blob | string
  return typeof response === 'string' ? response : readFeatureZip(response)
}

export const installFeatureFromCode = async (
  code: string,
  input?: string | FeatureSource,
): Promise<{
  metadata: FeatureMetadata
  message: string
}> => {
  const { loadFeatureCode } = await import('../core/external-input')
  const item = loadFeatureCode(code) as FeatureMetadata
  const { type, installer } = (() => {
    if (isComponent(item)) {
      return {
        type: 'component',
        installer: () => installComponent(code, item),
      }
    }
    if (isPlugin(item)) {
      return {
        type: 'plugin',
        installer: () => installPlugin(code, item),
      }
    }
    if (isStyle(item)) {
      return {
        type: 'style',
        installer: () => installStyle(item),
      }
    }
    throw new Error('无效的功能代码')
  })() satisfies { type: FeatureType }

  const source = typeof input === 'string' ? getFeatureSource(input) : input
  const url = typeof input === 'object' ? getFeatureUrl(input) : input
  const { before, after } = getHook(`user${lodash.startCase(type)}s.add`, code, url)
  await before()
  const installerResult = await installer()
  await after(installerResult.metadata, source)
  return installerResult
}
export const installFeature = async (
  input: string | FeatureSource,
): Promise<{
  metadata: FeatureMetadata
  message: string
}> => {
  const code = await tryParseZip(typeof input === 'string' ? input : getFeatureUrl(input))
  return installFeatureFromCode(code, input)
}
