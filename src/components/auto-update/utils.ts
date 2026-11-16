import { getComponentSettings, settings } from '@/core/settings'
import { FeatureSource, getFeatureUrl, isLocalFeatureUrl } from '@/core/feature-source'
import { isFeatureAcceptable } from '@/core/version'
import type { AutoUpdateOptions } from '.'

export const name = 'autoUpdate'
export interface UpdateCheckItem {
  source?: FeatureSource
  lastUpdateCheck: number
  installTime: number
  alwaysUpdate?: boolean
}
export const updateKinds = ['components', 'plugins', 'styles'] as const
export type UpdateKind = (typeof updateKinds)[number]
export type UpdateRecord = Record<UpdateKind, Record<string, UpdateCheckItem>>
export interface CheckSingleTypeUpdateConfig {
  filterNames?: string[]
  force?: boolean
  maxCount?: number
}
export type CheckSingleTypeUpdate = (config?: CheckSingleTypeUpdateConfig) => Promise<string>
export interface CheckUpdateConfig extends CheckSingleTypeUpdateConfig {
  kind: UpdateKind
  items: Record<string, UpdateCheckItem>
  existPredicate?: (name: string) => boolean
  // installer: (code: string) => Promise<{ message: string }>
}
export const defaultExistPredicate = (itemName: string, kind: UpdateKind) =>
  settings[`user${lodash.startCase(kind)}`][itemName] !== undefined

export const updateFeature = async (source: FeatureSource | undefined) => {
  let url = getFeatureUrl(source)
  if (isLocalFeatureUrl(url)) {
    const { options } = getComponentSettings<AutoUpdateOptions>(name)
    if (options.localPortOverride) {
      const localUrl = new URL(url)
      localUrl.port = options.localPortOverride
      url = localUrl.href
    }
  }
  const { tryParseZip, installFeatureFromCode } = await import('@/core/install-feature')
  const code = await tryParseZip(url)
  if (!code) {
    throw new Error('更新下载失败, 取消更新')
  }
  if (!(await isFeatureAcceptable(code))) {
    throw new Error('版本不匹配, 取消更新')
  }
  return installFeatureFromCode(code, source)
}
