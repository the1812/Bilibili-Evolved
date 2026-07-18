/* eslint-disable no-irregular-whitespace */
import { VideoInfo } from '@/components/video/video-info'
import { VideoSnapshot } from '@/components/video/video-snapshot'
import { PackageEntry } from '@/core/download'
import { meta } from '@/core/meta'
import { getComponentSettings } from '@/core/settings'
import { Toast, ToastType } from '@/core/toast'
import { formatDateTime, formatDuration } from '@/core/utils/formatters'
import { useScopedConsole } from '@/core/utils/log'
import { openCanvasViewer } from '@/ui'
import { componentName, displayName } from '.'
import { DownloadVideoInfo } from '../download/types'
import { Options } from './options'

export function getOptions() {
  return getComponentSettings<Options>(componentName).options
}

let scopedConsole: ReturnType<typeof useScopedConsole>

export function getConsole() {
  return scopedConsole ?? (scopedConsole = useScopedConsole(displayName))
}

export async function openViewer() {
  return openCanvasViewer('视频快照加载中……')
}

function getFooterText() {
  return `${formatDateTime(new Date())} @ Bilibili-Evolved v${meta.compilationInfo.version}`
}

async function getVideoInfoText(vid: number | string, cid?: number) {
  const lines: string[] = []
  const info = await new VideoInfo(String(vid), typeof vid === 'string').fetchInfo()
  const page = cid ? info.pages.find(p => p.cid === cid) : info.pages[0]
  lines.push(`${info.bvid}　AV${info.aid}　CID ${page.cid}`, `稿件标题：${info.title}`)
  if (info.pages.length > 1) {
    lines.push(
      `分页：${page.pageNumber} / ${info.pages.length}　投稿时间：${formatDateTime(
        new Date(page.ctime * 1000),
      )}　标题：${page.title}`,
    )
  }
  lines.push(
    `尺寸：${page.dimension.width}x${page.dimension.height}　时长：${formatDuration(
      page.duration,
    )}`,
    `UP主：${info.up.name} (UID ${info.up.uid})　发布时间：${formatDateTime(
      new Date(info.pubdate * 1000),
    )}`,
  )
  return lines
}

export async function createSnapshotGrid(vid: number | string, cid?: number) {
  const options = getOptions()
  const [snapshot, header] = await Promise.all([
    VideoSnapshot.byAidOrBvid(vid, cid).fetchInfo(),
    options.showInfoHeader ? getVideoInfoText(vid, cid) : null,
  ])

  return snapshot.createGrid(options.gridColumns, options.gridRows, {
    header,
    footer: [getFooterText()],
    timestamp: true,
    backgroundColor: options.gridBackgroundColor,
    textColor: options.textColor,
    fontSize: options.textSize,
    fontFamily: options.textFont,
    paddingX: options.gridGap,
    paddingY: options.gridGap,
    marginX: options.gridBorder,
    marginY: options.gridBorder,
    minTileWidth: options.enlargeSmallImage ? 480 : -1,
  })
}

async function toBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('[VideoSnapshot] 创建视频快照图 Blob 失败'))
      } else {
        resolve(blob)
      }
    }, 'image/jpeg')
  })
}

export async function generateDownloadAssets(infos: DownloadVideoInfo[], toast: Toast) {
  let count = 0
  const results = await Promise.allSettled(
    infos.map(async ({ input }) => {
      count++
      toast.message = `生成视频快照中... (${count}/${infos.length})`
      return {
        name: `${input.title}_snapshot.jpg`,
        data: await createSnapshotGrid(parseInt(input.aid), parseInt(input.cid)).then(toBlob),
      }
    }),
  )
  const success = results.filter(
    x => x.status === 'fulfilled',
  ) as PromiseFulfilledResult<PackageEntry>[]
  const fail = results.filter(x => x.status === 'rejected')
  toast.message = `生成视频快照完成。成功 ${success.length} 个, 失败 ${fail.length} 个。`
  if (fail.length > 0) {
    toast.type = ToastType.Error
    toast.clearDuration()
  } else {
    toast.type = ToastType.Success
    toast.duration = 1000
  }
  return success.map(x => x.value)
}
