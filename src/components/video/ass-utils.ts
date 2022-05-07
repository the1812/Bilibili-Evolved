const parseHexColor = (hexColor: string) => {
  if (hexColor.startsWith('#')) {
    hexColor = hexColor.substring(1)
  }
  const red = hexColor.substring(0, 2)
  const green = hexColor.substring(2, 4)
  const blue = hexColor.substring(4, 6)
  return {
    red, green, blue,
  }
}
export const convertHexColorForDialogue = (hexColor: string) => {
  const { red, green, blue } = parseHexColor(hexColor)
  return `\\c&H${blue}${green}${red}&`.toUpperCase()
}
export const convertHexColorForStyle = (hexColor: string, opacity = 1) => {
  const { red, green, blue } = parseHexColor(hexColor)
  const hexOpacity = Math.round(255 * (1 - opacity)).toString(16).padStart(2, '0')
  return `&H${hexOpacity}${blue}${green}${red}`.toUpperCase()
}
const round = (number: number) => {
  const [integer, decimal = '00'] = String(number).split('.')
  return `${integer.padStart(2, '0')}.${decimal.substring(0, 2).padEnd(2, '0')}`
}
const secondsToTime = (seconds: number) => {
  let hours = 0
  let minutes = 0
  while (seconds >= 60) {
    seconds -= 60
    minutes++
  }
  while (minutes >= 60) {
    minutes -= 60
    hours++
  }
  return `${hours}:${String(minutes).padStart(2, '0')}:${round(seconds)}`
}
export const convertTimeByDuration = (startTime: number, duration: number) => (
  [secondsToTime(startTime), secondsToTime(startTime + duration)]
)
export const convertTimeByEndTime = (startTime: number, endTime: number) => (
  [secondsToTime(startTime), secondsToTime(endTime)]
)
export const normalizeContent = (content: string) => {
  const map = {
    '{': '｛',
    '}': '｝',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '\n': '\\N',
  }
  for (const [key, value] of Object.entries(map)) {
    content = content.replace(new RegExp(key, 'g'), value)
  }
  return content
}
