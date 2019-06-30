class VideoEpisodeBatch {
  static async test () {
    if (!document.URL.includes('/www.bilibili.com/video/av')) {
      return false
    }
    return await SpinQuery.select('#multi_page') !== null
  }
  async collectData (quality) {
    const api = `https://api.bilibili.com/x/web-interface/view?aid=${unsafeWindow.aid}`
    const json = await Ajax.getJson(api)
    if (json.code !== 0) {
      Toast.error(`获取视频选集列表失败, message=${json.message}`, '批量下载')
      return ''
    }
    const pages = json.data.pages
    if (pages === undefined) {
      Toast.error(`获取视频选集列表失败, 没有找到选集信息.`, '批量下载')
      return ''
    }
    const result = []
    for (const page of pages) {
      const url = `https://api.bilibili.com/x/player/playurl?avid=${unsafeWindow.aid}&cid=${page.cid}&qn=${quality}&otype=json`
      const json = await Ajax.getJsonWithCredentials(url)
      const data = json.data || json.result || json
      if (data.quality !== quality) {
        Toast.error('获取下载链接失败, 请确认当前账号有下载权限后重试.', '批量下载')
        return ''
      }
      const fragments = data.durl.map(it => {
        return {
          length: it.length,
          size: it.size,
          url: it.url
        }
      })
      result.push({
        fragments,
        title: `${page.page} - ${page.part}`,
        totalSize: fragments.map(it => it.size).reduce((acc, it) => acc + it),
        cid: page.cid,
        referer: document.URL.replace(window.location.search, '')
      })
    }
    return JSON.stringify(result)
  }
}
class BangumiBatch {
  static async test () {
    return document.URL.includes('/www.bilibili.com/bangumi')
  }
  async collectData (quality) {
    const metaUrl = document.querySelector("meta[property='og:url']")
    if (metaUrl === null) {
      Toast.error('获取番剧数据失败: 无法找到 Season ID', '批量下载')
      return ''
    }
    const seasonId = metaUrl.getAttribute('content').match(/play\/ss(\d+)/)[1]
    if (seasonId === undefined) {
      Toast.error('获取番剧数据失败: 无法解析 Season ID', '批量下载')
      return ''
    }
    const json = await Ajax.getJson(`https://api.bilibili.com/pgc/web/season/section?season_id=${seasonId}`)
    if (json.code !== 0) {
      Toast.error(`获取番剧数据失败: 无法获取番剧集数列表, message=${json.message}`, '批量下载')
      return ''
    }
    const pages = json.result.main_section.episodes.map(it => {
      return { aid: it.aid, cid: it.cid, number: it.title, title: it.long_title }
    })
    const result = []
    for (const page of pages) {
      const url = `https://api.bilibili.com/pgc/player/web/playurl?avid=${page.aid}&cid=${page.cid}&qn=${quality}&otype=json`
      const json = await Ajax.getJsonWithCredentials(url)
      const data = json.data || json.result || json
      if (data.quality !== quality) {
        Toast.error('获取下载链接失败, 请确认当前账号有下载权限后重试.', '批量下载')
        return ''
      }
      const fragments = data.durl.map(it => {
        return {
          length: it.length,
          size: it.size,
          url: it.url
        }
      })
      result.push({
        fragments,
        title: `${page.number} - ${page.title}`,
        totalSize: fragments.map(it => it.size).reduce((acc, it) => acc + it),
        cid: page.cid
      })
    }
    return JSON.stringify(result)
  }
}
const extractors = [BangumiBatch, VideoEpisodeBatch]
let ExtractorClass = null
export class BatchExtractor {
  static async test () {
    for (const e of extractors) {
      if (await e.test() === true) {
        ExtractorClass = e
        return true
      }
    }
    ExtractorClass = null
    return false
  }
  async collectData (format, toast) {
    if (ExtractorClass === null) {
      logError('[批量下载] 未找到合适的解析模块.')
      return null
    }
    const extractor = new ExtractorClass()
    const result = await extractor.collectData(format.quality)
    toast.dismiss()
    return result
  }
}
export default {
  export: {
    BatchExtractor
  }
}
