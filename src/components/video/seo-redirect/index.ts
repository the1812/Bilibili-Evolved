import { ComponentMetadata, componentsTags } from '@/components/component'

export const component: ComponentMetadata = {
  name: 'seoRedirect',
  displayName: 'SEO页面重定向',
  entry: () => {
    window.location.assign(document.URL.replace('/s', ''))
  },
  urlInclude: [
    '//www.bilibili.com/s/video/',
  ],
  tags: [
    componentsTags.video,
    componentsTags.utils,
  ],
  description: {
    'zh-CN': '进入SEO视频页面时 (`https://www.bilibili.com/s/video/`) 自动跳转到原视频页面.',
  },
}
