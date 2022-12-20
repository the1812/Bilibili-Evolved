import { defineComponentMetadata } from '@/components/define'
import { childList, urlChange } from '@/core/observer'
import { playerReady } from '@/core/utils'
import { videoUrls } from '@/core/utils/urls'
import { getVueData } from '@/components/feeds/api'
import { VideoInfo } from '@/components/video/video-info'
import { useScopedConsole } from '@/core/utils/log'

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
  $children: (RecommendList & VideoPageCard)[]
}

interface VideoPageCard extends Vue {
  name: string
  title: string
  // 组件添加元素，非b站自有元素
  mark: boolean
  item: {
    aid: string
    ctime: number
    owner: {
      // 组件添加元素，非b站自有元素
      mark: boolean
      name: string
    }
  }
}

const displayName = '显示视频投稿时间'
const console = useScopedConsole(displayName)
export const component = defineComponentMetadata({
  author: { name: 'wisokey', link: 'https://github.com/wisokey' },
  name: 'showUploadTime',
  displayName,
  description: '为视频播放页面的推荐列表中的视频添加显示视频投稿时间.',
  tags: [componentsTags.video],
  urlInclude: videoUrls,
  entry: async () => {
    const showUploadTime = (relist: VideoPageCard[]) => {
      relist.forEach(async video => {
        // 确认存放推荐视频列表的List中的元素是否被更新
        if (!video.item.owner.mark) {
          video.item.owner.mark = true
          // 确认推荐视频卡片是否被更新
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
          // 保存生成后的name
          video.item.owner.name = video.name
        }
      })
    }

    const getRecoList = () => {
      const reco_list = dq('#reco_list')
      let recoList: RecommendList = getVueData(reco_list)
      if (recoList.isOpen === undefined) {
        recoList = recoList.$children[0]
        if (recoList.isOpen === undefined) {
          console.log('结构获取失败')
          console.log(document.URL)
          console.log(recoList)
        }
      }
      return recoList
    }

    urlChange(async () => {
      await playerReady()
      const recoList: RecommendList = getRecoList()
      const relist: VideoPageCard[] = recoList.$children.filter(
        video => video.$el.className.indexOf('special') === -1,
      )
      showUploadTime(relist)
    })

    await playerReady()
    // 监视推荐列表是否打开，如果打开则更新
    childList(dq('#reco_list .rec-list'), async () => {
      const recoList: RecommendList = getRecoList()
      if (recoList.isOpen) {
        const relist: VideoPageCard[] = recoList.$children.filter(
          video => video.$el.className.indexOf('special') === -1,
        )
        showUploadTime(relist)
      }
    })
  },
})
