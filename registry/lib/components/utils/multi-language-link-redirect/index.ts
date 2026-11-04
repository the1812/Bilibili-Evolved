import { defineComponentMetadata } from '@/components/define'

// B 站国际版的语言路径
const localeUrlPattern =
  /^https:\/\/www\.bilibili\.com\/(?:en|th|vi|id|ja|zh-Hant|zh-Hans|ar|pt|es|tr|ru|ms)(?=\/|[?#]|$)/i

export const component = defineComponentMetadata({
  name: 'multiLanguageLinkRedirect',
  displayName: '多语言链接重定向',
  tags: [componentsTags.utils],
  author: {
    name: 'WhiteTeal55',
    link: 'https://github.com/WhiteTeal55',
  },
  entry: () => {
    location.replace(location.href.replace(localeUrlPattern, 'https://www.bilibili.com'))
  },
  urlInclude: [localeUrlPattern],
})
