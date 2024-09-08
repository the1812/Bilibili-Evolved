import {
  ComponentMetadata,
  DomInstantStyleDefinition,
  ShadowDomInstantStyleDefinition,
} from '@/components/types'
import { contentLoaded } from './life-cycle'
import { shadowRootStyles } from './shadow-root'

/** 为`<style>`获取默认的ID (camelCase转为kebab-case) */
export const getDefaultStyleID = (name: string) =>
  name.replace(/([a-z][A-Z])/g, g => `${g[0]}-${g[1].toLowerCase()}`)
/**
 * 向文档添加样式
 * @param text 样式内容
 * @param name 样式名称, 输入空字符串则会创建匿名样式
 * @param container 样式的容器元素, 默认为`<head>`
 * @returns 创建得到的样式元素
 */
export const addStyle = (text: string, name?: string, container?: HTMLElement) => {
  const id = name ? getDefaultStyleID(name) : null
  const existing = dq(`#${id}`)
  if (!existing || !name) {
    const style = document.createElement('style')
    style.id = id
    style.textContent = text
    ;(container || document.head).insertAdjacentElement('beforeend', style)
    return style
  }
  return existing as HTMLStyleElement
}
/**
 * 向文档添加重要样式(覆盖B站使用的`!important`), 插入位置为`<body>`内末尾处
 * @param text 样式内容
 * @param name 样式名称, 输入空字符串则会创建匿名样式
 */
export const addImportantStyle = (text: string, name?: string) =>
  addStyle(text, name, document.body)
/**
 * 根据名称删除样式
 * @param names 样式名称列表
 */
export const removeStyle = (...names: string[]) => {
  names.forEach(name => {
    const id = getDefaultStyleID(name)
    document.getElementById(id)?.remove()
  })
}
/**
 * 加载单个组件中的首屏样式
 * @param component 组件
 * @param fragments 注入的目标容器, 默认为 document, 可以使用其他 Node
 */
export const loadInstantStyle = async (
  component: ComponentMetadata,
  fragments: {
    head: Node
    body: Node
  } = { head: document.head, body: document.body },
) => {
  component.instantStyles?.forEach(async it => {
    const styleContent = await (async () => {
      if (typeof it.style === 'string') {
        return it.style
      }
      const module = await it.style()
      return module.default
    })()

    if ((it as ShadowDomInstantStyleDefinition).shadowDom) {
      shadowRootStyles.addStyle({
        id: it.name,
        style: styleContent,
      })
      return
    }

    const style = document.createElement('style')
    style.id = getDefaultStyleID(it.name)
    style.textContent = styleContent
    if ((it as DomInstantStyleDefinition).important) {
      fragments.body.appendChild(style)
    } else {
      fragments.head.appendChild(style)
    }
  })
}

/**
 * 移除首屏样式
 */
export const removeInstantStyle = (
  ...instantStyles: (DomInstantStyleDefinition | ShadowDomInstantStyleDefinition)[]
) => {
  instantStyles.forEach(style => {
    if ((style as ShadowDomInstantStyleDefinition).shadowDom) {
      shadowRootStyles.removeStyle(style.name)
    } else {
      removeStyle(style.name)
    }
  })
}

/**
 * 注入组件中定义的首屏样式, MDI图标样式, 以及主题颜色样式
 *
 * 其他非首屏样式应使用`addStyle`注入
 */
export const preloadStyles = lodash.once(async () => {
  const { LoadingMode } = await import('./loading-mode')
  const { addHook } = await import('../plugins/hook')
  const {
    getGeneralSettings,
    settings,
    isComponentEnabled,
    isUserComponent,
    addComponentListener,
    removeComponentListener,
  } = await import('./settings')
  const load = async () => {
    const { components } = await import('@/components/component')
    const fragment = document.createDocumentFragment()
    const bodyFragment = document.createDocumentFragment()
    await Promise.all(
      components.map(component => {
        const listener = (enabled: boolean) => {
          if (enabled) {
            return loadInstantStyle(component)
          }
          return component.instantStyles?.forEach(style => removeInstantStyle(style))
        }
        addComponentListener(component.name, listener)
        if (isUserComponent(component)) {
          addHook('userComponents.remove', {
            after: (metadata: ComponentMetadata) => {
              if (metadata.name === component.name) {
                removeComponentListener(component.name, listener)
              }
            },
          })
        }
        if (!isComponentEnabled(component)) {
          return undefined
        }
        return loadInstantStyle(component, { head: fragment, body: bodyFragment })
      }),
    )
    const { UserStyleMode: CustomStyleMode } = await import('@/plugins/style')
    Object.values(settings.userStyles)
      .filter(c => c.mode === CustomStyleMode.Instant)
      .forEach(c => {
        const style = document.createElement('style')
        style.id = getDefaultStyleID(c.name)
        style.textContent = c.style
        fragment.appendChild(style)
      })
    document.head.appendChild(fragment)
    contentLoaded(() => document.body.appendChild(bodyFragment))
  }
  if (getGeneralSettings().styleLoadingMode === LoadingMode.Delay) {
    await contentLoaded(load)
  } else {
    await load()
  }
  contentLoaded(async () => {
    const { initColors } = await import('./theme-color')
    const { initMdiStyle } = await import('@/ui/mdi')
    document.head.appendChild(initColors())
    const mdi = initMdiStyle()
    document.head.appendChild(mdi)
  })
})

/** 载入所有自定义样式 */
export const loadAllCustomStyles = async () => {
  const { settings } = await import('./settings')
  const { UserStyleMode: CustomStyleMode } = await import('@/plugins/style')
  contentLoaded(() => {
    Object.values(settings.userStyles)
      .filter(c => c.mode === CustomStyleMode.Important)
      .forEach(c => {
        addStyle(c.style, c.name, document.body)
      })
  })
  Object.values(settings.userStyles)
    .filter(c => c.mode === CustomStyleMode.Default)
    .forEach(c => {
      addStyle(c.style, c.name, document.head)
    })
}
