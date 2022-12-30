import marked from 'marked'
import { ComponentMetadata } from './component'
import { getSelectedLanguage } from './i18n/helpers'
import { Executable } from '@/core/common-types'

type ItemWithDescription = Pick<ComponentMetadata, 'description' | 'author'>

/**
 * 读取功能的 `description` 和 `author`, 生成描述 (Markdown)
 * @param item 功能
 */
export const getDescriptionMarkdown = async (item: ItemWithDescription) => {
  const { description, author } = item
  const authorPrefix = (() => {
    if (!author) {
      return ''
    }
    if (Array.isArray(author)) {
      return `by ${author.map(a => `[@${a.name}](${a.link})`).join(',')}\n\n`
    }
    return `by [@${author.name}](${author.link})\n\n`
  })()
  const descriptionText = await (async () => {
    if (!description) {
      return '暂无描述.'
    }
    const parseDescriptionInput = async (input: string | Executable<string>) => {
      if (typeof input === 'string') {
        return input
      }
      return input()
    }
    if (typeof description === 'object') {
      const currentLanguage = getSelectedLanguage()
      const input = description[currentLanguage] ?? description['zh-CN']
      return parseDescriptionInput(input)
    }
    return parseDescriptionInput(description)
  })()
  return authorPrefix + descriptionText
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
