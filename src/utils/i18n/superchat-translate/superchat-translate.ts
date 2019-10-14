(async () => {
  if (!document.URL.startsWith('https://live.bilibili.com/')) {
    return
  }
  const roomIDMatch = document.URL.match(/live\.bilibili\.com\/(\d+)/)
  if (!roomIDMatch) {
    return
  }
  const roomID = roomIDMatch[1]
  const chatList = await SpinQuery.select('.chat-history-list')
  if (chatList === null) {
    console.warn('chatList not found')
    return
  }
  resources.applyStyle('superchatTranslateStyle')
  const getSuperchatMessageList = async () => {
    const json = await Ajax.getJson(`https://api.live.bilibili.com/av/v1/SuperChat/getMessageList?room_id=${roomID}&jpn=1`)
    if (json.code !== 0) {
      console.warn(`getMessageList api failed: ${json.message}`)
      return []
    }
    return _.get(json, 'data.list', [])
  }
  const getTranslation = async (id: number | string): Promise<string> => {
    return new Promise(resolve => {
      setTimeout(async () => {
        const json = await Ajax.getJson(`https://api.live.bilibili.com/av/v1/SuperChat/messageInfo?id=${id}`)
        if (json.code !== 0) {
          console.warn(`messageInfo api failed: ${json.message}`)
          resolve('')
        }
        resolve(_.get(json, 'data.message_jpn', ''))
      }, 3000)
    })
  }
  Observer.childListSubtree('.pay-note-panel', async () => {
    console.log('.pay-note-panel')
    const textElement = dq('.detail-info .input-contain .text:not(.original):not(.jpn)') as HTMLElement
    if (!textElement) {
      return
    }
    const messageList = await getSuperchatMessageList()
    const message = messageList.find((m: any) => m.message === textElement.innerText)
    if (!message) {
      console.warn('message not found')
      return
    }
    const translation = message.message_jpn || await getTranslation(message.id)
    textElement.classList.add('original')
    const translationElement = document.createElement('span')
    translationElement.classList.add('text', 'jpn')
    translationElement.style.opacity = '.5'
    translationElement.innerText = translation
    textElement.insertAdjacentElement('afterend', translationElement)
    console.log(`inserted translation: `, {
      original: message.message,
      translation,
    })
  })
  Observer.childList(chatList, records => {
    records.forEach(record => {
      record.addedNodes.forEach(async node => {
        if (node instanceof HTMLElement && node.classList.contains('superChat-card-detail')) {
          const original = node.getAttribute('data-danmaku')
          if (!original) {
            console.warn('original not found')
            return
          }
          const messageList = await getSuperchatMessageList()
          const message = messageList.find((m: any) => m.message === original)
          if (!message) {
            console.warn('message not found')
            return
          }
          const translation = message.message_jpn || await getTranslation(message.id)
          const textElement = await SpinQuery.select(`.superChat-card-detail[data-danmaku='${original}'] .input-contain .text:not(.original):not(.jpn)`)
          if (!textElement) {
            console.warn('textElement not found')
            return
          }
          textElement.classList.add('original')
          const translationElement = document.createElement('span')
          translationElement.classList.add('text', 'jpn')
          translationElement.style.opacity = '.5'
          translationElement.innerText = translation
          textElement.insertAdjacentElement('afterend', translationElement)
          console.log(`inserted translation: `, {
            original: message.message,
            translation,
          })
        }
      })
    })
  })
})()
