import { Component } from 'vue'

export type Executable<ReturnType = void> = () => ReturnType | Promise<ReturnType>
export type ExecutableWithParameter<Parameters extends any[] = never[], ReturnType = void> = (
  ...args: Parameters
) => ReturnType | Promise<ReturnType>

export type TestPattern = (string | RegExp)[]
export type ArrayContent<T> = T extends Array<infer R> ? R : T
export type VueModule = Component | { default: Component }
export type I18nDescription = string | { 'zh-CN': string; [key: string]: string }
export type WithName = {
  name: string
  displayName: string
}
