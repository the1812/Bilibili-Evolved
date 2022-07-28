import { ComponentMetadata } from '@/components/types'
import { mainSiteUrls } from '@/core/utils/urls'
import { allMutationsOn } from '@/core/observer'
import { selectAll } from '@/core/spin-query'
import { registerData, getData } from '@/plugins/data'
import { BlockListDataKey } from './common'

const name = 'black-list'

const entry = async () => {
  // GM_deleteValue(BlockListDataKey)
  const blockListData = GM_getValue(BlockListDataKey, {
    up: ['程序员鱼皮'],
    upRegex: ['马士兵*', '图灵学院*'],
  })

  registerData(BlockListDataKey, blockListData)
  const billGrid = await selectAll('.bili-grid')
  allMutationsOn(billGrid, async () => {
    const videos = await selectAll('.bili-video-card')
    if (!videos) {
      return
    }
    const blockList = getData(BlockListDataKey)
    const upRegex = blockList[0].upRegex.map(e => new RegExp(e))
    videos.forEach(video => {
      const authorElement = (video as unknown as HTMLElement).querySelector('.bili-video-card__info--author')
      const titleElement = (video as unknown as HTMLElement).querySelector('.bili-video-card__info--tit > a')
      if (authorElement != null) {
        const author = authorElement.innerHTML
        if (blockList[0].up.indexOf(author) !== -1) {
          const image = (video as unknown as HTMLElement).querySelector('.v-img.bili-video-card__cover')
          image.innerHTML = ''
          authorElement.innerHTML = ''
          titleElement.innerHTML = ''
        } else {
          for (const i in upRegex) {
            if (upRegex[i].test(author)) {
              const image = (video as unknown as HTMLElement).querySelector('.v-img.bili-video-card__cover')
              image.innerHTML = ''
              authorElement.innerHTML = ''
              titleElement.innerHTML = ''
              break
            }
          }
        }
      }
    })
  })
}

export const component: ComponentMetadata = {
  name,
  entry,
  reload: entry,
  extraOptions: () => import('./Settings.vue').then(m => m.default),
  displayName: '屏蔽黑名单up主',
  tags: [
    componentsTags.utils,
  ],
  description: {
    'zh-CN': '屏蔽黑名单up主',
  },
  urlInclude: mainSiteUrls,
}
