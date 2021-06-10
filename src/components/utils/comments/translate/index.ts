import { ComponentMetadata, componentsTags } from '@/components/component'

const entry = async () => {
  const { dqa } = await import('@/core/utils')
  const { default: MachineTranslator } = await import('@/components/i18n/machine-translator/MachineTranslator.vue')

  const injectButton = (element: HTMLElement) => {
    const textElements = dqa(element, '.text, .text-con')
    if (textElements.length === 0) {
      return
    }
    textElements.forEach((textElement: HTMLElement) => {
      if (
        textElement.nextElementSibling
        && textElement.nextElementSibling.classList.contains('translate-container')
      ) {
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
  const { forEachCommentItem } = await import('../api')
  forEachCommentItem({
    added: item => {
      const { element } = item
      injectButton(element)
    },
  })
}
export const component: ComponentMetadata = {
  name: 'commentsTranslate',
  displayName: '评论翻译',
  description: {
    'zh-CN': '在每条评论下方添加翻译按钮.',
  },
  tags: [
    componentsTags.utils,
    componentsTags.feeds,
  ],
  enabledByDefault: false,
  entry,
}
