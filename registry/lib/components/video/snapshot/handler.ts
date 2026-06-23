/* eslint-disable no-irregular-whitespace */
import { VideoInfo } from '@/components/video/video-info'
import { VideoSnapshot } from '@/components/video/video-snapshot'
import { getComponentSettings } from '@/core/settings'
import { formatDateTime, formatDuration } from '@/core/utils/formatters'
import { showImage } from '@/ui'
import { componentName } from '.'
import { Options } from './options'

function getOptions() {
  return getComponentSettings<Options>(componentName).options
}

export async function viewSnapshotGrid(aid: string, cid: number) {
  const options = getOptions()

  const snapshot = await VideoSnapshot.byAid(aid, cid).fetchInfo(true)

  const infoLines: string[] = []
  if (options.gridInfoHeader) {
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

  const canvas = await snapshot.createGrid(options.gridColumns, options.gridRows, {
    header: infoLines,
    footer: true,
    timestamp: true,
    backgroundColor: options.gridBackgroundColor,
    textColor: options.gridtextColor,
  })
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      const blobURL = URL.createObjectURL(blob)
      showImage(blobURL).then(resolve).catch(reject)
    }, 'image/jpeg')
  })
}
