import Vue from 'vue'
import { ComponentMetadata } from '@/components/types'
import { getFormatStr, Video } from './video'
import { getVue2Data } from '@/core/utils'
import { getComponentSettings } from '@/core/settings'
import { VideoInfo } from '@/components/video/video-info'

interface RecommendListUgc extends Vue {
  isFolded: boolean
  recLimit: number
  // 组件添加元素，非b站自有元素
  mark: boolean
  $children: VideoCard[]
}

interface VideoCard extends Vue {
  cardIndex: number
  // 组件添加元素，非b站自有元素
  mark: boolean
  info: {
    aid: string
    title: string
    pubdate: number
    owner: {
      // 组件添加元素，非b站自有元素
      mark: boolean
      oldname: string
      name: string
    }
  }
  isModern: boolean
  isLazyloaded: boolean
  isMounted: boolean
}

export class MediaListVideo implements Video {
  console: any
  metadata: ComponentMetadata

  constructor(console: any) {
    this.console = console
  }

  readonly videoClasses = ['recommend-video-card video-card']

  readonly showUploadTime = (relist: VideoCard[], forceUpdate = false, formatString = '') => {
    if (!formatString) {
      const { options } = getComponentSettings(this.metadata.name)
      formatString = options.formatString?.toString()
    }
    relist.forEach(async video => {
      // 使用临时变量保存视频名称，以避免计算属性导致的问题
      let videoName: string = video.info.owner.name
      // 确认存放推荐视频列表的List中的元素是否被更新
      if (forceUpdate || !video.info.owner.mark) {
        video.info.owner.mark = true
        // 确认推荐视频卡片是否被更新
        if (forceUpdate || !video.mark) {
          video.mark = true
          if (!video.info.pubdate) {
            const info = new VideoInfo(video.info.aid)
            await info.fetchInfo()
            // 保存查询到的pubdate，以便后续使用
            video.info.pubdate = info.pubdate
          }
          const createTime: Date = new Date(video.info.pubdate * 1000)
          if (!video.info.owner.oldname) {
            video.info.owner.oldname = video.info.owner.name
          }
          videoName = getFormatStr(createTime, formatString, video.info.owner.oldname)
        }
        // 保存生成后的name
        video.info.owner.name = videoName
      }
    })
  }
  readonly getRecoList = () => {
    const reco_list = dq('.recommend-list-container')
    const recoList: RecommendListUgc = getVue2Data(reco_list)
    if (recoList.isFolded === undefined) {
      this.console.log('结构获取失败')
      this.console.log(document.URL)
      this.console.log(recoList)
    }
    return recoList
  }

  settingChange(metadata: ComponentMetadata, setting: string): void {
    this.metadata = metadata
    const recoList: RecommendListUgc = this.getRecoList()
    const relist: VideoCard[] = recoList.$children.filter(video =>
      this.videoClasses.includes(video.$el.className),
    )
    this.showUploadTime(relist, true, setting)
  }

  urlChange(metadata: ComponentMetadata): void {
    this.metadata = metadata
    const recoList: RecommendListUgc = this.getRecoList()
    this.console.debug('urlChange recoList.mark', recoList.mark)
    if (!recoList.mark) {
      recoList.mark = true
      // 使用vue组件自带的$watch方法监视推荐列表信息是否变更，如果变更则更新
      recoList.$watch(
        'visibleRelated',
        () => {
          this.console.debug('visibleRelated changed, now url is', document.URL)
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
