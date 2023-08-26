import {
  addComponentListener,
  getComponentSettings,
  getGeneralSettings,
  isComponentEnabled,
} from '@/core/settings'
import { contentLoaded, fullyLoaded } from '@/core/life-cycle'
import { LoadingMode } from '@/core/loading-mode'
import { Widget } from '@/components/widget'
import { ComponentMetadata } from './types'
import { getBuiltInComponents } from './built-in-components'

/** 可根据组件名称检索对应的`ComponentMetadata` */
export const componentsMap: { [name: string]: ComponentMetadata } = {}
const getAllComponents = lodash.once(() => {
  const builtIns = getBuiltInComponents()
  builtIns.forEach(c => (componentsMap[c.name] = c))
  return builtIns
})
/** 包含所有组件的数组 */
export const components: ComponentMetadata[] = getAllComponents()

/** 载入组件的 i18n 数据 */
const loadI18n = async (component: ComponentMetadata) => {
  if (!component.i18n) {
    return
  }
  const { addI18nData } = await import('@/components/i18n/helpers')
  for (const [language, data] of Object.entries(component.i18n)) {
    const { map = [], regex = [] } = typeof data === 'function' ? await data() : data
    addI18nData(language, map, regex)
  }
}
/** 获取组件内置Widget名称 */
const getComponentWidgetName = (component: ComponentMetadata) => `${component.name}.widget`
/** 提取组件中的Widget */
const loadWidget = async (component: ComponentMetadata) => {
  if (component.widget) {
    const widget: Widget = {
      ...component.widget,
      name: getComponentWidgetName(component),
    }
    const { addData } = await import('@/plugins/data')
    const { WidgetsPlugin } = await import('./settings-panel')
    addData(WidgetsPlugin, (widgets: Widget[]) => {
      if (widgets.find(w => w.name === widget.name)) {
        return
      }
      const { urlInclude, urlExclude } = widget
      if (component.urlInclude) {
        if (urlInclude) {
          urlInclude.push(...component.urlInclude)
        } else {
          widget.urlInclude = [...component.urlInclude]
        }
      }
      if (component.urlExclude) {
        if (urlExclude) {
          urlExclude.push(...component.urlExclude)
        } else {
          widget.urlExclude = [...component.urlExclude]
        }
      }
      widgets.push(widget)
    })
  }
}
/** 已加载的组件可以用 name 检索其导出对象 */
const loadedComponents: Record<string, Record<string, any>> = {}
/** 获取已加载组件的导出内容
 * @param name 组件名称
 */
export const importComponent = <ComponentExportType>(
  name: string,
): Record<string, ComponentExportType> => {
  if (!(name in loadedComponents)) {
    throw new Error(`组件'${name}'未加载, 请确认拼写无误且组件已开启.`)
  }
  return loadedComponents[name]
}
/**
 * 加载单个组件
 * @param component 组件信息
 */
export const loadComponent = async (component: ComponentMetadata) => {
  const { componentLoadTrace } = await import('@/core/performance/component-trace')
  const { matchUrlPattern } = await import('@/core/utils')
  const { coreApis } = await import('@/core/core-apis')
  await componentLoadTrace(component)
  const load = async () => {
    loadWidget(component)
    const data = await component.entry({
      settings: getComponentSettings(component),
      metadata: component,
      coreApis,
    })
    loadedComponents[component.name] = (data as any) || {}
  }
  if (component.reload && component.unload) {
    addComponentListener(component.name, async (enable: boolean) => {
      if (component.configurable === false) {
        return
      }
      if (component.urlExclude && component.urlExclude.some(matchUrlPattern)) {
        return
      }
      if (component.urlInclude && component.urlInclude.every(lodash.negate(matchUrlPattern))) {
        return
      }
      if (component.name in loadedComponents) {
        if (enable && component.reload) {
          component.reload()
          if (component.widget) {
            loadWidget(component)
          }
        }
        if (!enable && component.unload) {
          component.unload()
          if (component.widget) {
            const { getData } = await import('@/plugins/data')
            const { WidgetsPlugin } = await import('./settings-panel')
            const [widgets] = getData(WidgetsPlugin) as [Widget[]]
            if (widgets) {
              const widgetName = getComponentWidgetName(component)
              const index = widgets.findIndex(w => w.name === widgetName)
              if (index !== -1) {
                widgets.splice(index, 1)
              }
            }
          }
        }
      } else if (enable) {
        await load()
      }
    })
  }
  if (isComponentEnabled(component)) {
    await load()
  }
}
/** 加载所有用户组件的定义 (不运行) */
export const loadAllUserComponents = async () => {
  const { settings } = await import('@/core/settings')
  const { loadFeatureCode } = await import('@/core/external-input/load-feature-code')

  const loadUserComponent = (component: ComponentMetadata) => {
    components.push(component)
    componentsMap[component.name] = component
  }

  for (const [name, setting] of Object.entries(settings.userComponents)) {
    const { code } = setting
    let metadata: ComponentMetadata
    try {
      metadata = loadFeatureCode(code) as ComponentMetadata
    } catch (e) {
      console.error('从代码加载用户组件失败。代码可能有语法错误或代码执行时有抛出值。', {
        componentName: name,
        error: e,
      })
      continue
    }
    loadUserComponent(metadata)
  }
}
/** 载入所有组件 */
export const loadAllComponents = async () => {
  const generalSettings = getGeneralSettings()
  const { loadAllPlugins } = await import('@/plugins/plugin')
  const loadComponents = () =>
    loadAllPlugins(components)
      .then(() => Promise.all(components.map(loadI18n)))
      .then(() => Promise.all(components.map(loadComponent)))
      .then(async () => {
        if (generalSettings.devMode) {
          const { componentLoadTime, componentResolveTime } = await import(
            '@/core/performance/component-trace'
          )
          const { logStats } = await import('@/core/performance/stats')
          logStats('components block', componentLoadTime)
          logStats('components resolve', componentResolveTime)
        }
      })
  return new Promise((resolve, reject) => {
    if (generalSettings.scriptLoadingMode === LoadingMode.Delay) {
      fullyLoaded(() => loadComponents().then(resolve).catch(reject))
    } else if (generalSettings.scriptLoadingMode === LoadingMode.Race) {
      contentLoaded(() => loadComponents().then(resolve).catch(reject))
    }
  })
}

export * from './types'
export * from './define'
