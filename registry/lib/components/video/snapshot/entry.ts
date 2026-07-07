import { ComponentEntry } from '@/components/types'
import { urlChange } from '@/core/observer'
import { getVue2Data, playerReady } from '@/core/utils'
import { matchCurrentPage, videoUrls } from '@/core/utils/urls'
import ViewButton from './ViewButton.vue'
import { getOptions } from './handler'
import { ButtonPosition, parseButtonPosition } from './options'
import { RecommendList } from './types'

async function createButton(aid: number, cid: number, title: string, position: ButtonPosition) {
  const vm = new (Vue.extend(ViewButton))({
    propsData: {
      aid,
      cid,
      title,
      position: parseButtonPosition(position),
    },
  })
  vm.$mount()
  return vm.$el
}

const videoPageCardSelector = '.video-page-card-small'

async function addButtonOnRecommendList() {
  const recommendList: RecommendList = getVue2Data(dq('.recommend-list-v1'))
  if (!recommendList || recommendList.bilibiliEvolved_viewSnapshot_watched) {
    return
  }
  recommendList.bilibiliEvolved_viewSnapshot_watched = true
  recommendList.$watch(
    'recListItems',
    () => {
      const position = getOptions().recommendListButtonPosition
      Promise.allSettled(
        recommendList.$children
          .filter(c => c.$el.matches(videoPageCardSelector))
          .map(videoCard => {
            if (videoCard.bilibiliEvolved_viewSnapshot_btn) {
              return Promise.resolve()
            }
            const { aid, cid, title } = videoCard.$props.item
            return createButton(aid, cid, title, position).then(btn => {
              videoCard.$el.querySelector('.card-box>.pic-box')?.appendChild(btn)
              videoCard.bilibiliEvolved_viewSnapshot_btn = true
            })
          }),
      )
    },
    { immediate: true },
  )
}

export const entry: ComponentEntry = async () => {
  urlChange(() => {
    if (matchCurrentPage(videoUrls) && getOptions().enableForRecommendList) {
      playerReady().then(addButtonOnRecommendList)
    }
  })
}
