import { ref } from 'vue'
import { CommentImageData } from './types'

export const commentImageList = ref<CommentImageData[]>([])
export const panelVisible = ref(false)
const existingIds = new Set<string>()

export const setCommentImages = (images: CommentImageData[]) => {
  commentImageList.value = images
  existingIds.clear()
  images.forEach(img => existingIds.add(img.commentId))
}

export const addCommentImages = (images: CommentImageData[]) => {
  const newImages = images.filter(img => !existingIds.has(img.commentId))
  newImages.forEach(img => existingIds.add(img.commentId))
  commentImageList.value = [...commentImageList.value, ...newImages]
}

export const clearCommentImages = () => {
  commentImageList.value = []
  existingIds.clear()
}
