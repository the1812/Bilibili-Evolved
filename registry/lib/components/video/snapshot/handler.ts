/* eslint-disable no-irregular-whitespace */
import { VideoInfo } from '@/components/video/video-info'
import { VideoSnapshot } from '@/components/video/video-snapshot'
import { PackageEntry } from '@/core/download'
import { meta } from '@/core/meta'
import { getComponentSettings } from '@/core/settings'
import { Toast, ToastType } from '@/core/toast'
import { formatDateTime, formatDuration } from '@/core/utils/formatters'
import { getFriendlyTitle } from '@/core/utils/title'
import { showImage } from '@/ui'
import { componentName } from '.'
import { DownloadVideoInfo } from '../download/types'
import { Options } from './options'

function getOptions() {
  return getComponentSettings<Options>(componentName).options
}

async function createSnapshotGrid(aid: string, cid: number) {
  const options = getOptions()

  const snapshot = await VideoSnapshot.byAid(aid, cid).fetchInfo()

  const infoLines: string[] = []
  if (options.showInfoHeader) {
    const info = await new VideoInfo(aid).fetchInfo()
    const page = info.pages.find(p => p.cid === cid)
    infoLines.push(`${info.bvid}　AV${info.aid}　CID ${page.cid}`, `稿件标题：${info.title}`)
    if (info.pages.length > 1) {
      infoLines.push(
        `分页：${page.pageNumber} / ${info.pages.length}　投稿时间：${formatDateTime(
          new Date(page.ctime * 1000),
        )}　标题：${page.title}`,
      )
    }
    infoLines.push(
      `尺寸：${page.dimension.width}x${page.dimension.height}　时长：${formatDuration(
        page.duration,
      )}`,
      `UP主：${info.up.name} (UID ${info.up.uid})　发布时间：${formatDateTime(
        new Date(info.pubdate * 1000),
      )}`,
    )
  }

  const gridCanvas = await snapshot.createGrid(options.gridColumns, options.gridRows, {
    header: infoLines,
    footer: [`${formatDateTime(new Date())} @ Bilibili-Evolved v${meta.compilationInfo.version}`],
    timestamp: true,
    backgroundColor: options.gridBackgroundColor,
    textColor: options.textColor,
    fontSize: options.textSize,
    fontFamily: options.textFont,
    paddingX: options.gridGap,
    paddingY: options.gridGap,
    marginX: options.gridBorder,
    marginY: options.gridBorder,
  })

  return gridCanvas
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

export async function view(aid: string, cid: number) {
  return createSnapshotGrid(aid, cid)
    .then(toBlob)
    .then(blob => showImage(URL.createObjectURL(blob), `${getFriendlyTitle(true)}_snapshot.jpg`))
}

export async function generateDownloadAssets(infos: DownloadVideoInfo[], toast: Toast) {
  let count = 0
  const results = await Promise.allSettled(
    infos.map(async ({ input }) => {
      count++
      toast.message = `生成视频快照中... (${count}/${infos.length})`
      return {
        name: `${input.title}_snapshot.jpg`,
        data: await createSnapshotGrid(input.aid, parseInt(input.cid)).then(toBlob),
      }
    }),
  )
  const success = results.filter(x => x.status === 'fulfilled')
  const fail = results.filter(x => x.status === 'rejected')
  toast.message = `生成视频快照完成。成功 ${success.length} 个, 失败 ${fail.length} 个。`
  if (fail.length > 0) {
    toast.type = ToastType.Error
    toast.clearDuration()
  } else {
    toast.type = ToastType.Success
    toast.duration = 1000
  }
  return success.map(x => <PackageEntry>x.value)
}
