import { ComponentMetadata, componentsTags } from '@/components/component'
import { FeedsCard } from '../api'
import { feedsUrls } from '../feeds-urls'

const entry = async () => {
  const { default: MachineTranslator } = await import('@/components/i18n/machine-translator/MachineTranslator.vue')
  const { dq } = await import('@/core/utils')
  const { forEachFeedsCard } = await import('../api')

  const injectButton = (card: FeedsCard) => {
    if (card.text.replace(/#(.+?)#/g, '') === '') {
      return
    }
    if (dq(card.element, '.translate-container')) {
      return
    }
    const cardContent = card.element.querySelector('.card-content') as HTMLElement
    const translator = new MachineTranslator({
      propsData: {
        text: card.text,
      },
    }).$mount()
    cardContent.insertAdjacentElement('beforeend', translator.$el)
  }
  forEachFeedsCard({
    added: injectButton,
  })
}

export const component: ComponentMetadata = {
  name: 'feedsTranslate',
  displayName: '动态翻译',
  description: {
    'zh-CN': '在每条动态下方添加翻译按钮.',
  },
  enabledByDefault: false,
  tags: [
    componentsTags.utils,
    componentsTags.feeds,
  ],
  entry,
  urlInclude: feedsUrls,
}
