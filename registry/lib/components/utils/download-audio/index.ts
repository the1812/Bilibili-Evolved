import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'downloadAudio',
  displayName: '下载音频',
  entry: none,
  tags: [componentsTags.utils],
  widget: {
    component: () => import('./DownloadAudio.vue').then(m => m.default),
  },
  urlInclude: ['//www.bilibili.com/audio/'],
})
