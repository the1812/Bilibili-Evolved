import { ComponentMetadata } from '@/components/component'

export const componentLoadTime = new Map<ComponentMetadata, number>()
export const componentResolveTime = new Map<ComponentMetadata, number>()
export const componentLoadTrace = async (component: ComponentMetadata) => {
  const { getGeneralSettings } = await import('../settings')
  if (!getGeneralSettings().devMode) {
    return
  }
  const originalEntry = component.entry
  component.entry = async context => {
    const { metadata: c } = context
    const start = performance.now()
    // originalEntry(componentSettings, c)
    let promise = originalEntry(context)
    const end = performance.now()
    if (promise instanceof Promise) {
      promise = await promise
    }
    const resolve = performance.now()
    componentLoadTime.set(c, end - start)
    componentResolveTime.set(c, resolve - start)
    return promise
  }
}
