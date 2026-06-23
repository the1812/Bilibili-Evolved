/* eslint-disable no-irregular-whitespace */
import { VideoInfo } from '@/components/video/video-info'
import { VideoSnapshot } from '@/components/video/video-snapshot'
import { formatDateTime, formatDuration } from '@/core/utils/formatters'
import { showImage } from '@/ui'

export async function viewSnapshotGrid(aid: string, cid: number) {
  const snapshot = await VideoSnapshot.byAid(aid, cid).fetchInfo(true)

  const info = await new VideoInfo(aid).fetchInfo()
  const infoLines = []
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
  const canvas = await snapshot.createGrid(5, 6, {
    header: infoLines,
    footer: true,
    timestamp: true,
  })
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      const blobURL = URL.createObjectURL(blob)
      showImage(blobURL).then(resolve).catch(reject)
    }, 'image/jpeg')
  })
}
