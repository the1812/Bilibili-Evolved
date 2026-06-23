import { VideoSnapshot } from '@/components/video/video-snapshot'
import { showImage } from '@/ui'

export async function viewSnapshotGrid(aid: string, cid: number) {
  const snapshot = await VideoSnapshot.byAid(aid, cid).fetchInfo(true)
  const canvas = await snapshot.createGridWithInfo(5, 6)
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      const blobURL = URL.createObjectURL(blob)
      showImage(blobURL).then(resolve).catch(reject)
    }, 'image/jpeg')
  })
}
