import marked from 'marked'
import { ComponentMetadata } from './component'
import { getSelectedLanguage } from './i18n/helpers'
import { Executable } from '@/core/common-types'

type ItemWithDescription = Pick<ComponentMetadata, 'description'>

/**
 * 读取当前语言的功能描述 (Markdown)
 * @param item 功能
 */
export const getDescriptionMarkdown = async (item: ItemWithDescription) => {
  const { description } = item
  if (!description) {
    return '暂无描述.'
  }
  const input: string | Executable<string> =
    typeof description === 'object'
      ? description[getSelectedLanguage()] ?? description['zh-CN']
      : description
  return typeof input === 'string' ? input : input()
}

/**
 * 同 `getDescriptionMarkdown`, 将最后的 Markdown 转为 HTML string
 * @param item 功能
 */
export const getDescriptionHTML = async (item: ItemWithDescription) =>
  marked(await getDescriptionMarkdown(item))
/**
 * 同 `getDescriptionMarkdown`, 将最后的 Markdown 转为纯文本 (innerText)
 * @param item 功能
 */
export const getDescriptionText = async (item: ItemWithDescription) => {
  const html = await getDescriptionHTML(item)
  const div = document.createElement('div')
  div.innerHTML = html
  return div.innerText
}
