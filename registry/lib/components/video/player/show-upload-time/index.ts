import { defineComponentMetadata } from '@/components/define'
import { childList, urlChange } from '@/core/observer'
import { playerReady } from '@/core/utils'
import { videoUrls } from '@/core/utils/urls'
import { getVueData } from '@/components/feeds/api'
import { VideoInfo } from '@/components/video/video-info'

interface RecommendList extends Vue {
  isOpen: boolean
  related: {
    aid: string
    title: string
    ctime: number
    owner: {
      name: string
    }
  }[]
  $children: VideoPageCard[]
}

interface VideoPageCard extends Vue {
  name: string
  title: string
  mark: boolean
  item: {
    aid: string
    ctime: number
    owner: {
      mark: boolean
      name: string
    }
  }
}

export const component = defineComponentMetadata({
  author: { name: 'wisokey', link: 'https://github.com/wisokey' },
  name: 'showUploadTime',
  displayName: '显示视频投稿时间',
  description: '为视频播放页面的推荐列表中的视频添加显示视频投稿时间.',
  tags: [componentsTags.video],
  urlInclude: videoUrls,
  entry: async () => {
    const showUploadTime = (relist: VideoPageCard[]) => {
      relist.forEach(async video => {
        if (!video.item.owner.mark) {
          video.item.owner.mark = true
          if (!video.mark) {
            video.mark = true
            let createTime: Date
            if (video.item.ctime) {
              createTime = new Date(video.item.ctime * 1000)
            } else {
              const videoinfo = new VideoInfo(video.item.aid)
              await videoinfo.fetchInfo()
              createTime = videoinfo.createTime
            }
            video.name = `${video.name} · ${createTime.getFullYear()}-${
              createTime.getMonth() + 1
            }-${createTime.getDate()}`
          }
          video.item.owner.name = video.name
        }
      })
    }

    urlChange(async () => {
      await playerReady()
      const relist: VideoPageCard[] = getVueData(dq('#reco_list')).$children.filter(
        video => video.$el.className.indexOf('special') === -1,
      )
      showUploadTime(relist)
    })

    await playerReady()
    childList(dq('#reco_list .rec-list'), async () => {
      const recoList: RecommendList = getVueData(dq('#reco_list'))
      if (recoList.isOpen) {
        const relist: VideoPageCard[] = recoList.$children.filter(
          video => video.$el.className.indexOf('special') === -1,
        )
        showUploadTime(relist)
      }
    })
  },
})
