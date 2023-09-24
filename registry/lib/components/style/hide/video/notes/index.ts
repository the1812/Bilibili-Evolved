import { defineComponentMetadata } from '@/components/define'

const name = 'hideVideoNotes'
export const component = defineComponentMetadata({
  name,
  displayName: '隐藏记笔记',
  tags: [componentsTags.video, componentsTags.style],
  entry: none,
  instantStyles: [
    {
      name,
      style: () => import('./hide-video-notes.scss'),
    },
  ],
})
