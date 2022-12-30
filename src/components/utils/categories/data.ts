import raw from './raw.json'

export interface SubCategory {
  name: string
  route: string
  tid: number
  ps: number
  rps: number
  desc: string
  url: string
}
export interface MainCategory {
  name: string
  route: string
  url?: string
  tid: number
  locid: number
  count: string
  subMenuSize: number
  viewTag: boolean
  sub: SubCategory[]
}
export interface LiveCategory {
  url: string
  name: string
}
export interface SecondaryCategory {
  name: string
  url: string
  icon: string
  route: string
  sub?: LiveCategory[]
}
export interface Category {
  icon: string
  code: number | number[] | null
  route: string
  count?: number
  link: string
  subCategories: Record<string, string> | null
}

export const rawData: [MainCategory[], LiveCategory[], SecondaryCategory[], SecondaryCategory[]] =
  raw as any

const urlNormalize = (url: string) =>
  url.startsWith('//') ? `https:${url}` : url.replace('http:', 'https:')
const mainCategories = rawData[0].filter(it => typeof it.tid !== 'string')
const secondaryCategories = rawData[3]
const generalCategories: Record<string, Category> = {}
// const cinemaMerge = ['纪录片', '电影', '电视剧']
mainCategories.forEach(it => {
  const mainUrl = urlNormalize(it.url || `https://www.bilibili.com/v/${it.route}/`)
  generalCategories[it.name] = {
    icon: it.route,
    route: it.route,
    code: it.tid,
    link: mainUrl,
    subCategories: it.sub
      ? Object.fromEntries(
          it.sub.map(sub => {
            const subUrl = urlNormalize(
              !sub.route ? sub.url : `https://www.bilibili.com/v/${it.route}/${sub.route}/`,
            )
            return [sub.name, subUrl]
          }),
        )
      : null,
  }
})
// generalCategories.放映厅 = {
//   icon: 'cinema',
//   code: cinemaMerge.map(name => generalCategories[name].code as number),
//   link: 'https://www.bilibili.com/cinema/',
//   subCategories: Object.fromEntries(
//     cinemaMerge.map(name => ([name, generalCategories[name].link])),
//   ),
// }
// cinemaMerge.forEach(name => (delete generalCategories[name]))
secondaryCategories.forEach(it => {
  generalCategories[it.name] = {
    icon: it.icon,
    code: null,
    route: it.route,
    link: urlNormalize(it.url),
    subCategories: it.sub
      ? Object.fromEntries(it.sub.map(sub => [sub.name, urlNormalize(sub.url)]))
      : null,
  }
})
export const categories = generalCategories
export const categoryCodes = Object.fromEntries(mainCategories.map(it => [it.route, it.tid]))
export const categoryLinks = Object.fromEntries(
  Object.values(generalCategories).map(data => [data.icon, data.link]),
)
/** 插入主站导航图标 SVG 符号定义 */
export const addCategoryIcons = async () => {
  if (document.getElementById('be-category-icons')) {
    return
  }
  const { default: svg } = await import('./icons.svg')
  document.body.insertAdjacentHTML('beforeend', svg)
}
