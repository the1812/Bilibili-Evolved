import { Toast } from '@/core/toast'
import { PlayMpvOutput } from '../types'

export const toastOutput: PlayMpvOutput = {
  name: 'consoleLogDemo',
  displayName: 'Toast',
  description: '弹一条消息显示出播放按钮，点击即可使用MPV进行播放',
  runAction: async action => {
    const fragments = action.infos.flatMap(it => it.titledFragments)
    const urls = fragments.map(f => f.url).join('\n')
    const mpv = 'mpv://--http-header-fields=\"referer:https://www.bilibili.com/\" \"' + fragments[0].url + '\" --audio-file=\"' + fragments[1].url + '\"';
		console.log(mpv);
    Toast.show(
      `<a class="link" href="${encodeURI(mpv)}" >播放</a>`,
      'MPV播放',
    )
    console.log(urls)
    console.log(action)
  },
}
