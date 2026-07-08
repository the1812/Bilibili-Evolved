import { ComponentEntry } from '@/components/types'
import { childList, urlChange } from '@/core/observer'
import { select } from '@/core/spin-query'
import { getVue2Data, playerReady } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'
import { matchCurrentPage, spaceFavoriteListUrls, videoUrls } from '@/core/utils/urls'
import ViewButton from './ViewButton.vue'
import { getOptions } from './handler'
import { ButtonPosition, parseButtonPosition } from './options'
import { RecommendList } from './types'

let console: ReturnType<typeof useScopedConsole> = null

function createButton(vid: number | string, cid: number, title: string, position: ButtonPosition) {
  const vm = new (Vue.extend(ViewButton))({
    propsData: {
      vid,
      cid,
      title,
      position: parseButtonPosition(position),
    },
  })
  vm.$mount()
  return vm.$el
}

// ========================================================================== //

const videoPageCardSelector = '.video-page-card-small'
const videoPageCardPicBoxSelector = '.card-box>.pic-box'

function getRecommendListVue() {
  let vm: RecommendList = getVue2Data(dq('.recommend-list-v1'))
  if (!vm.recListItems) {
    vm = vm.$children[0] as any as RecommendList
    if (!vm.recListItems) {
      console.warn('获取视频推荐列表失败')
      vm = undefined
    }
  }
  return vm
}

async function addButtonOnRecommendList() {
  const recommendList = getRecommendListVue()
  if (!recommendList || recommendList.bilibiliEvolved_viewSnapshot_watched) {
    return
  }
  recommendList.bilibiliEvolved_viewSnapshot_watched = true
  recommendList.$watch(
    'recListItems',
    () => {
      const position = getOptions().recommendListButtonPosition
      requestAnimationFrame(() => {
        recommendList.$children.forEach(async videoCard => {
          if (videoCard.bilibiliEvolved_viewSnapshot_btn) {
            return
          }
          if (!videoCard.$el.matches(videoPageCardSelector)) {
            return
          }
          const { aid, cid, title } = videoCard.$props.item
          const button = createButton(aid, cid, title, position)
          videoCard.$el.querySelector(videoPageCardPicBoxSelector)?.appendChild(button)
          videoCard.bilibiliEvolved_viewSnapshot_btn = true
        })
      })
    },
    { immediate: true },
  )
}

// ========================================================================== //

const favoriteListMainSelector = '.fav-list-main>.items'
const favVideoCardSelector =
  '.items__item:has(.bili-video-card):not(:has(.bili-cover-card__thumbnail>img[alt="已失效视频"]))'
const favVideoCardAnchorSelector = '.bili-video-card__title>a'
const favVideoCardCoverSelector = '.bili-video-card__cover'

function parseBvidFromUrl(url: string) {
  return url.match(/bilibili\.com\/video\/(\w+)/i)[1]
}

function getVideoCards(mutation: MutationRecord[]) {
  if (mutation.length > 0) {
    return mutation
      .flatMap(r => [...r.addedNodes])
      .filter(x => x instanceof HTMLElement && x.matches(favVideoCardSelector)) as HTMLElement[]
  }
  return dqa(favVideoCardSelector)
}

async function addButtonOnFavoriteList() {
  const v = await select(favoriteListMainSelector)
  childList(v, mutation => {
    const videoCards = getVideoCards(mutation)
    const position = getOptions().favoriteListButtonPosition
    requestAnimationFrame(() => {
      videoCards.forEach(async videoCard => {
        const titleAnchor = videoCard.querySelector(favVideoCardAnchorSelector) as HTMLAnchorElement
        const button = createButton(
          parseBvidFromUrl(titleAnchor.href),
          0,
          titleAnchor.innerText,
          position,
        )
        videoCard.querySelector(favVideoCardCoverSelector)?.appendChild(button)
      })
    })
  })
}

// ========================================================================== //

export const entry: ComponentEntry = async ctx => {
  console = useScopedConsole(ctx.metadata.displayName)
  urlChange(() => {
    if (matchCurrentPage(videoUrls) && getOptions().enableForRecommendList) {
      playerReady().then(addButtonOnRecommendList)
    } else if (matchCurrentPage(spaceFavoriteListUrls) && getOptions().enableForFavoriteList) {
      addButtonOnFavoriteList()
    }
  })
}
