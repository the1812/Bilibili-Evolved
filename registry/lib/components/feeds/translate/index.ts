import { defineComponentMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import {
  addMenuItem,
  FeedsCard,
  feedsCardsManager,
  FeedsCardsManagerEventType,
} from '@/components/feeds/api'
import { createComponentWithProps } from '@/core/utils'
import { feedsUrls } from '@/core/utils/urls'
import { addTranslateButton, createTranslator } from '../../../translate/translator'
import { TranslateOptions, options } from '../../../translate/options'

const name = 'feedsTranslate'
const entry = async () => {
  const menuMode = getComponentSettings<TranslateOptions>(name).options.entryPoint === '菜单项'
  const cards = new WeakSet<HTMLElement>()
  const addCard = (card: FeedsCard) => {
    if (!card.text.trim() || cards.has(card.element)) {
      return
    }
    const content = card.element.querySelector(
      '.bili-dyn-content, .card-content, .opus-module-content',
    )
    if (!content) {
      return
    }
    const translator = createTranslator(name, card.text, () => content)
    const { container, start } = translator
    container.classList.add('be-feeds-translator')
    cards.add(card.element)
    content.append(container)
    if (menuMode) {
      container.hidden = true
      addMenuItem(card, {
        className: 'be-feeds-translate-menu',
        text: '翻译',
        action: start,
      })
    } else {
      addTranslateButton(translator)
    }
  }

  feedsCardsManager.addEventListener(FeedsCardsManagerEventType.AddCard, event => {
    addCard((event as CustomEvent<FeedsCard>).detail)
  })
  await feedsCardsManager.startWatching()
  feedsCardsManager.cards.forEach(addCard)
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
})
