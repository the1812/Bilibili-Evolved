import { ComponentMetadata, ComponentOptions } from './component'

type Switches = {
  [key: string]: {
    displayName: string
    defaultValue: boolean
  }
}
export interface SwitchOptions {
  name: string
  switches: Switches
  radio?: boolean
}
export const createSwitchOptions = (options: SwitchOptions) => {
  if (options.radio === undefined) {
    options.radio = false
  }
  const { name: optionName, switches } = options
  const extendComponentOptions: ComponentOptions = {}
  Object.entries(switches).forEach(([key, { displayName, defaultValue }]) => {
    extendComponentOptions[`switch-${key}`] = {
      defaultValue,
      displayName,
      hidden: true,
    }
  })
  return (component: ComponentMetadata) => {
    const optionDisplayName = `${component.displayName}选项`
    const selfOption = {
      componentName: component.name,
      optionDisplayName,
      ...options,
    }
    extendComponentOptions[optionName] = {
      defaultValue: selfOption,
      displayName: optionDisplayName,
    }
    component.options = { ...component.options, ...extendComponentOptions }
    if (!component.widget) {
      component.widget = {
        component: () => import('./SwitchOptions.vue').then(m => m.default),
        options: selfOption,
      }
    }
    const originalEntry = component.entry
    component.entry = async (...args) => {
      const { getComponentSettings, addComponentListener } = await import('@/core/settings')
      const { name } = component
      const componentOptions = getComponentSettings(name).options
      Object.keys(componentOptions).forEach(key => {
        if (key.startsWith('switch-')) {
          addComponentListener(
            `${name}.${key}`,
            (value: boolean) => {
              document.body.classList.toggle(`${name}-${key}`, value)
            },
            true,
          )
        }
      })
      originalEntry(...args)
    }
    return component
  }
}
