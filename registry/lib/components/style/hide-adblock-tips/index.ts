import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'hideAdblockTips',
  displayName: '隐藏首页广告拦截提醒栏',
  author: [
    {
      name: 'DARKNESS118',
      link: 'https://github.com/DARKNESS118',
    },
    {
      name: 'OpenAI Codex',
      link: 'https://openai.com/codex/',
    },
  ],
  entry: none,
  instantStyles: [
    {
      name: 'hideAdblockTips',
      style: () => import('./hide-adblock-tips.scss'),
    },
  ],
  tags: [componentsTags.style],
  urlInclude: [/^https:\/\/www\.bilibili\.com\/$/, /^https:\/\/www\.bilibili\.com\/index\.html$/],
})
