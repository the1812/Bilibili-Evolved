(async () => {
  if (!document.URL.startsWith('https://live.bilibili.com/')) {
    return
  }
  const roomIDMatch = document.URL.match(/live\.bilibili\.com\/(\d+)/)
  if (!roomIDMatch) {
    console.warn('roomID not found')
    return
  }
  const roomID = roomIDMatch[1]
  // pay-note-panel
  const chatList = await SpinQuery.select('.chat-history-list')
  if (chatList === null) {
    console.warn('chatList not found')
    return
  }
  resources.applyStyle('superchatTranslateStyle')
  const getSuperchatMessageList = async () => {
    const json = await Ajax.getJson(`https://api.live.bilibili.com/av/v1/SuperChat/getMessageList?room_id=${roomID}`)
    if (json.code !== 0) {
      console.warn(`superchat api failed with ${json.code}`)
      return []
    }
    return _.get(json, 'data.list', [])
  }
  Observer.childList(chatList, records => {
    records.forEach(record => {
      record.addedNodes.forEach(async node => {
        if (node instanceof HTMLElement && node.classList.contains('superChat-card-detail')) {
          const ts = node.getAttribute('data-ts')
          if (!ts) {
            console.warn('ts not found')
            return
          }
          const messageList = await getSuperchatMessageList()
          const message = messageList.find((m: any) => m.ts.toString() === ts)
          if (!message) {
            console.warn('message not found')
            return
          }
          const translation = message.message_jpn
          const textElement = await SpinQuery.select(`.superChat-card-detail[data-ts='${ts}'] .input-contain .text`)
          if (!textElement) {
            console.warn('textElement not found')
            return
          }
          const translationElement = document.createElement('span')
          translationElement.classList.add('text')
          translationElement.style.opacity = '.5'
          translationElement.innerText = translation
          textElement.insertAdjacentElement('afterend', translationElement)
          console.log(`inserted translation: `, {
            ts,
            original: message.message,
            translation,
          })
        }
      })
    })
  })
})()
