import { getText } from '@/core/ajax'
import { DownloadPackage } from '@/core/download'

// 更新分区信息和对应图标, 需要在首页运行

export const updateCategories = async () => {
  const [script] = (dqa('script') as HTMLScriptElement[]).filter(it => it.src.includes('international-home/international-home'))
  if (!script) {
    throw new Error('no script found')
  }
  const scriptText = await getText(script.src)
  const match = scriptText.match(/([\w]+?=\[\{name:"首页".+?\}.+?\]),[\w]+?=\[\{name:"首頁"/)
  if (!match) {
    throw new Error('no match in script')
  }
  const variables = match[1].match(/(\w+?)(?==\[)/g)
  const data = eval(`var ${match[1]}; [${variables.join(',')}]`)
  DownloadPackage.single('raw.json', data)
}
export const updateIcons = () => {
  const svgItems = dqa('body > svg:not(#be-category-icons)').filter(it => it.querySelector('[id^=bili]')) as SVGElement[]
  if (svgItems.length === 0) {
    throw new Error('svg icons not found')
  }
  const [svg] = svgItems
  const cloned = svg.cloneNode(true) as SVGElement
  cloned.id = 'be-category-icons'
  dqa(cloned, 'symbol').forEach((symbol: SVGSymbolElement) => {
    symbol.id = symbol.id.replace(/^bili-/, 'header-icon-')
  })
  DownloadPackage.single('icons.svg', cloned.outerHTML)
}
