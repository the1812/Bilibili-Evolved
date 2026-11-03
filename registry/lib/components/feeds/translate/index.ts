import { defineComponentMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import { FeedsCard, feedsCardsManager, FeedsCardsManagerEventType } from '@/components/feeds/api'
import { createComponentWithProps } from '@/core/utils'
import { feedsUrls } from '@/core/utils/urls'
import { createTranslator } from '../../../translate/translator'
import { TranslateOptions, options } from '../../../translate/options'

const name = 'feedsTranslate'
const translations = new Map<HTMLElement, HTMLElement>()
let enabled = false

const addCard = (card: FeedsCard) => {
  if (!enabled || !card.text.trim() || translations.has(card.element)) {
    return
  }
  const content = card.element.querySelector(
    '.bili-dyn-content, .card-content, .opus-module-content',
  )
  if (!content) {
    return
  }
  const translator = createTranslator(name, card.text, () => content)
  translator.classList.add('be-feeds-translator')
  translations.set(card.element, translator)
  content.append(translator)
}

const onAdded = (event: CustomEvent<FeedsCard>) => addCard(event.detail)

const onRemoved = ({ detail }: CustomEvent<FeedsCard>) => {
  translations.get(detail.element)?.remove()
  translations.delete(detail.element)
}

const entry = async () => {
  if (enabled) {
    return
  }
  enabled = true
  const settings = getComponentSettings<TranslateOptions & { model?: string }>('feedsTranslate')
  if (settings.options.model) {
    settings.options.providerId = settings.options.model
    delete settings.options.model
  }
  feedsCardsManager.addEventListener(FeedsCardsManagerEventType.AddCard, onAdded)
  feedsCardsManager.addEventListener(FeedsCardsManagerEventType.RemoveCard, onRemoved)
  await feedsCardsManager.startWatching()
  if (enabled) {
    feedsCardsManager.cards.forEach(addCard)
  }
}

export const component = defineComponentMetadata({
  name,
  displayName: '动态翻译',
  tags: [componentsTags.feeds, componentsTags.utils],
  options,
  instantStyles: [{ name, style: () => import('../../../translate/translator.scss') }],
  extraOptions: () =>
    import('../../../translate/ExtraOptions.vue').then(m =>
      createComponentWithProps(m.default, { componentName: name }),
    ),
  urlInclude: feedsUrls,
  entry,
  reload: entry,
  unload: () => {
    enabled = false
    feedsCardsManager.removeEventListener(FeedsCardsManagerEventType.AddCard, onAdded)
    feedsCardsManager.removeEventListener(FeedsCardsManagerEventType.RemoveCard, onRemoved)
    translations.forEach(translator => translator.remove())
    translations.clear()
  },
})
