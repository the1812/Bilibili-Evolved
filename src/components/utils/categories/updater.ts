import { getText } from '@/core/ajax'
import { DownloadPackage } from '@/core/download'

export const updateCategories = async () => {
  const [script] = (dqa('script') as HTMLScriptElement[]).filter(it =>
    it.src.includes('stardust-video'),
  )
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
  const svgItems = dqa('.bili-header-channel-panel svg') as SVGElement[]
  if (svgItems.length === 0) {
    throw new Error('svg icons not found')
  }
  const container = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  container.setAttribute('aria-hidden', 'true')
  container.setAttribute('style', 'position: absolute; width: 0px; height: 0px; overflow: hidden;')
  container.id = 'be-category-icons'
  svgItems.forEach(svg => {
    const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbol.innerHTML = svg.innerHTML
    symbol.id =
      svg.id.replace(/^channel-icon-/, 'header-icon-') ||
      `header-icon-${(svg.parentElement as HTMLAnchorElement)?.href.match(/\/v\/(.+)$/)?.[1]}`
    // 特殊: 电视剧的 icon 名称和 route 名称对不上
    if (symbol.id === 'header-icon-teleplay') {
      symbol.id = 'header-icon-tv'
    }
    if (!symbol.id) {
      console.warn('cannot find id for', svg)
    }
    symbol.setAttribute('viewBox', svg.getAttribute('viewBox'))
    container.appendChild(symbol)
  })
  DownloadPackage.single('icons.svg', container.outerHTML)
}
