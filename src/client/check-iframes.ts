const redundantFrames = [
  'https://message.bilibili.com/pages/nav/index_new_sync',
  'https://message.bilibili.com/pages/nav/index_new_pc_sync',
  'https://t.bilibili.com/h5/dynamic/specification',
]
export const checkIframes = () => {
  // TODO: if customNavbar enabled
  if (redundantFrames.includes(document.URL)) {
    console.log(`Skipped <iframe> loading for ${document.URL}`)
    // componentsMap.darkMode.entry()
    return false
  }
  return true
}
