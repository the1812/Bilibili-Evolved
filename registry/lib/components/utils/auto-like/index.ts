import { defineComponentMetadata } from '@/components/define'
import { select } from '@/core/spin-query'
import { matchUrlPattern, playerReady } from '@/core/utils'
import { feedsUrls, videoAndBangumiUrls } from '@/core/utils/urls'
import { KeyBindingAction } from '../keymap/bindings'
import { forEachFeedsCard } from '@/components/feeds/api'
import { BlackListDataKey, loadlikeButton } from './vm'
import { getData, registerData } from '@/plugins/data'

const feedsLikeQueue = [] as HTMLElement[]
export const component = defineComponentMetadata({
  name: 'autoLike',
  displayName: '自动点赞',
  tags: [componentsTags.utils, componentsTags.feeds, componentsTags.video],
  urlInclude: [...videoAndBangumiUrls, ...feedsUrls],
  author: {
    name: 'CrazyboyQCD',
    link: 'https://github.com/CrazyboyQCD',
  },
  options: {
    video: {
      defaultValue: true,
      displayName: '对视频点赞',
    },
    feed: {
      defaultValue: true,
      displayName: '对动态点赞',
    },
    manualFeed: {
      defaultValue: true,
      displayName: '手动对动态点赞',
    },
    users: {
      displayName: '黑名单',
      defaultValue: [] as string[],
      hidden: true,
    },
  },
  extraOptions: () => import('./settings.vue').then(m => m.default),
  entry: async ({ settings: { options } }) => {
    if (options.video && videoAndBangumiUrls.some(url => matchUrlPattern(url))) {
      await playerReady()
      const likeButton = (await select('.video-like')) as HTMLSpanElement
      if (!likeButton || likeButton.classList.contains('on')) {
        return
      }
      likeButton.click()
    }
    if (options.feed && feedsUrls.some(url => matchUrlPattern(url))) {
      const blackListData = {
        users: options.users,
      }
      registerData(BlackListDataKey, blackListData)
      if (options.manualFeed) {
        loadlikeButton()
      } else {
        window.setInterval(() => {
          if (feedsLikeQueue.length === 0) {
            return
          }
          const button = feedsLikeQueue.shift()
          button?.click()
        }, 1000)
        const blackList = getData(BlackListDataKey)
        forEachFeedsCard({
          added: card => {
            if (blackList.includes(card.username)) {
              return
            }
            const likeButtons = dq(card.element, '.bili-dyn-action.like') as HTMLElement
            if (!likeButtons || likeButtons.classList.contains('active')) {
              return
            }
            feedsLikeQueue.push(likeButtons)
          },
        })
      }
    }
  },
  plugin: {
    displayName: '点赞 - 手动',
    setup: ({ addData }) => {
      addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
        actions.manuallike = {
          displayName: '手动触发对动态点赞',
          run: context => {
            const { clickElement } = context
            return clickElement('.manual-like', context)
          },
        }
      })
      addData('keymap.presets', (presetBase: Record<string, string>) => {
        presetBase.manuallike = 'l L'
      })
    },
  },
})
