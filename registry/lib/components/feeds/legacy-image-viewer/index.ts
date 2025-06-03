import { defineComponentMetadata } from '@/components/define'
import { forEachFeedsCard, getVueData } from '@/components/feeds/api'
import { feedsUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'legacyFeedsImageViewer',
  displayName: '动态图片平铺展示',
  tags: [componentsTags.feeds],
  urlInclude: feedsUrls,
  entry: () => {
    forEachFeedsCard({
      added: card => {
        const vueData = getVueData(card.element)

        // 普通动态
        const cardType = vueData?.data?.type
        const path =
          cardType === 'DYNAMIC_TYPE_FORWARD'
            ? 'data.orig.modules.module_dynamic.major.opus.style'
            : 'data.modules.module_dynamic.major.opus.style'

        const imageViewerStyle: number | null = lodash.get(vueData, path, null)
        if (imageViewerStyle === 1) {
          lodash.set(vueData, path, undefined)
          return
        }

        // 动态详情
        const modules = vueData?.data?.modules
        if (Array.isArray(modules)) {
          const moduleTop = modules.find(m => m.module_type === 'MODULE_TYPE_TOP')
          const moduleContent = modules.find(m => m.module_type === 'MODULE_TYPE_CONTENT')
          const album = moduleTop?.module_top?.display?.album
          const paragraphs: any[] = moduleContent?.module_content?.paragraphs
          if (album && paragraphs) {
            modules.splice(modules.indexOf(moduleTop), 1)
            paragraphs.push({
              align: 0,
              para_type: 2,
              pic: {
                pics: album.pics,
                style: 1,
              },
            })
          }
        }
      },
    })
  },
})
