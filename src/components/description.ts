import marked from 'marked'
import { languageNameToCode } from '@/core/utils/i18n'
import { ComponentMetadata } from './component'
import { getSelectedLanguage } from './i18n/helpers'

type ItemWithDescription = Pick<ComponentMetadata, 'description' | 'author'>

/**
 * 读取功能的 `description` 和 `author`, 生成描述 (Markdown)
 * @param item 功能
 */
export const getDescriptionMarkdown = (item: ItemWithDescription) => {
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
  const descriptionText = (() => {
    if (!description) {
      // if (options && Object.keys(options).length > 0) {
      //   const count = Object.keys(options).length
      //   return `${count}个选项`
      // }
      return '暂无描述.'
      // return ''
    }
    if (typeof description === 'string') {
      return description
    }
    return (
      description[languageNameToCode(getSelectedLanguage())]
      || description['zh-CN']
    )
  })()
  return authorPrefix + descriptionText
}

/**
 * 同 `getDescriptionMarkdown`, 将最后的 Markdown 转为 HTML string
 * @param item 功能
 */
export const getDescriptionHTML = (item: ItemWithDescription) => marked(
  getDescriptionMarkdown(item),
)
/**
 * 同 `getDescriptionMarkdown`, 将最后的 Markdown 转为纯文本 (innerText)
 * @param item 功能
 */
export const getDescriptionText = (item: ItemWithDescription) => {
  const html = getDescriptionHTML(item)
  const div = document.createElement('div')
  div.innerHTML = html
  return div.innerText
}
