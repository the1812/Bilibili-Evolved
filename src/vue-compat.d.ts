declare module 'vue' {
  import type { CompatVue } from '@vue/runtime-dom'

  const Vue: CompatVue
  export * from '@vue/runtime-dom'
  const { configureCompat } = Vue
  export { configureCompat }
}
