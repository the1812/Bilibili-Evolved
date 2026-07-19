import { ref } from 'vue'
import { CommentImageData } from './types'

export const commentImageList = ref<CommentImageData[]>([])
export const panelVisible = ref(false)

export const setCommentImages = (images: CommentImageData[]) => {
  commentImageList.value = images
}
