/*
 * 旧版 Switch Options API, 暂时保留, 避免本体升级后组件未更新造成报错
 */
import { getComponentSettings, addComponentListener } from '@/core/settings'
import { ComponentMetadata, OptionsMetadata } from './component'

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
  dimAt?: 'checked' | 'notChecked'
  switchProps?: {
    checkedIcon?: string
    notCheckedIcon?: string
    iconPosition?: 'left' | 'right'
  }
}

/** @deprecated */
export const createSwitchOptions = (options: SwitchOptions) => {
  if (options.radio === undefined) {
    options.radio = false
  }
  const { name: optionName, switches } = options
  const extendComponentOptions: OptionsMetadata = {}
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
    }
    Object.assign(options, selfOption)
    extendComponentOptions[optionName] = {
      defaultValue: options,
      displayName: optionDisplayName,
    }
    component.options = { ...component.options, ...extendComponentOptions }
    if (!component.widget) {
      component.widget = {
        component: () => import('./SwitchOptions.vue').then(m => m.default),
        options,
      }
    }
    const originalEntry = component.entry
    component.entry = async (...args) => {
      originalEntry?.(...args)
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
    }
    return component
  }
}
