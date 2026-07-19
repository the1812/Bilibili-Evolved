import { ref } from 'vue'
import { CommentItem } from '@/components/utils/comment-apis'
import { CommentImageData } from './types'

export const commentImageList = ref<CommentImageData[]>([])
export const panelVisible = ref(false)
const imageMap = new Map<string, CommentImageData>()

export const addCommentImage = (item: CommentItem) => {
  if (!item.pictures?.length) {
    return
  }
  const data: CommentImageData = {
    commentId: item.id,
    userName: item.userName,
    userId: item.userId,
    content: item.content,
    time: item.time,
    pictures: item.pictures.map(url => url.replace(/^http:/, 'https:')),
  }
  imageMap.set(item.id, data)
  commentImageList.value = Array.from(imageMap.values())
}

export const getCommentImageData = (id: string) => imageMap.get(id)

export const clearCommentImages = () => {
  imageMap.clear()
  commentImageList.value = []
}
