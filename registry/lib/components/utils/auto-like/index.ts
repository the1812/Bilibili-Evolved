import { defineComponentMetadata } from '@/components/define'
import { forEachFeedsCard } from '@/components/feeds/api'
import { select } from '@/core/spin-query'
import { matchUrlPattern, playerReady } from '@/core/utils'
import { feedsUrls, videoAndBangumiUrls } from '@/core/utils/urls'

const feedsLikeQueue = [] as HTMLElement[]
export const component = defineComponentMetadata({
  name: 'autoLike',
  displayName: '自动点赞',
  tags: [componentsTags.utils, componentsTags.feeds, componentsTags.video],
  urlInclude: [...videoAndBangumiUrls, ...feedsUrls],
  options: {
    video: {
      defaultValue: true,
      displayName: '对视频点赞',
    },
    feed: {
      defaultValue: true,
      displayName: '对动态点赞',
    },
  },
  entry: async ({ settings: { options } }) => {
    if (options.video && videoAndBangumiUrls.some(url => matchUrlPattern(url))) {
      await playerReady()
      const likeButton = (await select(
        '.video-toolbar .like, .tool-bar .like-info, .video-toolbar-v1 .like',
      )) as HTMLSpanElement
      if (!likeButton || likeButton.classList.contains('on')) {
        return
      }
      likeButton.click()
    }
    if (options.feed && feedsUrls.some(url => matchUrlPattern(url))) {
      window.setInterval(() => {
        if (feedsLikeQueue.length === 0) {
          return
        }
        const button = feedsLikeQueue.shift()
        button?.click()
      }, 1000)
      forEachFeedsCard({
        added: card => {
          const likeButton = dq(card.element, '.bili-dyn-action.like') as HTMLElement
          if (!likeButton || likeButton.classList.contains('active')) {
            return
          }
          feedsLikeQueue.push(likeButton)
        },
      })
    }
  },
})
