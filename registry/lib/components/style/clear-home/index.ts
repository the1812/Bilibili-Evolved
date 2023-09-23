import {
  OptionsOfMetadata,
  defineComponentMetadata,
  defineOptionsMetadata,
} from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { addComponentListener } from '@/core/settings'

type Options = OptionsOfMetadata<typeof options>

const removeBadgeList: string[] = []
let removeLive = false
let removeAds = true

const options = defineOptionsMetadata({
  广告: {
    displayName: '广告',
    defaultValue: true,
  },
  番剧: {
    displayName: '番剧',
    defaultValue: true,
  },
  电影: {
    displayName: '电影',
    defaultValue: true,
  },
  国创: {
    displayName: '国创',
    defaultValue: true,
  },
  电视剧: {
    displayName: '电视剧',
    defaultValue: true,
  },
  综艺: {
    displayName: '综艺',
    defaultValue: true,
  },
  纪录片: {
    displayName: '纪录片',
    defaultValue: true,
  },
  动画: {
    displayName: '动画',
    defaultValue: true,
  },
  游戏: {
    displayName: '游戏',
    defaultValue: true,
  },
  鬼畜: {
    displayName: '鬼畜',
    defaultValue: true,
  },
  音乐: {
    displayName: '音乐',
    defaultValue: true,
  },
  舞蹈: {
    displayName: '舞蹈',
    defaultValue: true,
  },
  影视: {
    displayName: '影视',
    defaultValue: true,
  },
  娱乐: {
    displayName: '娱乐',
    defaultValue: true,
  },
  知识: {
    displayName: '知识',
    defaultValue: true,
  },
  科技: {
    displayName: '科技',
    defaultValue: true,
  },
  资讯: {
    displayName: '资讯',
    defaultValue: true,
  },
  美食: {
    displayName: '美食',
    defaultValue: true,
  },
  生活: {
    displayName: '生活',
    defaultValue: true,
  },
  汽车: {
    displayName: '汽车',
    defaultValue: true,
  },
  时尚: {
    displayName: '时尚',
    defaultValue: true,
  },
  运动: {
    displayName: '运动',
    defaultValue: true,
  },
  动物圈: {
    displayName: '动物圈',
    defaultValue: true,
  },
  VLOG: {
    displayName: 'VLOG',
    defaultValue: true,
  },
  搞笑: {
    displayName: '搞笑',
    defaultValue: true,
  },
  单机游戏: {
    displayName: '单机游戏',
    defaultValue: true,
  },
  虚拟UP主: {
    displayName: '虚拟UP主',
    defaultValue: true,
  },
  公益: {
    displayName: '公益',
    defaultValue: true,
  },
  公开课: {
    displayName: '公开课',
    defaultValue: true,
  },
  专栏: {
    displayName: '专栏',
    defaultValue: true,
  },
  直播: {
    displayName: '直播',
    defaultValue: true,
  },
  赛事: {
    displayName: '赛事',
    defaultValue: true,
  },
  活动: {
    displayName: '活动',
    defaultValue: true,
  },
  课堂: {
    displayName: '课堂',
    defaultValue: true,
  },
  社区中心: {
    displayName: '社区中心',
    defaultValue: true,
  },
  新歌热榜: {
    displayName: '新歌热榜',
    defaultValue: true,
  },
  漫画: {
    displayName: '漫画',
    defaultValue: true,
  },
})

function cardClear(mutationsList: HTMLElement[]) {
  for (const mutation of mutationsList) {
    if (!mutation.classList) {
      continue
    }
    if (mutation.classList.contains('floor-single-card')) {
      const badge = mutation.querySelector('.badge').textContent
      if (badge && removeBadgeList.includes(badge)) {
        mutation.remove()
      }
    } else if (mutation.classList.contains('bili-live-card')) {
      if (removeLive) {
        mutation.remove()
      }
    } else if (
      mutation.classList.contains('bili-video-card') ||
      mutation.classList.contains('feed-card')
    ) {
      if (
        removeAds &&
        (mutation.querySelector('.bili-video-card__info--ad') ||
          mutation.querySelector('.bili-video-card__info--creative-ad'))
      ) {
        mutation.remove()
      }
    }
  }
}

function cardFilter(mutationsList: MutationRecord[]) {
  const filteredList: HTMLElement[] = []
  for (const mutation of mutationsList) {
    const mutationTarget = mutation.target as HTMLElement
    if (
      (mutationTarget.classList && mutationTarget.classList.contains('carousel-transform')) ||
      mutationTarget.tagName === 'SPAN'
    ) {
      continue
    }

    if (mutation.addedNodes.length > 0) {
      for (const node of mutation.addedNodes) {
        const nodeTarget = node as HTMLElement
        if (
          nodeTarget.nodeName === '#text' ||
          (nodeTarget.classList && nodeTarget.classList.contains('bili-watch-later'))
        ) {
          continue
        }
        filteredList.push(nodeTarget)
      }
    } else {
      continue
    }
  }
  if (filteredList.length > 0) {
    cardClear(filteredList)
  }
}

const clearHome: ComponentEntry<Options> = async ({ metadata, settings }) => {
  const container = document.querySelector(
    'main > .feed2 > .recommended-container_floor-aside > .container',
  )
  if (!container) {
    return
  }
  const config = { childList: true }
  const observer = new MutationObserver(cardFilter)
  observer.observe(container, config)

  Object.keys(settings.options).forEach(disableType => {
    addComponentListener(
      `${metadata.name}.${disableType}`,
      (value: boolean) => {
        if (value) {
          if (disableType === '广告') {
            removeAds = true
            return
          }
          removeBadgeList.push(disableType)
          if (disableType === '直播') {
            removeLive = true
          }
        }
      },
      true,
    )
  })
  const containerList = container.children as unknown as HTMLElement[]
  cardClear(containerList)
}

export const component = defineComponentMetadata({
  name: 'clear-home',
  author: {
    name: 'RieN7',
    link: 'https://github.com/rien7',
  },
  tags: [componentsTags.style],
  displayName: '首页净化',
  description: '删除首页特定类型的卡片',
  entry: clearHome,
  options,
})
