import { monkey } from '@/core/ajax'
import { logError } from '@/core/utils/log'
import { DownloadVideoOutput } from '../../../../components/video/download/types'

const getPastebinUrl = async (str: string, config: ConfigDataType) => {
  const sp = new URLSearchParams()
  Object.entries({
    api_dev_key: config.api_dev_key,
    api_user_key: config.api_user_key, // ! 必须绑定一个账号，否则链接可能被吞
    api_folder_key: 'm3u',
    api_option: 'paste',
    api_paste_code: str,
    api_paste_private: '1',
    api_paste_expire_date: '10M',
  }).forEach(([key, value]) => sp.append(key, value))
  const response = await monkey<string>({
    url: 'https://pastebin.com/api/api_post.php',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: sp.toString(),
    nocache: true,
    responseType: 'text',
    fetch: true,
  })
  if (/^Bad API request,/.test(response)) {
    throw response
  }

  return response
}

export const MPV_Ex: DownloadVideoOutput<ConfigDataType> = {
  name: 'mpv-ex',
  displayName: 'MPV 输出支持加强版',
  description:
    '多文件时格式选择 flv，使用前请先阅读 <a href="https://github.com/Asukaaaaaa/tricks/blob/main/Bilibili-Evolved%20mpv-ex%20%E6%8F%92%E4%BB%B6.md" target="blank">README</a>',
  runAction: async (action, instance) => {
    let finalURL: string
    const mpv_protocol = 'mpv://--http-header-fields="referer:https://www.bilibili.com/"'
    if (action.isSingleVideo) {
      // 单文件直接生成 url
      const frag = action.infos[0].fragments
      if (frag.length === 1) {
        finalURL = `${mpv_protocol} ${frag[0].url}`
      } else if (frag.length === 2) {
        finalURL = `${mpv_protocol} ${frag[0].url} --audio-file=${frag[1].url}`
      }
    } else {
      // 多文件生成 .m3u 播放列表
      const m3u = action.infos.reduce((acc, v) => {
        return `${acc}#EXTINF:-1,${v.input.title}\n${v.fragments[0].url}\n` // ? 暂不支持外挂音轨，默认取第一个资源的链接
      }, '#EXTM3U\n')
      try {
        const playlist = (await getPastebinUrl(m3u, instance)).replace(
          /^(https:\/\/pastebin.com)\/(.*)/,
          '$1/raw/$2?.m3u',
        )
        finalURL = `${mpv_protocol} ${playlist}`
      } catch (error) {
        logError(error)
        return
      }
    }

    console.log(finalURL)
    window.open(finalURL)
  },
  component: () => import('./Config.vue').then(m => m.default),
}
