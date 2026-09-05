// author: https://github.com/z503722728

/** 动画单周期位移距离, 阴影按该周期平铺以保证循环无缝 */
const periodHeight = 2000

/** 生成单个周期的随机星点图案, 并按 periodHeight 原样重复平铺, 使动画循环首尾衔接 */
const generateTiledShadow = (numCtrl: number) => {
  const viewportHeight = Math.max(window.innerHeight, 1)
  const copies = Math.ceil((viewportHeight + periodHeight) / periodHeight)
  // 每周期星数按原实现的密度计算
  const count = Math.floor(
    (window.innerWidth * viewportHeight * periodHeight) /
      (numCtrl * (viewportHeight + periodHeight)),
  )
  const period = []
  for (let i = 0; i < count; i++) {
    period.push([
      Math.floor(Math.random() * window.innerWidth * 1.5),
      Math.floor(Math.random() * periodHeight),
    ])
  }
  const stars = []
  for (let k = 0; k < copies; k++) {
    const offset = k * periodHeight
    for (const [x, y] of period) {
      stars.push(`${x}px ${y + offset}px #FFF`)
    }
  }
  return stars.join(',')
}

const CreateAnim = (): void => {
  const biliMainHeader = document.getElementById('biliMainHeader')
  if (biliMainHeader == null) {
    return
  }
  const mstars1 = document.createElement('div')
  mstars1.id = 'mstars1'
  const mstars2 = document.createElement('div')
  mstars2.id = 'mstars2'
  // bangumi 等页面的播放器位于低 z-index 的祖先堆叠上下文中, 挂在 header 上会让星星浮在播放器上方, 优先挂到播放器根容器里
  const starsHost = document.querySelector('.bpx-docker-major') ?? biliMainHeader
  starsHost.appendChild(mstars1)
  starsHost.appendChild(mstars2)

  // 添加一段css 样式到document最后
  const style = document.createElement('style')
  const starNumCtl = 400
  const stars1Shadow = generateTiledShadow(starNumCtl)
  const stars2Shadow = generateTiledShadow(starNumCtl * 2)
  const stars3Shadow = generateTiledShadow(starNumCtl * 4)
  const stars4Shadow = generateTiledShadow(starNumCtl * 8)
  style.innerHTML = `
  #mstars1{z-index: 1009;position: fixed;left:0px;top:0px; width:1px;height:1px;background:transparent;box-shadow:${stars1Shadow};animation:animStar 50s linear infinite}
  #mstars1:after{content:' ';position:fixed;left:0px;top:0px;width:1px;height:1px;background:transparent;box-shadow:${stars2Shadow}}
  #mstars2{z-index: 1009;position: fixed;left:0px;top:0px;width:2px;height:2px;background:transparent;box-shadow:${stars3Shadow};animation:animStar 100s linear infinite}
  #mstars2:after{content:' ';position:fixed;left:0px;top:0px;width:2px;height:2px;background:transparent;box-shadow:${stars4Shadow}}
  @keyframes animStar{from{transform:translateY(0)}to{transform:translateY(-${periodHeight}px)}}
  `
  document.body.appendChild(style)
}

export const StarAnim = (on: boolean) => {
  // 查找id mstars1 的div
  let mstars1 = document.getElementById('mstars1')
  let mstars2 = document.getElementById('mstars2')
  // 如果没有找到id biliMainHeader 的div创建2个id为 mstars1 mstars2 的div
  if (on) {
    if (mstars1 == null) {
      CreateAnim()
      mstars1 = document.getElementById('mstars1')
      mstars2 = document.getElementById('mstars2')
    }
    // 设置mstars1 mstars2 visible 为true
    mstars1.style.visibility = 'visible'
    mstars2.style.visibility = 'visible'
  } else if (mstars1 != null) {
    mstars1.style.visibility = 'hidden'
    mstars2.style.visibility = 'hidden'
  }
}
