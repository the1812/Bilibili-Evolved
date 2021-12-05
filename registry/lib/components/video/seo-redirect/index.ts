import { ComponentMetadata } from '@/components/types'

export const component: ComponentMetadata = {
  name: 'seoRedirect',
  displayName: 'SEO 页面重定向',
  entry: () => {
    window.location.assign(document.URL.replace('/s/', '/'))
  },
  urlInclude: [
    '//www.bilibili.com/s/video/',
  ],
  tags: [
    componentsTags.video,
  ],
  description: {
    'zh-CN': '进入 SEO 视频页面时 (`https://www.bilibili.com/s/video/`) 自动跳转到原视频页面.',
  },
}
