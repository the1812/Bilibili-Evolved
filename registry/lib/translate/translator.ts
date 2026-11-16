import { getAIProvider } from '@/core/ai'
import { getComponentSettings } from '@/core/settings'
import { getTargetLanguage, TranslateOptions } from './options'
import { translateText } from './text'

const translate = async (
  name: string,
  text: string,
  getSource: () => ParentNode,
  result: HTMLElement,
) => {
  result.textContent = '翻译中…'
  try {
    const { providerId, targetLanguage } = getComponentSettings<TranslateOptions>(name).options
    const translated = await translateText(
      text,
      getAIProvider(providerId),
      getTargetLanguage(targetLanguage),
    )
    const emotes = new Map(
      Array.from(
        getSource().querySelectorAll<HTMLImageElement>('img[alt]'),
        emote => [emote.alt, emote] as const,
      ),
    )
    result.textContent = ''
    translated.split(/(\[[^\]\r\n]+\])/g).forEach(part => {
      const emote = emotes.get(part)
      if (!emote) {
        result.append(part)
        return
      }
      const image = document.createElement('img')
      image.src = emote.src
      image.alt = part
      const style = getComputedStyle(emote)
      image.style.setProperty('--be-translation-emote-height', style.height)
      image.style.setProperty('--be-translation-emote-align', style.verticalAlign)
      result.append(image)
    })
    return true
  } catch (error) {
    result.textContent = (error as Error).message
    return false
  }
}

export const createTranslator = (name: string, text: string, getSource: () => ParentNode) => {
  const container = document.createElement('div')
  container.className = 'be-inline-translator'
  const result = document.createElement('div')
  container.append(result)
  const start = () => {
    container.hidden = false
    return translate(name, text, getSource, result)
  }
  return { container, start }
}

export const addTranslateButton = ({ container, start }: ReturnType<typeof createTranslator>) => {
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = '翻译'
  button.addEventListener('click', async event => {
    event.stopPropagation()
    button.hidden = true
    if (await start()) {
      button.remove()
    } else {
      button.textContent = '重试翻译'
      button.hidden = false
    }
  })
  container.prepend(button)
}
