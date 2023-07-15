import { defineComponentMetadata } from '@/components/define'

const id = 'fixed-sidebars-style'
const entry = async () => {
  const { disableProfilePopup } = await import('@/components/feeds/disable-profile-popup')
  disableProfilePopup()
}

export const component = defineComponentMetadata({
  name: 'fixedFeedsSidebars',
  instantStyles: [
    {
      name: id,
      style: () => import('./fixed-sidebars.scss'),
      important: true,
    },
  ],
  displayName: '强制固定动态侧栏',
  description: {
    'zh-CN': '强制固定动态主页的顶栏和所有侧栏.',
  },
  tags: [componentsTags.feeds],
  entry,
  urlInclude: [/^https:\/\/t\.bilibili\.com\/$/],
})
