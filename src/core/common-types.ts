import type { ComponentPublicInstance } from 'vue'

export type Executable<ReturnType = void> = () => Promise<ReturnType> | ReturnType
export type ExecutableWithParameter<Parameters extends any[] = never[], ReturnType = void> = (
  ...args: Parameters
) => ReturnType | Promise<ReturnType>

export type TestPattern = (string | RegExp)[]
export type ArrayContent<T> = T extends Array<infer R> ? R : T
export type ImportedType<T> = { default: T } | T
export type ImportedVueComponent = ImportedType<new () => ComponentPublicInstance>

type DescriptionInput = string | Executable<string>
export type I18nDescription =
  | DescriptionInput
  | { 'zh-CN': DescriptionInput; [key: string]: DescriptionInput }
export interface WithName {
  name: string
  displayName: string
}
