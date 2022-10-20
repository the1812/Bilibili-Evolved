import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'downloadAudio',
  displayName: '下载音频',
  entry: none,
  tags: [componentsTags.utils],
  description: {
    'zh-CN': `
开启音频下载支持, 音频页面中可以在功能面板中下载当前音频.

> 需要进入音频的详细信息页面才能下载, 在其他页面中此按钮将不可点击.
    `.trim(),
  },
  widget: {
    component: () => import('./DownloadAudio.vue').then(m => m.default),
  },
  urlInclude: ['//www.bilibili.com/audio/'],
})
