import { getAIProvider } from '@/core/ai'
import { getComponentSettings } from '@/core/settings'
import { getTargetLanguage, TranslateOptions } from './options'
import { translateText } from './text'

const translate = async (
  name: string,
  text: string,
  getSource: () => ParentNode,
  button: HTMLButtonElement,
  result: HTMLElement,
) => {
  button.disabled = true
  button.textContent = '翻译中…'
  result.textContent = ''
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
    button.remove()
  } catch (error) {
    result.textContent = (error as Error).message
    button.textContent = '重试翻译'
  } finally {
    button.disabled = false
  }
}

export const createTranslator = (name: string, text: string, getSource: () => ParentNode) => {
  const container = document.createElement('div')
  container.className = 'be-inline-translator'
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = '翻译'
  const result = document.createElement('div')
  button.addEventListener('click', event => {
    event.stopPropagation()
    translate(name, text, getSource, button, result)
  })
  container.append(button, result)
  return container
}
