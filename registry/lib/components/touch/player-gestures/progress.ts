/**
 * 设置视频的进度
 * @param video 视频元素
 * @param progress 目标进度
 */
export const setProgress = (video: HTMLVideoElement, progress: number) => {
  let p = progress
  if (p > video.duration) {
    p = video.duration
  } else if (p < 0) {
    p = 0
  }
  unsafeWindow.player.seek(p, video.paused)
}
