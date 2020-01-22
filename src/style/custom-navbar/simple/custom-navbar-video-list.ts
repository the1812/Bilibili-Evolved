import { NavbarComponent } from '../custom-navbar-component'
interface VideoListConfig {
  mainUrl: string
  name: string
  apiUrl: string
  listName: string
  listMap: (json: any) => string[]
}
class VideoList extends NavbarComponent {
  listName: string
  constructor({ mainUrl, name, apiUrl, listName, listMap }: VideoListConfig) {
    super()
    this.href = mainUrl
    this.listName = listName
    this.html = name
    this.noPadding = true
    this.requestedPopup = false
    this.popupHtml = /*html*/`
      <ol class="video-list ${listName}">
        <li class="loading">加载中...</li>
      </ol>
    `
    this.initialPopup = async () => {
      if (!listMap) {
        return
      }
      const videoListElement = await SpinQuery.select(`.video-list.${listName}`)
      if (videoListElement === null) {
        return
      }
      const json = await Ajax.getJsonWithCredentials(apiUrl)
      let videoList = ''
      if (json.code !== 0) {
        logError(`加载${name}信息失败. 错误码: ${json.code} ${json.message}`)
      } else {
        videoList = listMap(json).join("")
      }
      videoListElement.insertAdjacentHTML('beforeend', videoList + /*html*/`
        <li class="more"><a target="_blank" href="${mainUrl}">查看更多</a></li>
      `)
      videoListElement.classList.add('loaded')
    }
  }
  get name() {
    return (this.listName + 'List') as keyof CustomNavbarOrders
  }
}
export class FavoritesList extends VideoList {
  constructor() {
    super({
      name: "收藏",
      mainUrl: `https://space.bilibili.com/${getUID()}/favlist`,
      apiUrl: "https://api.bilibili.com/medialist/gateway/coll/resource/recent",
      listName: "favorites",
      listMap: json => {
        if (!json.data || json.data.length === 0) {
          return [/*html*/`<li class="loading empty">空空如也哦 =￣ω￣=</li>`]
        }
        return json.data.map((item: any) => {
          return /*html*/`
            <li>
              <a target="_blank" href="https://www.bilibili.com/video/av${item.id}">${item.title}</a>
            </li>`
        })
      },
    })
    this.active = document.URL.replace(/\?.*$/, "") === `https://space.bilibili.com/${getUID()}/favlist`
  }
}
export class HistoryList extends VideoList {
  constructor() {
    super({
      name: "历史",
      mainUrl: "https://www.bilibili.com/account/history",
      apiUrl: "https://api.bilibili.com/x/v2/history?pn=1&ps=6",
      listName: "history",
      listMap: json => {
        if (!json.data || json.data.length === 0) {
          return [/*html*/`<li class="loading empty">空空如也哦 =￣ω￣=</li>`]
        }
        return json.data.map((item: any) => {
          let parameter = []
          let description = ""
          const page = item.page ? item.page.page : 1
          let progress = item.progress >= 0 ? item.progress / item.duration : 1
          if (isNaN(progress)) {
            progress = 0
          }

          if (page !== 1) {
            parameter.push(`p=${page}`)
            description += `看到第${page}话`
          }
          if (item.progress > 0 && item.progress < item.duration) {
            parameter.push(`t=${item.progress}`)
            description += ` ${Math.floor(progress * 100)}%`
          }
          else if (item.progress === 0) {
            description += ` 刚开始看`
          }
          else {
            description += " 100%"
          }
          return /*html*/`
            <li class="history-item">
              <a target="_blank" href="https://www.bilibili.com/video/av${item.aid}?${parameter.join("&")}">
                <span class="title">${item.title}</span>
                <span class="description">${description}</span>
                <div class="progress background">
                  <div class="progress foreground" style="--progress: ${progress * 100}%"></div>
                </div>
              </a>
            </li>`
        })
      },
    })
    this.active = document.URL.replace(/\?.*$/, "") === "https://www.bilibili.com/account/history"
  }
}
export default {
  export: {
    FavoritesList,
    HistoryList,
  },
}