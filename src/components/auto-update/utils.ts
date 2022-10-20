import { settings } from '@/core/settings'

export const name = 'autoUpdate'
export interface UpdateCheckItem {
  url: string
  lastUpdateCheck: number
  installTime: number
  alwaysUpdate?: boolean
}
export const localhost = /^http:\/\/localhost/
export type UpdateRecord = Record<string, Record<string, UpdateCheckItem>>
export interface CheckSingleTypeUpdateConfig {
  filterNames?: string[]
  force?: boolean
  maxCount?: number
}
export type CheckSingleTypeUpdate = (config?: CheckSingleTypeUpdateConfig) => Promise<string>
export interface CheckUpdateConfig extends CheckSingleTypeUpdateConfig {
  items: Record<string, UpdateCheckItem>
  existPredicate?: (name: string) => boolean
  // installer: (code: string) => Promise<{ message: string }>
}
export const isLocalItem = (url: string) => localhost.test(url)
export const defaultExistPredicate = (itemName: string) =>
  settings.userComponents[itemName] !== undefined ||
  settings.userPlugins[itemName] !== undefined ||
  settings.userStyles[itemName] !== undefined
