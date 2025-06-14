/**
 * 设置视频的亮度(会与从播放器中设置的亮度叠加)
 */
export const setBrightness = (video: HTMLElement, brightness: number) => {
  let b = brightness
  if (b < 0) {
    b = 0
  } else if (b > 1) {
    b = 1
  }

  video.style.filter = `brightness(${b})`
}
