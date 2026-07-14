import { getBlob } from '@/core/ajax'
import { DownloadPackage } from '@/core/download'
import { Toast } from '@/core/toast'
import { CommentImageData } from './types'
import { commentImageList } from './store'

const getExtensionFromUrl = (url: string): string => {
  const cleanUrl = url.replace(/^http:/, 'https:').split('?')[0]
  const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/)
  return match ? `.${match[1]}` : '.jpg'
}

const downloadImages = async (pictures: string[], fileName: string) => {
  const toast = Toast.info('获取图片中...', '评论图片下载')
  const blobs = await Promise.all(
    pictures.map(async (url, index) => {
      const blob = await getBlob(url)
      toast.message = `下载中... (${index + 1}/${pictures.length})`
      return blob
    }),
  )
  const pack = new DownloadPackage()
  blobs.forEach((blob, index) => {
    pack.add(`${fileName} - ${index + 1}${getExtensionFromUrl(pictures[index])}`, blob)
  })
  toast.close()
  await pack.emit(`${fileName}.zip`)
}

export const downloadSingleComment = (data: CommentImageData) => {
  const fileName = `${data.userName} - ${data.userId} - ${data.commentId}`
  downloadImages(data.pictures, fileName)
}

export const downloadAllComments = () => {
  const allPictures: string[] = []
  commentImageList.value.forEach(data => {
    data.pictures.forEach(url => {
      allPictures.push(url)
    })
  })
  if (allPictures.length === 0) {
    return
  }
  downloadImages(allPictures, '评论图片')
}
