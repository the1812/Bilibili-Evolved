import { defineComponentMetadata } from '@/components/define'
import { urlChange } from '@/core/observer'
import { playerReady } from '@/core/utils'
import { videoUrls } from '@/core/utils/urls'
import { VideoInfo } from '@/components/video/video-info'

export const component = defineComponentMetadata({
  author: { name: 'wisokey', link: 'https://github.com/wisokey' },
  name: 'showUploadTime',
  displayName: '显示视频投稿时间',
  description: '为视频播放页面的推荐列表中的视频添加显示视频投稿时间.',
  tags: [componentsTags.video],
  urlInclude: videoUrls,
  entry: async () => {
    const title2name = new Map()

    const showUploadTime = () => {
      const relist: Vue[] = reco_list.__vue__.$children.filter(video => video.$el.className.indexOf('special') === -1)
      relist.forEach(video => { video.name = title2name.get(video.title) })
    }

    const fetchInfo = () => {
      let running = 0
      title2name.clear()
      __INITIAL_STATE__.related.forEach(async iterator => {
        const videoinfo = new VideoInfo(iterator.aid)
        running++
        await videoinfo.fetchInfo()
        if (!iterator.owner.mark) {
          iterator.owner.name += ` · ${videoinfo.createTime.getFullYear()}-${videoinfo.createTime.getMonth() + 1}-${videoinfo.createTime.getDate()}`
          iterator.owner.mark = true
          title2name.set(iterator.title, iterator.owner.name)
        }
        running--
        if (running === 0) {
          showUploadTime()
        }
      })
    }

    urlChange(async () => {
      await playerReady()
      fetchInfo()
    })
  },
})
