import { defineComponentMetadata } from '@/components/define'
import MachineTranslator from '@/components/i18n/machine-translator/MachineTranslator.vue'

const entry = async () => {
  const injectButton = (element: HTMLElement) => {
    const textElements = dqa(element, '.text, .text-con')
    if (textElements.length === 0) {
      return
    }
    textElements.forEach((textElement: HTMLElement) => {
      if (textElement.nextElementSibling?.classList.contains('translate-container')) {
        return
      }
      const translator = new MachineTranslator({
        propsData: {
          text: textElement.innerText,
        },
      }).$mount()
      textElement.insertAdjacentElement('afterend', translator.$el)
    })
  }
  const { forEachCommentItem } = await import('@/components/utils/comment-apis')
  forEachCommentItem({
    added: item => {
      const { element } = item
      item.addEventListener('repliesUpdate', e => e.detail.forEach(r => injectButton(r.element)))
      injectButton(element)
    },
  })
}
export const component = defineComponentMetadata({
  name: 'commentsTranslate',
  displayName: '评论翻译',
  description: {
    'zh-CN': '在每条评论下方添加翻译按钮.',
  },
  tags: [componentsTags.utils, componentsTags.feeds],
  entry,
})
