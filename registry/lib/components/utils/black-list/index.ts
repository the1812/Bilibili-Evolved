import { defineComponentMetadata } from '@/components/define'
import { allMutationsOn } from '@/core/observer'
import { selectAll } from '@/core/spin-query'
import { mainSiteUrls } from '@/core/utils/urls'
import { getData, registerData } from '@/plugins/data'
import { BlackListDataKey } from './common'

const name = 'blackList'

const entry = async ({ settings: { options } }) => {
  const blackListData = {
    up: options.up,
    upRegex: options.upRegex,
  }

  registerData(BlackListDataKey, blackListData)
  const billGrid = await selectAll('.feed2')
  allMutationsOn(billGrid, async () => {
    const videos = await selectAll('.bili-video-card')
    if (!videos) {
      return
    }
    const blockList = getData(BlackListDataKey)
    const upRegex = blockList[0].upRegex.map(e => new RegExp(e))
    videos.forEach(video => {
      const authorElement = (video as unknown as HTMLElement).querySelector(
        '.bili-video-card__info--author',
      )
      const titleElement = (video as unknown as HTMLElement).querySelector(
        '.bili-video-card__info--tit > a',
      )
      if (authorElement != null) {
        const author = authorElement.innerHTML
        if (blockList[0].up.indexOf(author) !== -1) {
          const image = (video as unknown as HTMLElement).querySelector(
            '.v-img.bili-video-card__cover',
          )
          image.innerHTML = ''
          authorElement.innerHTML = ''
          titleElement.innerHTML = ''
        } else {
          for (const i in upRegex) {
            if (upRegex[i].test(author)) {
              const image = (video as unknown as HTMLElement).querySelector(
                '.v-img.bili-video-card__cover',
              )
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

export const component = defineComponentMetadata({
  name,
  entry,
  // reload: entry,
  extraOptions: () => import('./Settings.vue').then(m => m.default),
  options: {
    up: {
      displayName: 'up主名称',
      defaultValue: [],
      hidden: true,
    },
    upRegex: {
      displayName: '正则匹配up主名称',
      defaultValue: [],
      hidden: true,
    },
  },
  displayName: '屏蔽黑名单up主',
  tags: [componentsTags.utils],
  description: {
    'zh-CN':
      '屏蔽黑名单up主, 根据up主的名称进行匹配，支持精确匹配和正则匹配. 请注意只能在首页中使用或调整设置.',
  },
  author: {
    name: 'snowraincloud',
    link: 'https://github.com/snowraincloud',
  },
  urlInclude: mainSiteUrls,
})
