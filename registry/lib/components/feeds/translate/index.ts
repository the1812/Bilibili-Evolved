import { defineComponentMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import { FeedsCard, feedsCardsManager, FeedsCardsManagerEventType } from '@/components/feeds/api'
import { createComponentWithProps, getVue2Data, mountVueComponent } from '@/core/utils'
import { feedsUrls } from '@/core/utils/urls'
import FeedsTranslator from './FeedsTranslator.vue'
import { FeedsTranslateOptions, options } from './options'

let enabled = false

const addCard = (card: FeedsCard) => {
  if (!enabled || !card.text.trim() || card.element.querySelector('.be-feeds-translator')) {
    return
  }
  const content = card.element.querySelector(
    '.bili-dyn-content, .card-content, .opus-module-content',
  )
  if (!content) {
    return
  }
  const vm = mountVueComponent(createComponentWithProps(FeedsTranslator, { text: card.text }))
  content.appendChild(vm.$el)
}

const onAdded = (event: CustomEvent<FeedsCard>) => addCard(event.detail)

const entry = async () => {
  if (enabled) {
    return
  }
  enabled = true
  const settings = getComponentSettings<FeedsTranslateOptions & { model?: string }>(
    'feedsTranslate',
  )
  if (settings.options.model) {
    settings.options.providerId = settings.options.model
    delete settings.options.model
  }
  feedsCardsManager.addEventListener(FeedsCardsManagerEventType.AddCard, onAdded)
  await feedsCardsManager.startWatching()
  if (enabled) {
    feedsCardsManager.cards.forEach(addCard)
  }
}

export const component = defineComponentMetadata({
  name: 'feedsTranslate',
  displayName: '动态翻译',
  tags: [componentsTags.feeds, componentsTags.utils],
  options,
  extraOptions: () => import('./ExtraOptions.vue').then(m => m.default),
  urlInclude: feedsUrls,
  entry,
  reload: entry,
  unload: () => {
    enabled = false
    feedsCardsManager.removeEventListener(FeedsCardsManagerEventType.AddCard, onAdded)
    dqa('.be-feeds-translator').forEach(element => {
      getVue2Data(element).$destroy()
      element.remove()
    })
  },
})
