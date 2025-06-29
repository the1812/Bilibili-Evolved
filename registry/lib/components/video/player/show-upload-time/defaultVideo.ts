import Vue from 'vue'
import { ComponentMetadata } from '@/components/types'
import { getFormatStr, Video } from './video'
import { getVue2Data } from '@/core/utils'
import { getComponentSettings } from '@/core/settings'
import { VideoInfo } from '@/components/video/video-info'

interface RecommendList extends Vue {
  isOpen: boolean
  // 组件添加元素，非b站自有元素
  mark: boolean
  related: {
    aid: string
    title: string
    pubdate: number
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
  oldname: string
  item: {
    aid: string
    pubdate: number
    owner: {
      // 组件添加元素，非b站自有元素
      mark: boolean
      name: string
    }
  }
}

export class DefaultVideo implements Video {
  console: any
  metadata: ComponentMetadata

  constructor(console: any) {
    this.console = console
  }

  readonly videoClasses = ['video-page-operator-card-small', 'video-page-card-small']

  readonly showUploadTime = (relist: VideoPageCard[], forceUpdate = false, formatString = '') => {
    if (!formatString) {
      const { options } = getComponentSettings(this.metadata.name)
      formatString = options.formatString?.toString()
    }
    relist.forEach(async video => {
      // 使用临时变量保存视频名称，以避免计算属性导致的问题
      let videoName: string = video.name
      // 确认存放推荐视频列表的List中的元素是否被更新
      if (forceUpdate || !video.item.owner.mark) {
        video.item.owner.mark = true
        // 确认推荐视频卡片是否被更新
        if (forceUpdate || !video.mark) {
          video.mark = true
          if (!video.item.pubdate) {
            const info = new VideoInfo(video.item.aid)
            await info.fetchInfo()
            // 保存查询到的pubdate，以便后续使用
            video.item.pubdate = info.pubdate
          }
          const createTime: Date = new Date(video.item.pubdate * 1000)
          if (!video.oldname) {
            video.oldname = video.name
          }
          videoName = getFormatStr(createTime, formatString, video.oldname)
          video.name = videoName
        }
        // 保存生成后的name
        video.item.owner.name = videoName
      }
    })
  }

  readonly getRecoList = () => {
    let reco_list = dq('#reco_list')
    // 2024.10.17 兼容最近的b站前端改动
    if (reco_list == null) {
      reco_list = dq('.recommend-list-v1')
    }
    let recoList: RecommendList = getVue2Data(reco_list)
    if (recoList.isOpen === undefined) {
      recoList = recoList.$children[0]
      if (recoList.isOpen === undefined) {
        this.console.log('结构获取失败')
        this.console.log(document.URL)
        this.console.log(recoList)
      }
    }
    return recoList
  }

  settingChange(metadata: ComponentMetadata, setting: string): void {
    this.metadata = metadata
    const recoList: RecommendList = this.getRecoList()
    const relist: VideoPageCard[] = recoList.$children.filter(video =>
      this.videoClasses.includes(video.$el.className),
    )
    this.showUploadTime(relist, true, setting)
  }

  urlChange(metadata: ComponentMetadata): void {
    this.metadata = metadata
    const recoList: RecommendList = this.getRecoList()
    this.console.debug('urlChange recoList.mark', recoList.mark)
    if (!recoList.mark) {
      recoList.mark = true
      // 使用vue组件自带的$watch方法监视推荐列表信息是否变更，如果变更则更新
      recoList.$watch(
        'recListItems',
        () => {
          this.console.debug('recoListItems changed, now url is', document.URL)
          const relist = recoList.$children.filter(video =>
            this.videoClasses.includes(video.$el.className),
          )
          this.showUploadTime(relist)
        },
        { deep: true, immediate: true },
      )
    }
  }
}
