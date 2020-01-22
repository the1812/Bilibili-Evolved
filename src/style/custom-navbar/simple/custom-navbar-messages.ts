import { NavbarComponent } from '../custom-navbar-component'
export class Messages extends NavbarComponent {
  constructor() {
    super()
    this.href = 'https://message.bilibili.com/'
    this.html = '消息'
    this.popupHtml = /*html*/`
      <ul id="message-list">
        <li><a data-name="reply" target="_blank" href="https://message.bilibili.com/#/reply">回复我的</a></li>
        <li><a data-name="at" target="_blank" href="https://message.bilibili.com/#/at">@我的</a></li>
        <li><a data-name="like" target="_blank" href="https://message.bilibili.com/#/love">收到的赞</a></li>
        <li><a data-name="user_msg" target="_blank" href="https://message.bilibili.com/#/whisper">我的消息</a></li>
        <li><a data-name="sys_msg" target="_blank" href="https://message.bilibili.com/#/system">系统通知</a></li>
      </ul>
    `
    this.requestedPopup = true
    this.active = document.URL.startsWith('https://message.bilibili.com/')
    this.fetchSettings().then(notify => {
      if (notify) {
        this.init()
      }
    })
  }
  get name(): keyof CustomNavbarOrders {
    return 'messages'
  }
  async fetchSettings() {
    const json = await Ajax.getJsonWithCredentials(`https://api.vc.bilibili.com/link_setting/v1/link_setting/get?msg_notify=1`)
    if (json.code !== 0) {
      return
    }
    await this.setNotifyStyle(json.data.msg_notify)
    return json.data.msg_notify !== 3
  }
  async init() {
    const mainJson = await Ajax.getJsonWithCredentials(`https://api.bilibili.com/x/msgfeed/unread`)
    const messageJson = await Ajax.getJsonWithCredentials(`https://api.vc.bilibili.com/session_svr/v1/session_svr/single_unread`)
    const list = await SpinQuery.select('#message-list') as HTMLElement
    const items = [...list.querySelectorAll('a[data-name]')]
    const names = items.map(it => it.getAttribute('data-name')!!)

    if (mainJson.code !== 0 || messageJson.code !== 0) {
      return
    }
    mainJson.data['user_msg'] = messageJson.data.unfollow_unread + messageJson.data.follow_unread
    let totalCount: number = names.reduce((acc, it) => acc + mainJson.data[it], 0)
    if (!totalCount) {
      return
    }
    await this.setNotifyCount(totalCount)
    names.forEach((name, index) => {
      const count = mainJson.data[name] as number
      if (count > 0) {
        items[index].setAttribute('data-count', count.toString())
      }
      else {
        items[index].removeAttribute('data-count')
      }
    })
    items.forEach(item => {
      item.addEventListener('click', () => {
        const count = parseInt(item.getAttribute('data-count')!!)
        item.removeAttribute('data-count')
        totalCount -= count
        this.setNotifyCount(totalCount)
      })
    })
  }
}
export default {
  export: {
    Messages,
  },
}