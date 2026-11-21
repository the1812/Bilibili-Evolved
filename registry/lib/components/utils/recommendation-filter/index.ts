import { defineComponentMetadata } from '@/components/define'
import { componentName, options } from './options'
import { activate, deactivate } from './runtime'

export const component = defineComponentMetadata({
  name: componentName,
  displayName: '过滤推荐内容',
  author: { name: '3215115794', link: 'https://github.com/3215115794' },
  tags: [componentsTags.video, componentsTags.utils],
  urlInclude: [
    /^https:\/\/www\.bilibili\.com\/(?:index\.html)?(?:[?#].*)?$/,
    /^https:\/\/www\.bilibili\.com\/video\/(?:BV[\da-z]+|av\d+)/i,
  ],
  options,
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
  },
  instantStyles: [{ name: componentName, style: () => import('./index.scss') }],
  entry: activate,
  reload: activate,
  unload: deactivate,
})
