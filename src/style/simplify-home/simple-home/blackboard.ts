export interface Blackboard {
  url: string
  title: string
  isAd: boolean
  imageUrl: string
}
export const getBlackboards = async (): Promise<Blackboard[]> => {
  const locId = 4694
  const api = `https://api.bilibili.com/x/web-show/res/locs?pf=0&ids=${locId}`
  const { code, message, data } = await Ajax.getJson(api)
  if (code !== 0) {
    throw new Error(`获取活动卡片失败: ${message}`)
  }
  const list: any[] = data[locId]
  return list.map(it => {
    return {
      url: it.url,
      title: it.name,
      isAd: it.is_ad_loc,
      imageUrl: it.pic,
    } as Blackboard
  })
  // if (dq('.international-home')) {
  //   const initData = await SpinQuery.condition(() => unsafeWindow['__INITIAL_STATE__'], it => it !== undefined)
  //   return dqa('.first-screen .home-slide .item')
  //     .slice(0, 5)
  //     .map((it, index) => {
  //       const locID = it.querySelector('a')!.getAttribute('data-loc-id')!
  //       return {
  //         url: initData.locsData[locID][index].url,
  //         title: (it.querySelector('.title') as HTMLElement).textContent!.trim(),
  //         isAd: Boolean(it.querySelector('.gg-icon,.bypb-icon')),
  //         imageUrl: it.querySelector('img')!.getAttribute('src')!.replace(/@.+$/, ''),
  //       } as Blackboard
  //     })
  // } else {
  //   const panel = dq('.chief-recommend-module .panel') as HTMLElement
  //   const images = panel.querySelector('.pic') as HTMLElement
  //   const titles = panel.querySelectorAll('.title > a')
  //   return [...images.querySelectorAll('li')].map((li, index) => {
  //     const title = titles[index] as HTMLElement
  //     return {
  //       url: title.getAttribute('href'),
  //       title: title.innerText!.trim(),
  //       isAd: Boolean(title.querySelector('.gg-pic')),
  //       imageUrl: li.querySelector('img')!.getAttribute('src')!.replace(/@.+$/, ''),
  //     } as Blackboard
  //   })
  // }
}
export default {
  export: {
    getBlackboards,
  },
}