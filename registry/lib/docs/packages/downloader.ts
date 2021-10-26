import { Package } from '..'

export const pack: Package = {
  name: 'downloader',
  displayName: '下载器',
  description: '包含下载各种内容的功能.',
  components: [
    'downloadVideo',
    'downloadSubtitle',
    'downloadDanmaku',
    'downloadAudio',
    'downloadLiveRecords',
  ],

}