const getMatch = () => document.URL.replace(location.search, '').match(/https:\/\/live\.bilibili\.com\/record\/(.+)/)
export default {
  widget: {
    content: /*html*/`
      <button class="gui-settings-flat-button" style="position: relative; z-index: 100;" id="download-live-records">
        <i class="icon-download"></i>
        <span>下载录像</span>
      </button>`,
    condition: async () => {
      const match = getMatch()
      return Boolean(match)
    },
    success: () => {
      const button = dq('#download-live-records') as HTMLButtonElement
      button.addEventListener('click', async () => {
        try {
          button.disabled = true
          const id = getMatch()![1]
          const json = await Ajax.getJson(`https://api.live.bilibili.com/xlive/web-room/v1/record/getLiveRecordUrl?rid=${id}&platform=html5`)
          if (json.code !== 0) {
            logError(new Error(`获取录像链接失败: ${json.message}`))
            return
          }
          const links: string[] = json.data.list.map((it: any) => it.url)
          Toast.success(links.map(l => /*html*/`<a class="download-link" target="_blank" href="${l}">${l}</a>`).join('\n'), '下载录像')
        } catch (error) {
          logError(error)
        } finally {
          button.disabled = false
        }
      })
    },
  }
}