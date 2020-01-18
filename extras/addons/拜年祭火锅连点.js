// ==UserScript==
// @name         拜年祭火锅连点
// @version      1.0.0
// @author       Grant Howard
// @license      MIT
// @match        https://www.bilibili.com/blackboard/xianxing2020bnj.html*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==
window.addEventListener('load', async () => {
  Object.assign(window, unsafeWindow.bilibiliEvolved)
  const Toast = await unsafeWindow.bilibiliEvolved.resources.importAsync('toast')
  const log = (...args) => {
    console.log(...args)
    Toast.info(args.join(' '), '拜年祭火锅连点', 6000)
  }
  unsafeWindow.startAutoClick = true
  addons.push({
    content: /*html*/`
      <button id="dish-click" class="gui-settings-flat-button">
        <i class="mdi mdi-24px mdi-cursor-default-click-outline"></i>
        关闭火锅连点
      </button>`,
    success: () => {
      const button = document.getElementById('dish-click')
      const textNode = [...button.childNodes].find(it => it.nodeType === Node.TEXT_NODE && it.textContent.trim() !== '')
      button.addEventListener('click', () => {
        if (unsafeWindow.startAutoClick === true) {
          textNode.textContent = '启动火锅连点'
        } else {
          textNode.textContent = '关闭火锅连点'
        }
        unsafeWindow.startAutoClick = !unsafeWindow.startAutoClick
      })
    }
  })
  setInterval(async () => {
    if (unsafeWindow.startAutoClick !== true) {
      return
    }
    const count = Math.floor(Math.random() * (10 - 2)) + 2
    const response = await (await fetch('https://api.bilibili.com/x/activity/bnj2020/hotpot/increase', {
      credentials: 'include',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: `count=${count}&csrf=${getCsrf()}`,
      method: 'POST'
    }
    )).json()
    if (response.code === 0) {
      log('完成了一次连点, 次数: ', count)
      if (response.data) {
        log(`触发了特殊事件: `, response.data.name)
      }
    } else {
      log('连点失败! ', response.message)
    }
  }, 3000)
})