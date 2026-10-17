import { categories, channelsV2, Category } from '@/components/utils/categories/data'

// PGC 专区: 名称取自旧版分区数据
const pgcNames = ['番剧', '国创', '电影', '电视剧', '纪录片']
// 综艺: 手动补充的入口, 有 pgc feed 内容流
const varietyEntry = { name: '综艺', route: 'variety', link: 'https://www.bilibili.com/variety/' }
// 无内容流的页面入口, 点击直接打开链接
const linkEntries = [
  { name: '公益', route: 'love', link: 'https://love.bilibili.com' },
  {
    name: '超高清',
    route: 'hd',
    link: 'https://www.bilibili.com/blackboard/era/Vp41b8bsU9Wkog3X.html',
  },
  {
    name: '视频播客',
    route: 'video_podcast',
    link: 'https://www.bilibili.com/blackboard/era/jpyPhRRrMn3fmZ2B.html',
  },
]
// 线上频道栏中不存在的条目
const excludedNames = ['资讯', '神秘学']
const toCategory = (route: string, link: string, code: number | null = null): Category => ({
  icon: route,
  code,
  route,
  link,
  subCategories: null,
})
export const linkOnlyNames = linkEntries.map(entry => entry.name)
export const supportedCategories: Record<string, Category> = Object.fromEntries([
  ...pgcNames.map(name => [name, categories[name]]),
  [varietyEntry.name, toCategory(varietyEntry.route, varietyEntry.link)],
  ...channelsV2
    .filter(channel => !excludedNames.includes(channel.name))
    .map(channel => [channel.name, toCategory(channel.route, channel.link, channel.tid)]),
  ...linkEntries.map(entry => [entry.name, toCategory(entry.route, entry.link)]),
])
