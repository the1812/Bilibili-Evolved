import { Package } from '..'

export const pack: Package = {
  name: 'downloader',
  displayName: '下载器',
  description: '支持下载各种内容.',
  components: ['downloadVideo', 'downloadSubtitle', 'downloadDanmaku', 'downloadAudio'],
}
