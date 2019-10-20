export interface Blackboard {
  url: string
  title: string
  isAd: boolean
  imageUrl: string
}
export const getBlackboards = (): Blackboard[] => {
  if (dq('.international-home')) {
    return dqa('.home-slide .item')
      .map(it => {
        return {
          url: it.querySelector('a')!.getAttribute('href'),
          title: (it.querySelector('.title') as HTMLElement).innerText!.trim(),
          isAd: Boolean(it.querySelector('.gg-icon')),
          imageUrl: it.querySelector('img')!.getAttribute('src'),
        } as Blackboard
      })
  } else {
    const panel = dq('.chief-recommend-module .panel') as HTMLElement
    const images = panel.querySelector('.pic') as HTMLElement
    const titles = panel.querySelectorAll('.title > a')
    return [...images.querySelectorAll('li')].map((li, index) => {
      const title = titles[index] as HTMLElement
      return {
        url: title.getAttribute('href'),
        title: title.innerText!.trim(),
        isAd: Boolean(title.querySelector('.gg-pic')),
        imageUrl: li.querySelector('img')!.getAttribute('src'),
      } as Blackboard
    })
  }
}
export default {
  export: {
    getBlackboards,
  },
}