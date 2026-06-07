import { getCsrf } from '@/core/utils'
import { useScopedConsole } from '@/core/utils/log'

const console = useScopedConsole('liveDanmakuHelper')

export const queryXPath = (xpath: string) =>
  document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
    .singleNodeValue as HTMLElement | null

//  live/danmaku-sendbar
const liveInputSelector = [
  '.control-panel-ctnr .chat-input-ctnr .chat-input',
  '.chat-input-ctnr .chat-input',
  '.chat-input',
  '[class*="chat-input"] textarea',
  '[class*="chat-input"] input',
  '[class*="chat-input"][contenteditable="true"]',
  '.chat-input-ctnr [contenteditable="true"]',
].join(', ')

const liveSendButtonSelector = [
  '.control-panel-ctnr .chat-input-ctnr ~ .bottom-actions .bl-button--primary',
  '.bottom-actions .bl-button--primary',
  '.chat-input-ctnr ~ .bottom-actions button',
  '.control-panel-ctnr button[class*="send"]',
  '.chat-input-ctnr button',
].join(', ')

const isVisible = (element: Element): element is HTMLElement =>
  element instanceof HTMLElement &&
  (element.offsetParent !== null || element.getClientRects().length > 0)

const queryVisible = (selector: string): HTMLElement | null =>
  [...document.querySelectorAll(selector)].find(isVisible) ?? null

const getRoomId = () => window.location.pathname.match(/\/(\d+)/)?.[1] ?? ''

const setNativeValue = (input: HTMLElement, text: string) => {
  input.focus()
  if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
    const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement
    const setter = Object.getOwnPropertyDescriptor(prototype.prototype, 'value')?.set
    setter ? setter.call(input, text) : (input.value = text)
  } else if (input.isContentEditable) {
    input.textContent = text
  }
  input.dispatchEvent(
    new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }),
  )
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const sendByApi = async (text: string) => {
  try {
    const roomid = getRoomId()
    const csrf = getCsrf()
    if (!roomid || !csrf) {
      return false
    }

    const formData = new FormData()
    const fields: Record<string, string> = {
      bubble: '0',
      msg: text,
      color: '16777215',
      mode: '1',
      room_type: '0',
      jumpfrom: '82002',
      reply_mid: '0',
      reply_attr: '0',
      replay_dmid: '',
      statistics: JSON.stringify({ appId: 100, platform: 5 }),
      reply_type: '0',
      reply_uname: '',
      data_extend: JSON.stringify({ trackid: '-99998' }),
      fontsize: '25',
      rnd: Math.floor(Date.now() / 1000).toString(),
      roomid,
      csrf,
      csrf_token: csrf,
    }
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value))

    const response = await fetch('https://api.live.bilibili.com/msg/send', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    const result = await response.json()
    return result.code === 0
  } catch {
    return false
  }
}

const sendByDom = async (text: string) => {
  const input = queryVisible(liveInputSelector)
  if (!input) {
    return false
  }
  setNativeValue(input, text)
  await new Promise(resolve => setTimeout(resolve, 100))

  const sendButton = [...document.querySelectorAll(liveSendButtonSelector)].find(
    (button): button is HTMLButtonElement =>
      isVisible(button) && !(button as HTMLButtonElement).disabled,
  )
  if (!sendButton) {
    return false
  }
  sendButton.click()
  return true
}

export const sendDanmaku = async (text: string, compatible = false): Promise<boolean> => {
  if (compatible) {
    if (await sendByDom(text)) {
      return true
    }
    console.warn('弹幕发送失败')
    return false
  }
  if (await sendByApi(text)) {
    return true
  }
  if (await sendByDom(text)) {
    return true
  }
  console.warn('弹幕发送失败：API 与 DOM 均不可用')
  return false
}
