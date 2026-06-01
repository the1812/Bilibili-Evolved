import { useScopedConsole } from '@/core/utils/log'

const console = useScopedConsole('liveDanmakuHelper')

const liveInputXPath =
  '/html/body/div[1]/main/div[2]/section/div[2]/div[15]/div/div[3]/div[2]/textarea'
const liveSendXPath =
  '/html/body/div[1]/main/div[2]/section/div[2]/div[15]/div/div[3]/div[3]/button'

export const queryXPath = (xpath: string) =>
  document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
    .singleNodeValue as HTMLElement | null

const getCsrfToken = () => document.cookie.match(/bili_jct=([^;]+)/)?.[1] ?? ''
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
    const csrf = getCsrfToken()
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

const sendByXPath = async (text: string) => {
  const input = queryXPath(liveInputXPath)
  const sendButton = queryXPath(liveSendXPath)
  if (!input || !sendButton) {
    return false
  }
  setNativeValue(input, text)
  await new Promise(resolve => setTimeout(resolve, 100))
  sendButton.click()
  return true
}

export const sendDanmaku = async (text: string): Promise<boolean> => {
  if (await sendByApi(text)) {
    return true
  }
  if (await sendByXPath(text)) {
    return true
  }
  console.warn('弹幕发送失败：API 与 DOM均不可用')
  return false
}
