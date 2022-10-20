import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'elegantScrollbar',
  entry: none,
  displayName: '使用细滚动条',
  description:
    '使用浏览器的滚动条风格替代系统的滚动条, 不过 macOS 系统滚动条比浏览器做得好一些, 因此不建议 macOS 使用此功能.',
  tags: [componentsTags.style, componentsTags.general],
  instantStyles: [
    {
      name: 'elegant-scrollbar',
      style: () => import('./scrollbar.scss'),
    },
  ],
})
