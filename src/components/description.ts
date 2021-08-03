import { languageNameToCode } from '@/core/utils/i18n'
import marked from 'marked'
import { ComponentMetadata } from './component'
import { getSelectedLanguage } from './i18n/helpers'

export const getDescriptionMarkdown = (component: ComponentMetadata) => {
  const { description, author } = component
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
export const getDescriptionHTML = (component: ComponentMetadata) => marked(
  getDescriptionMarkdown(component),
)
export const getDescriptionText = (component: ComponentMetadata) => {
  const html = getDescriptionHTML(component)
  const div = document.createElement('div')
  div.innerHTML = html
  return div.innerText
}
