import { addStyle } from '@/core/style'

export interface LoadStyleOptions<D> {
  style: string | ((dep: D) => any)
  name?: string
  container?: HTMLElement
}

export const loadStyle = <D>({ style, name, container }: LoadStyleOptions<D>) => {
  let styleElement
  const complete = () => styleElement?.remove()
  const next = (dep: D) => {
    complete()
    const styleText = typeof style === 'function' ? style(dep) : style
    if (!styleText) {
      return
    }
    styleElement = addStyle(styleText, name, container)
  }
  return {
    next,
    complete,
  }
}
