import { defineComponentMetadata } from '@/components/define'
import { FeedsCard } from '@/components/feeds/api'
import { feedsUrls } from '@/core/utils/urls'

const entry = async () => {
  const { default: MachineTranslator } = await import(
    '@/components/i18n/machine-translator/MachineTranslator.vue'
  )
  const { forEachFeedsCard } = await import('@/components/feeds/api')

  const injectButton = (card: FeedsCard) => {
    const text = card.text.replace(/#(.+?)#/g, '')
    if (text === '') {
      return
    }
    if (dq(card.element, '.translate-container')) {
      return
    }
    const cardContent = card.element.querySelector('.card-content') as HTMLElement
    const translator = new MachineTranslator({
      propsData: {
        text,
      },
    }).$mount()
    cardContent.insertAdjacentElement('beforeend', translator.$el)
  }
  forEachFeedsCard({
    added: injectButton,
  })
}

export const component = defineComponentMetadata({
  name: 'feedsTranslate',
  displayName: '动态翻译',
  description: {
    'zh-CN': '在每条动态下方添加翻译按钮.',
  },
  tags: [componentsTags.utils, componentsTags.feeds],
  entry,
  urlInclude: feedsUrls,
})
