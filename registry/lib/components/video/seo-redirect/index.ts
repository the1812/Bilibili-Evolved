import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'seoRedirect',
  displayName: 'SEO 页面重定向',
  entry: () => {
    window.location.assign(document.URL.replace('/s/', '/'))
  },
  urlInclude: ['//www.bilibili.com/s/video/'],
  tags: [componentsTags.video],
})
