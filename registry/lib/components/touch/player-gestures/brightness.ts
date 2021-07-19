/**
 * 设置视频的亮度(会与从播放器中设置的亮度叠加)
 */
export const setBrightness = (video: HTMLElement, brightness: number) => {
  let b = brightness
  if (b < 0) {
    b = 0
  }

  video.style.filter = `brightness(${b})`
}
