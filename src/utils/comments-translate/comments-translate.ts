export const commentsTranslate = async () => {
  const { getTranslator } = await import('../../activity/feeds-translate/feeds-translate-providers')
  const Translator = Vue.extend({
    template: /*html*/`
      <div class="translate-container">
        <div class="translate" v-if="!working && !translated" @click="translate()">
          <i class="mdi mdi-earth"></i>翻译
        </div>
        <i v-if="working" class="translating mdi mdi-18px mdi-loading mdi-spin"></i>
        <div class="translated" v-if="translated">翻译自<a :href="activeTranslator.link" target="_blank">{{ activeTranslator.name }}</a>:</div>
        <div v-if="translated" class="translate-result">{{ result }}</div>
      </div>
    `,
    props: {
      text: {
        type: String,
        required: true,
      }
    },
    data() {
      return {
        result: '',
        working: false,
        activeTranslator: {},
      }
    },
    computed: {
      translated() {
        return this.result !== ''
      }
    },
    methods: {
      async translate() {
        try {
          this.working = true
          const text = this.text as string
          const translator = this.activeTranslator = getTranslator()
          this.result = await translator.translate(text, {
            targetLanguage: (() => {
              if (settings.i18n) {
                return languageNameToCode[settings.i18nLanguage]
              }
              if (settings.feedsTranslateLanguage !== '') {
                return settings.feedsTranslateLanguage
              }
              return
            })(),
          })
          console.log(text, translator, this.result)
        } catch (error) {
          logError(error)
        } finally {
          this.working = false
        }
      },
    },
  })
  const injectButton = (element: HTMLElement) => {
    const textElements = dqa(element, '.text, .text-con')
    if (textElements.length === 0) {
      return
    }
    textElements.forEach((textElement: HTMLElement) => {
      if (
        textElement.nextElementSibling &&
        textElement.nextElementSibling.classList.contains('translate-container')
      ) {
        return
      }
      const translator = new Translator({
        propsData: {
          text: textElement.innerText,
        },
      }).$mount()
      textElement.insertAdjacentElement('afterend', translator.$el)
    })
  }
  const { forEachCommentItem } = await import('../comment-apis')
  forEachCommentItem({
    added: (item) => {
      const { element } = item
      item.onRepliesUpdate = replies => replies.forEach(r => injectButton(r.element))
      injectButton(element)
    },
  })
}
if (settings.feedsTranslate) {
  resources.applyStyle('feedsTranslateStyle')
  commentsTranslate()
}

export default {
  export: {
    commentsTranslate,
  },
}
