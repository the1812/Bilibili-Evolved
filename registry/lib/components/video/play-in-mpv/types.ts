import {
  Executable, TestPattern, VueModule, WithName,
} from '@/core/common-types'
import { DownloadPackage, PackageEntry } from '@/core/download'
import { formatNumber } from '@/core/utils/formatters'
import { getFriendlyTitle } from '@/core/utils/title'
import { VideoQuality } from '@/components/video/video-quality'

interface VueInstanceInput {
  component?: Executable<VueModule>
}
/** 表示一个视频输入数据 */
export interface PlayMpvInputItem {
  aid: string
  cid: string
  /** 格式化 (formatTitle) 处理后的标题 */
  title: string
  bvid?: string
  /** 期望的画质, 忽略时表示返回任意画质都可以接受 */
  quality?: VideoQuality
  /** 是否允许画质回退, 当实际画质和期望画质不符时此项将决定是否抛出异常 */
  allowQualityDrop?: boolean
}
/** 页面数据提供者 */
export interface PlayMpvInput<InputParameter = any> extends VueInstanceInput, WithName {
  getInputs: (componentInstance: InputParameter) => Promise<PlayMpvInputItem[]>
  match?: TestPattern
}
/** 表示一个视频分段 */
export interface PlayMpvFragment {
  length: number
  size: number
  url: string
  extension: string
  backupUrls?: string[]
}
/** 调用 API 后得到的视频详细信息, 包括下载链接, 清晰度, 分段等 */
export class PlayMpvInfo {
  public input: PlayMpvInputItem
  public fragments: PlayMpvFragment[]
  public qualities: VideoQuality[]
  public currentQuality: VideoQuality
  public jsonData: any
  constructor(parameters: Omit<PlayMpvInfo, 'totalSize' | 'totalLength' | 'titledFragments'>) {
    Object.assign(this, parameters)
  }
  get totalSize() {
    return lodash.sumBy(this.fragments, f => f.size)
  }
  get totalLength() {
    return lodash.sumBy(this.fragments, f => f.length)
  }
  get titledFragments() {
    return this.fragments.map((fragment, index) => {
      const hasSameExtension = this.fragments
        .filter(f => f.extension === fragment.extension)
        .length > 1
      const filenameSuffix = hasSameExtension
        ? ` - ${formatNumber(index + 1, this.fragments.length)}`
        : ''
      return { ...fragment, title: `${this.input.title}${filenameSuffix}${fragment.extension}` }
    })
  }
}
/** 表示某种类型的MPV播放 API */
export interface PlayMpvApi extends WithName {
  playMpvInfo: (input: PlayMpvInputItem) => Promise<PlayMpvInfo>
  description?: string
}
/** 表示下载时额外附带的产物, 如弹幕 / 字幕等 */
export interface PlayMpvAssets<AssetsParameter = any> extends VueInstanceInput, WithName {
  getAssets: (infos: PlayMpvInfo[], instance: AssetsParameter) => Promise<PackageEntry[]>
}
/** 表示视频的下载信息以及携带的额外产物 */
export class PlayMpvAction {
  readonly inputs: PlayMpvInputItem[] = []
  extraAssets: PackageEntry[] = []

  constructor(
    public infos: PlayMpvInfo[],
  ) {
    this.inputs = infos.map(it => it.input)
  }
  get isSingleVideo() {
    return this.inputs.length < 2
  }
  async downloadExtraAssets() {
    console.log('[downloadExtraAssets]', this.extraAssets)
    const filename = `${getFriendlyTitle(false)}.zip`
    await new DownloadPackage(this.extraAssets).emit(filename)
  }
}
/** MPV播放的最终输出处理 */
export interface PlayMpvOutput<OutputParameter = any> extends VueInstanceInput, WithName {
  runAction: (action: PlayMpvAction, instance: OutputParameter) => Promise<void>
  description?: string
}
