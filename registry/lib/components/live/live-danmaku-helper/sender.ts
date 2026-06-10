import { getCsrf, getUID, delay, dq, dqa } from '@/core/utils'
import { childListSubtree } from '@/core/observer'
import { Toast } from '@/core/toast'

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

const queryVisible = (selector: string): HTMLElement | null => dqa(selector).find(isVisible) ?? null

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
  await delay(100)

  const sendButton = dqa(liveSendButtonSelector).find(
    (button): button is HTMLButtonElement =>
      isVisible(button) && !(button as HTMLButtonElement).disabled,
  )
  if (!sendButton) {
    return false
  }
  sendButton.click()
  return true
}

const normalizeText = (s: string) => s.replace(/\s+/g, ' ').trim()

type EchoResult = 'confirmed' | 'dropped' | 'inconclusive'
const waitForOwnEcho = (text: string, timeout = 3000): Promise<EchoResult> => {
  const panel = dq('.chat-history-panel')
  const myUid = String(getUID() ?? '')
  if (!panel || !myUid) {
    return Promise.resolve('inconclusive')
  }
  const target = normalizeText(text)
  return new Promise<EchoResult>(resolve => {
    let done = false
    const finish = (result: EchoResult) => {
      if (done) {
        return
      }
      done = true
      observer.disconnect()
      clearTimeout(timer)
      resolve(result)
    }
    const getItemText = (item: Element): string => {
      const dataDanmaku = item.getAttribute('data-danmaku')
      if (dataDanmaku) {
        return dataDanmaku
      }
      return item.querySelector('.danmaku-content, .chat-item-content')?.textContent ?? ''
    }
    const classify = (item: Element): 'mine' | 'other' | null => {
      if (!item.matches?.('.chat-item')) {
        return null
      }
      if (
        item.classList.contains('system-msg') ||
        item.classList.contains('gift-item') ||
        item.classList.contains('welcome-msg') ||
        item.classList.contains('entry-effect')
      ) {
        return null
      }
      const uid = item.getAttribute('data-uid')
      if (!uid) {
        return null
      }
      if (uid === myUid && normalizeText(getItemText(item)) === target) {
        return 'mine'
      }
      return 'other'
    }
    const scan = (node: HTMLElement) => {
      const items = node.matches?.('.chat-item') ? [node] : dqa(node, '.chat-item')
      for (const item of items) {
        if (classify(item) === 'mine') {
          finish('confirmed')
          return
        }
      }
    }
    const [observer] = childListSubtree(panel, mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            scan(node)
          }
          if (done) {
            return
          }
        }
      }
    })
    const timer = setTimeout(() => finish('dropped'), timeout)
  })
}

const notifySendFailed = (text: string, hint: string) => {
  Toast.error(`弹幕「${text}」可能未发送成功。${hint}`, '直播弹幕助手', 5000)
}

export const sendDanmaku = async (text: string, compatible = false): Promise<boolean> => {
  const echo = waitForOwnEcho(text)

  if (compatible) {
    if (!(await sendByDom(text))) {
      notifySendFailed(text, '未找到直播间输入框，请确认输入框可用。')
      return false
    }
    const echoResult = await echo
    if (echoResult === 'confirmed' || echoResult === 'inconclusive') {
      return true
    }
    notifySendFailed(text, '弹幕可能发送失败')
    return false
  }

  const apiOk = await sendByApi(text)
  if (!apiOk) {
    notifySendFailed(text, '可在该组件设置中开启「兼容发送」后重试。')
    return false
  }
  const echoResult = await echo
  if (echoResult === 'confirmed' || echoResult === 'inconclusive') {
    return true
  }
  notifySendFailed(text, '弹幕可能发送失败')
  return false
}
