export const LocalUploadLimit = 1024
export interface ImageItem {
  name: string
  url: string
}
export const getEmptyImage = () => ({
  name: '',
  url: '',
})
export const images: ImageItem[] = []
export const addImage = (item: ImageItem) => {
  if (!item.name || !item.url) {
    return
  }
  const existingItem = images.find(it => it.name === item.name)
  if (existingItem) {
    existingItem.url = item.url
  } else {
    images.unshift(item)
  }
}
export const removeImage = (item: ImageItem | string) => {
  const name = typeof item === 'string' ? item : item.name
  const index = images.findIndex(it => it.name === name)
  if (index !== -1) {
    images.splice(index, 1)
  }
}
