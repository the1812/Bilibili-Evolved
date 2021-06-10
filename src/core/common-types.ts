import { VueConstructor } from 'vue'

export type Executable<T = void> = () => T | Promise<T>
export type TestPattern = (string | RegExp)[]
export type VueModule = VueConstructor | { default: VueConstructor }
