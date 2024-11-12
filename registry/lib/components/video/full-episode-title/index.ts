import { defineComponentMetadata } from '@/components/define'
import { videoUrls } from '@/core/utils/urls'
import { addComponentListener } from '@/core/settings'
import { select } from '@/core/spin-query'

const name = 'fullEpisodeTitle'
export const component = defineComponentMetadata({
  name,
  instantStyles: [
    {
      name,
      style: () => import('./full-episode-title.scss'),
    },
  ],
  options: {
    fullEpisodeTitle: {
      defaultValue: true,
      displayName: '展开选集标题',
    },
    fullEpisodeList: {
      defaultValue: true,
      displayName: '展开选集列表',
    },
  },
  entry: ({ metadata: { options } }) => {
    Object.keys(options).forEach(key => {
      addComponentListener(
        `${name}.${key}`,
        (value: boolean) => {
          document.body.classList.toggle(lodash.kebabCase(key), value)
        },
        true,
      )
    })
    if (!options.fullEpisodeList) {
      return
    }
    Promise.race([
      select('.multi-page-v1 .head-left h3'),
      select('.video-sections-v1 .first-line-title'),
      select('.base-video-sections-v1 .first-line-title'),
      select('.video-pod .video-pod__header .title'),
    ]).then(titleElement => {
      if (!titleElement) {
        return
      }
      titleElement.addEventListener(
        'click',
        (e: MouseEvent) => {
          // Alt + 左键点击才能触发
          if (!e.altKey || e.button !== 0) {
            return
          }
          document.body.classList.toggle('disable-full-episode-list')
          e.preventDefault()
          e.stopImmediatePropagation()
        },
        { capture: true },
      )
    })
  },
  displayName: '选集区域优化',
  tags: [componentsTags.video],
  urlInclude: videoUrls,
})
