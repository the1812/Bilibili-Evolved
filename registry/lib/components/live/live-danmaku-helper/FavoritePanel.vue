<template>
  <div ref="element" class="live-danmaku-favorite-widget">
    <VPopup
      ref="popup"
      v-model="open"
      class="danmaku-favorite-popup widgets-popup"
      :trigger-element="$refs.favoriteButton"
    >
      <div class="danmaku-favorite-header">
        <TextBox v-model="keyword" placeholder="搜索收藏的弹幕" />
      </div>
      <ul v-if="filteredFavorites.length > 0" class="danmaku-favorite-list">
        <li
          v-for="(item, index) of filteredFavorites"
          :key="item + index"
          :title="'点击发送: ' + item"
          @click="send(item)"
        >
          <span class="danmaku-favorite-text">{{ item }}</span>
          <button class="danmaku-favorite-delete" title="删除收藏" @click.stop="remove(item)">
            <VIcon icon="mdi-close" :size="16" />
          </button>
        </li>
      </ul>
      <div v-else class="danmaku-favorite-empty">
        {{ keyword ? '没有匹配的收藏' : '还没有收藏的弹幕' }}
      </div>
    </VPopup>
    <DefaultWidget
      ref="favoriteButton"
      name="弹幕收藏库"
      icon="mdi-star-outline"
      @click="open = !open"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { getComponentSettings } from '@/core/settings'
import { select } from '@/core/spin-query'
import { DefaultWidget, VPopup, VIcon, TextBox } from '@/ui'
import { useScopedConsole } from '@/core/utils/log'
import { LiveDanmakuHelperOptions } from './options'

const console = useScopedConsole('liveDanmakuHelper')
const options = reactive(
  getComponentSettings<LiveDanmakuHelperOptions>('liveDanmakuHelper').options,
)

const element = ref<HTMLElement>()
const open = ref(false)
const keyword = ref('')

const filteredFavorites = computed(() => {
  const list = options.favorites ?? []
  const search = keyword.value.trim().toLowerCase()
  if (!search) {
    return list
  }
  return list.filter(item => item.toLowerCase().includes(search))
})

const danmakuInputSelector = [
  '.control-panel-ctnr .chat-input-ctnr .chat-input',
  '.chat-input-ctnr .chat-input',
  '.chat-input',
  '[class*="chat-input"] textarea',
  '[class*="chat-input"] input',
  '[class*="chat-input"][contenteditable="true"]',
  '.chat-input-ctnr [contenteditable="true"]',
  'textarea[class*="chat"]',
  'input[class*="chat"]',
].join(', ')
const sendButtonSelector = [
  '.control-panel-ctnr .chat-input-ctnr ~ .bottom-actions .bl-button--primary',
  '.bottom-actions .bl-button--primary',
  '.chat-input-ctnr ~ .bottom-actions button',
  '.control-panel-ctnr button[class*="send"]',
  '.control-panel-ctnr [class*="send"]',
  '.chat-input-ctnr button',
  'button[class*="send"]',
].join(', ')
const liveInputXPath =
  '/html/body/div[1]/main/div[2]/section/div[2]/div[15]/div/div[3]/div[2]/textarea'
const liveSendXPath =
  '/html/body/div[1]/main/div[2]/section/div[2]/div[15]/div/div[3]/div[3]/button'
const isVisible = (el: Element): el is HTMLElement =>
  el instanceof HTMLElement && (el.offsetParent !== null || el.getClientRects().length > 0)
const queryVisible = <T extends HTMLElement>(selector: string) =>
  [...document.querySelectorAll<T>(selector)].find(isVisible)
const queryXPath = (xpath: string) =>
  document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
    .singleNodeValue as HTMLElement | null
const setNativeValue = (input: HTMLElement, text: string) => {
  input.focus()
  if (input instanceof HTMLTextAreaElement) {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
    setter ? setter.call(input, text) : (input.value = text)
  } else if (input instanceof HTMLInputElement) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    setter ? setter.call(input, text) : (input.value = text)
  } else if (input.isContentEditable) {
    input.textContent = text
  }
  input.dispatchEvent(
    new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }),
  )
  input.dispatchEvent(new Event('change', { bubbles: true }))
}
const getCsrfToken = () => {
  const { cookie } = document
  const match = cookie.match(/bili_jct=([^;]+)/)
  return match ? match[1] : ''
}

