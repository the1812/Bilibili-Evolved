import { defineComponentMetadata } from '@/components/define'
import { childList, urlChange } from '@/core/observer'
import { playerReady } from '@/core/utils'
import { videoUrls } from '@/core/utils/urls'
import { getVueData } from '@/components/feeds/api'
import { VideoInfo } from '@/components/video/video-info'
import { useScopedConsole } from '@/core/utils/log'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import desc from './desc.md'

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
  oldname: string
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
  description: desc,
  tags: [componentsTags.video],
  urlInclude: videoUrls,
  options: {
    formatString: {
      displayName: '文本格式',
      defaultValue: 'up · yyyy-MM-dd',
      validator: (value: string, oldValue: string) => (!value?.trim() ? oldValue : value),
    },
  },
  instantStyles: [
    {
      name: 'showUploadTime',
      style: () => import('./show-upload-time.scss'),
    },
  ],
  entry: async ({ metadata }) => {
    const getFormatStr = (time: Date, format: string, upName: string) => {
      const formatMap: any = {
        'M+': time.getMonth() + 1, // 月
        'd+': time.getDate(), // 日
        'h+': time.getHours(), // 时
        'm+': time.getMinutes(), // 分
        's+': time.getSeconds(), // 秒
        'q+': Math.floor((time.getMonth() + 3) / 3), // 季度
      }
      const constMap: any = {
        up: upName, // up名
        '\\\\r': '\r', // 回车符
        '\\\\n': '\n', // 换行符
        '\\\\t': '\t', // 制表符
      }
      // 处理年份
      let matchResult: RegExpMatchArray | null = format.match(/(y+)/)
      if (matchResult !== null) {
        format = format.replace(
          matchResult[0],
          `${time.getFullYear()}`.substring(4 - matchResult[0].length),
        )
      }
      // 处理除年份外的时间
      for (const key in formatMap) {
        if (!key) {
          continue
        }
        matchResult = format.match(new RegExp(`(${key})`))
        if (matchResult !== null) {
          format = format.replace(
            matchResult[0],
            matchResult[0].length === 1
              ? formatMap[key]
              : `00${formatMap[key]}`.substring(`${formatMap[key]}`.length),
          )
        }
      }
      // 处理自定义替换文本
      for (const key in constMap) {
        if (!key) {
          continue
        }
        matchResult = format.match(new RegExp(`(${key})`))
        if (matchResult !== null) {
          format = format.replace(matchResult[0], constMap[key])
        }
      }
      return format
    }

    const showUploadTime = (relist: VideoPageCard[], forceUpdate = false, formatString = '') => {
      if (!formatString) {
        const { options } = getComponentSettings(metadata.name)
        formatString = options.formatString?.toString()
      }
      relist.forEach(async video => {
        // 确认存放推荐视频列表的List中的元素是否被更新
        if (forceUpdate || !video.item.owner.mark) {
          video.item.owner.mark = true
          // 确认推荐视频卡片是否被更新
          if (forceUpdate || !video.mark) {
            video.mark = true
            let createTime: Date
            if (video.item.ctime) {
              createTime = new Date(video.item.ctime * 1000)
            } else {
              const videoinfo = new VideoInfo(video.item.aid)
              await videoinfo.fetchInfo()
              createTime = videoinfo.createTime
              // 保存查询到的ctime，以便后续使用
              video.item.ctime = createTime.getTime() / 1000
            }
            if (!video.oldname) {
              video.oldname = video.name
            }
            video.name = getFormatStr(createTime, formatString, video.oldname)
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

    addComponentListener(
      `${metadata.name}.formatString`,
      (value: string) => {
        const recoList: RecommendList = getRecoList()
        const relist: VideoPageCard[] = recoList.$children.filter(
          video => video.$el.className.indexOf('special') === -1,
        )
        showUploadTime(relist, true, value)
      },
      false,
    )

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
