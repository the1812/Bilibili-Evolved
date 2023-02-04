import { Toast } from '@/core/toast'
import { DownloadVideoOutput } from '../types'

export const toastOutput: DownloadVideoOutput = {
  name: 'toast',
  displayName: 'Toast',
  description:
    '弹一条消息显示出下载链接, 右键新标签页打开就可以下载. 链接有 referer 限制, 复制无用, 且不能保留视频文件名.',
  runAction: async action => {
    const fragments = action.infos.flatMap(it => it.titledFragments)
    const urls = fragments.map(f => f.url).join('\n')
    Toast.show(
      fragments
        .map(f => `<a class="link" href="${f.url}" download="${f.title}">${f.title}</a>`)
        .join('\n'),
      '下载视频',
    )
    console.log(urls)
    console.log(action)
  },
}
