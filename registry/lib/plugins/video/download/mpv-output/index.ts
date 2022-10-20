import { Toast } from '@/core/toast'
import { PluginMetadata } from '@/plugins/plugin'
import { DownloadVideoOutput } from '../../../../components/video/download/types'

export const plugin: PluginMetadata = {
  name: 'downloadVideo.outputs.mpv',
  displayName: '下载视频 - MPV 输出支持',
  // FIXME: plugin 也需要 author 字段
  author: {
    name: 'diannaojiang',
    link: 'https://github.com/diannaojiang',
  },
  description:
    '为下载视频增加 MPV 输出支持, 配置方式请参考 [Bilibili-Playin-Mpv](https://github.com/diannaojiang/Bilibili-Playin-Mpv)',
  setup: ({ addData }) => {
    addData('downloadVideo.outputs', (outputs: DownloadVideoOutput[]) => {
      outputs.push({
        name: 'mpv',
        displayName: 'MPV',
        description: '弹一条消息显示出播放按钮，点击即可使用MPV进行播放',
        runAction: async action => {
          const fragments = action.infos.flatMap(it => it.titledFragments)
          const urls = fragments.map(f => f.url).join('\n')
          const mpv = `mpv://--http-header-fields=\"referer:https://www.bilibili.com/\" \"${fragments[0].url}\" --audio-file=\"${fragments[1].url}\"`
          console.log(mpv)
          Toast.show(`<a class="link" href="${encodeURI(mpv)}" >播放</a>`, 'MPV播放')
          console.log(urls)
          console.log(action)
        },
      })
    })
  },
}