const getRoomId = () => {
  const match = window.location.pathname.match(/\/(\d+)/)
  return match ? match[1] : ''
}

const sendByApi = async (text: string) => {
  try {
    const roomid = getRoomId()
    const csrf = getCsrfToken()

    if (!roomid || !csrf) {
      console.warn('无法获取房间号或 CSRF token，将使用降级方案')
      return false
    }

    const formData = new FormData()
    formData.append('bubble', '0')
    formData.append('msg', text)
    formData.append('color', '16777215')
    formData.append('mode', '1')
    formData.append('room_type', '0')
    formData.append('jumpfrom', '82002')
    formData.append('reply_mid', '0')
    formData.append('reply_attr', '0')
    formData.append('replay_dmid', '')
    formData.append('statistics', JSON.stringify({ appId: 100, platform: 5 }))
    formData.append('reply_type', '0')
    formData.append('reply_uname', '')
    formData.append('data_extend', JSON.stringify({ trackid: '-99998' }))
    formData.append('fontsize', '25')
    formData.append('rnd', Math.floor(Date.now() / 1000).toString())
    formData.append('roomid', roomid)
    formData.append('csrf', csrf)
    formData.append('csrf_token', csrf)

    const response = await fetch('https://api.live.bilibili.com/msg/send', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    const result = await response.json()

    if (result.code === 0) {
      console.log('通过 API 发送弹幕成功')
      return true
    }
    console.warn('API 发送失败:', result.message || result.msg, '将使用降级方案')
    return false
  } catch (error) {
    console.error('API 发送弹幕出错:', error, '将使用降级方案')
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
const getSendButton = () =>
  [...document.querySelectorAll<HTMLElement>(sendButtonSelector)]
    .filter(isVisible)
    .find(button => !(button as HTMLButtonElement).disabled)

const sendDanmaku = async (text: string) => {
  // 优先尝试使用 API 发送
  if (await sendByApi(text)) {
    return
  }

  // API 失败，尝试 XPath 方式
  if (await sendByXPath(text)) {
    return
  }

  // XPath 失败，尝试选择器方式
  await select('.control-panel-ctnr, .chat-input-ctnr')
  const input = queryVisible(danmakuInputSelector)

  if (!input) {
    console.error('未找到弹幕输入框或发送按钮')
    return
  }

  setNativeValue(input, text)

  await new Promise(resolve => setTimeout(resolve, 100))

  const sendButton = getSendButton()
  if (sendButton && !(sendButton as HTMLButtonElement).disabled) {
    sendButton.click()
  } else {
    console.warn('发送按钮被禁用, 可能触发了频率限制')
  }
}

const send = (text: string) => {
  sendDanmaku(text)
}

const remove = (text: string) => {
  options.favorites = (options.favorites ?? []).filter(item => item !== text)
}
</script>

<style lang="scss">
@import 'common';

.danmaku-favorite-popup {
  top: 50%;
  left: calc(100% + 8px);
  transform: scale(0.9) translateY(-50%);
  transform-origin: left;
  padding: 8px;
  width: 240px;
  max-height: calc(100vh - 150px);
  @include card();
  @include no-scrollbar();
  @include round-corner(8px);

  &.open {
    transform: scale(1) translateY(-50%);
  }

  body.settings-panel-dock-right & {
    right: calc(100% + 8px);
    left: unset;
    transform-origin: right;
  }

  &,
  & * {
    transition: 0.2s ease-out;
  }

  .danmaku-favorite-header {
    margin-bottom: 8px;
    .be-text-box {
      width: 100%;
    }
  }

  .danmaku-favorite-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
    max-height: calc(100vh - 230px);
    @include no-scrollbar();

    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      padding: 6px 8px;
      cursor: pointer;
      @include round-corner(4px);

      &:hover {
        background-color: var(--theme-color-20, rgba(0, 161, 214, 0.2));
      }

      .danmaku-favorite-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 13px;
      }

      .danmaku-favorite-delete {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px;
        border: none;
        background-color: transparent;
        color: inherit;
        cursor: pointer;
        opacity: 0.5;
        @include round-corner(4px);

        &:hover {
          opacity: 1;
          background-color: #f44;
          color: #fff;
        }
      }
    }
  }

  .danmaku-favorite-empty {
    padding: 16px 8px;
    text-align: center;
    opacity: 0.6;
    font-size: 13px;
  }
}
</style>
