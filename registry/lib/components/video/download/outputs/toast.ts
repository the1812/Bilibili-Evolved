import { Toast } from '@/core/toast'
import { DownloadVideoOutput } from '../types'

export const toastOutput: DownloadVideoOutput = {
  name: 'consoleLogDemo',
  displayName: 'Toast',
  runAction: async action => {
    const fragments = action.infos.flatMap(it => it.titledFragments)
    const urls = fragments.map(f => f.url).join('\n')
    Toast.show(
      fragments.map(f => `<a class="link" href="${f.url}" download="${f.title}">${f.title}</a>`).join('\n'),
      '下载视频',
    )
    console.log(urls)
    console.log(action)
  },
}
