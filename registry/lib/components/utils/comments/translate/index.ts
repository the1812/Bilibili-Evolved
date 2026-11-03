import { defineComponentMetadata } from '@/components/define'
import { CommentItem, CommentReplyItem, commentAreaManager } from '@/components/utils/comment-apis'
import { select } from '@/core/spin-query'
import { createComponentWithProps } from '@/core/utils'
import { options } from '../../../../translate/options'
import { createTranslator } from '../../../../translate/translator'

const name = 'commentsTranslate'
const threads = new Map<CommentItem, () => void>()
let enabled = false

const addThread = (item: CommentItem) => {
  if (!enabled || threads.has(item)) {
    return
  }
  const translations = new Map<HTMLElement, HTMLElement>()
  const addTranslation = async (reply: CommentReplyItem) => {
    if (!reply.element || !reply.content.trim() || translations.has(reply.element)) {
      return
    }
    let content: Element
    const container = createTranslator(
      name,
      reply.content,
      () => reply.shadowDomEntry?.querySelectorAsEntry('bili-rich-text')?.shadowRoot ?? content,
    )
    translations.set(reply.element, container)
    content = await select(() =>
      reply.shadowDomEntry
        ? reply.shadowDomEntry.querySelectorAsEntry('bili-rich-text')?.element
        : reply.element.querySelector('.reply-content, .sub-reply-content, .con .text, .text-con'),
    )
    if (!content || translations.get(reply.element) !== container) {
      return
    }

    content.after(container)
  }
  const updateReplies = ({ detail }: CustomEvent<CommentReplyItem[]>) => {
    const elements = new Set(detail.map(reply => reply.element))
    translations.forEach((container, element) => {
      if (element !== item.element && !elements.has(element)) {
        container.remove()
        translations.delete(element)
      }
    })
    detail.forEach(addTranslation)
  }
  item.addEventListener('repliesUpdate', updateReplies)
  threads.set(item, () => {
    item.removeEventListener('repliesUpdate', updateReplies)
    translations.forEach(container => container.remove())
    translations.clear()
  })
  addTranslation(item)
  item.replies.forEach(addTranslation)
}

const removeThread = (item: CommentItem) => {
  threads.get(item)?.()
  threads.delete(item)
}

const reload = () => {
  enabled = true
  commentAreaManager.commentAreas.forEach(area => area.items.forEach(addThread))
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
  entry: () => {
    enabled = true
    commentAreaManager.forEachCommentArea({
      added: area => area.forEachCommentItem({ added: addThread, removed: removeThread }),
      removed: area => area.items.forEach(removeThread),
    })
  },
  reload,
  unload: () => {
    enabled = false
    threads.forEach((_, item) => removeThread(item))
  },
})
