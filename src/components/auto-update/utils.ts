import { settings } from '@/core/settings'
import type { FeatureSource } from '@/core/feature-source'

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
