import { Executable } from '@/core/common-types'
import { playerReady } from '@/core/utils'

/**
 * 向视频操作按钮区的 "收藏" 右侧添加元素
 * @param getButton 存在按钮区时, 将调用此函数获取要添加的元素
 * @returns 添加成功时返回添加后的元素, 不成功时返回 null
 */
export const addVideoActionButton = async (getButton: Executable<Element>) => {
  await playerReady()
  const favoriteButton = dq(
    '.video-toolbar .ops .collect, .video-toolbar-v1 .toolbar-left .collect, .video-toolbar-left-item.video-fav',
  ) as HTMLElement
  if (!favoriteButton) {
    return null
  }
  const { hasVideo } = await import('@/core/spin-query')
  await hasVideo()
  const button = await getButton()
  if (favoriteButton.classList.contains('video-fav')) {
    favoriteButton.parentElement.insertAdjacentElement('afterend', button)
  } else {
    favoriteButton.insertAdjacentElement('afterend', button)
  }
  return button
}
