const redundantFrames = [
  'https://message.bilibili.com/pages/nav/index_new_sync',
  'https://message.bilibili.com/pages/nav/index_new_pc_sync',
  'https://t.bilibili.com/h5/dynamic/specification',
]
export const checkIframes = () => {
  if (redundantFrames.includes(document.URL)) {
    console.log(`Skipped <iframe> loading for ${document.URL}`)
    return false
  }
  return true
}
