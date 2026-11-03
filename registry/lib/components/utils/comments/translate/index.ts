import { defineComponentMetadata } from '@/components/define'
import { CommentReplyItem, forEachCommentItem } from '@/components/utils/comment-apis'
import { getComponentSettings } from '@/core/settings'
import { select } from '@/core/spin-query'
import { createComponentWithProps } from '@/core/utils'
import { options, TranslateOptions } from '../../../../translate/options'
import { addTranslateButton, createTranslator } from '../../../../translate/translator'

const name = 'commentsTranslate'
const entry = () => {
  const menuMode = getComponentSettings<TranslateOptions>(name).options.entryPoint === '菜单项'
  const translatedElements = new WeakSet<HTMLElement>()
  const addTranslation = async (reply: CommentReplyItem) => {
    if (!reply.element || !reply.content.trim() || translatedElements.has(reply.element)) {
      return
    }
    translatedElements.add(reply.element)
    const content = await select(() =>
      reply.shadowDomEntry
        ? reply.shadowDomEntry.querySelectorAsEntry('bili-rich-text')?.element
        : reply.element.querySelector('.reply-content, .sub-reply-content, .con .text, .text-con'),
    )
    if (!content) {
      return
    }

    const translator = createTranslator(
      name,
      reply.content,
      () => reply.shadowDomEntry?.querySelectorAsEntry('bili-rich-text')?.shadowRoot ?? content,
    )
    const { container, start } = translator
    content.after(container)
    if (menuMode) {
      container.hidden = true
      reply.parent.addMenuItem(reply, {
        className: 'be-comments-translate-menu',
        text: '翻译',
        action: start,
      })
    } else {
      addTranslateButton(translator)
    }
  }
  forEachCommentItem({
    added: item => {
      addTranslation(item)
      item.replies.forEach(addTranslation)
      item.addEventListener('repliesUpdate', ({ detail }) => detail.forEach(addTranslation))
    },
  })
}

export const component = defineComponentMetadata({
  name,
  displayName: '评论翻译',
  tags: [componentsTags.utils, componentsTags.feeds],
  options,
  extraOptions: () =>
    import('../../../../translate/ExtraOptions.vue').then(m =>
      createComponentWithProps(m.default, { componentName: name }),
    ),
  instantStyles: [
    { name, style: () => import('../../../../translate/translator.scss') },
    {
      name: `${name}Shadow`,
      style: () => import('../../../../translate/translator.scss'),
      shadowDom: true,
    },
  ],
  entry,
})
