import Vue from 'vue'
import { ComponentMetadata } from '@/components/types'
import { getFormatStr, Video } from './video'
import { getVue2Data, matchUrlPattern } from '@/core/utils'
import { getComponentSettings } from '@/core/settings'
import { VideoInfo } from '@/components/video/video-info'
import { mediaListUrls } from '@/core/utils/urls'

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

  // 新增：存储每个视频卡片对应的 IntersectionObserver 实例
  private lazyLoadObserverMap = new WeakMap<VideoCard, IntersectionObserver>()

  constructor(console: any) {
    this.console = console
  }

  readonly videoClasses = ['recommend-video-card video-card']

  readonly showUploadTime = (relist: VideoCard[], forceUpdate = false, formatString = '') => {
    if (!formatString) {
      const { options } = getComponentSettings(this.metadata.name)
      formatString = options.formatString?.toString()
    }

    relist.forEach(video => {
      // 已经处理完成且非强制更新，跳过
      if (!forceUpdate && video.info.owner.mark) {
        return
      }
      // 已经绑定观察者且非强制更新，等待懒加载
      if (!forceUpdate && this.lazyLoadObserverMap.has(video)) {
        return
      }

      // 强制更新
      if (forceUpdate) {
        const oldObserver = this.lazyLoadObserverMap.get(video)
        if (oldObserver) {
          oldObserver.disconnect()
          this.lazyLoadObserverMap.delete(video)
        }
        video.info.owner.mark = false
      }

      const processAndUpdate = async (v: VideoCard) => {
        // 请求 pubdate
        if (!v.info.pubdate) {
          const info = new VideoInfo(v.info.aid)
          await info.fetchInfo()
          v.info.pubdate = info.pubdate
        }
        // 保存原始名称
        if (!v.info.owner.oldname) {
          v.info.owner.oldname = v.info.owner.name
        }
        const createTime = new Date(v.info.pubdate * 1000)
        const newName = getFormatStr(createTime, formatString, v.info.owner.oldname)
        v.info.owner.name = newName
        // 标记完成
        v.info.owner.mark = true
        v.mark = true
      }

      // 已有 pubdate => 直接同步更新
      if (video.info.pubdate) {
        if (!video.info.owner.oldname) {
          video.info.owner.oldname = video.info.owner.name
        }
        const createTime = new Date(video.info.pubdate * 1000)
        const newName = getFormatStr(createTime, formatString, video.info.owner.oldname)
        video.info.owner.name = newName
        video.info.owner.mark = true
        video.mark = true
        return
      }

      // 无 pubdate => 绑定观察者
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              processAndUpdate(video)
                .then(() => {
                  observer.disconnect()
                  this.lazyLoadObserverMap.delete(video)
                })
                .catch(err => {
                  this.console.error('懒加载获取视频信息失败:', err)
                  observer.disconnect()
                  this.lazyLoadObserverMap.delete(video)
                })
            }
          })
        },
        { threshold: 0.1 },
      )

      observer.observe(video.$el)
      this.lazyLoadObserverMap.set(video, observer)
      video.mark = true
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
          this.showUploadTime(relist, mediaListUrls.some(matchUrlPattern))
        },
        { deep: true, immediate: true },
      )
    }
  }
}
