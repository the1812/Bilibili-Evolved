import { getData, registerAndGetData } from '@/plugins/data'

export const trimLeadingDot = (selector: string) =>
  selector
    .split(',')
    .map(cls => cls.trim().replace(/^\./, ''))
    .join(',')
export const splitToSpace = (selector: string) => selector.split(',').join(' ')
export const convertToXPath = (selector: string, join = 'or') =>
  selector
    .split(',')
    .map(trimLeadingDot)
    .flat()
    .map(part => `contains(@class, "${part}")`)
    .join(` ${join} `)

export const useShare = <T>(
  key: string,
  defaultFactory?: () => T,
): [T | undefined, (value: T) => any] => {
  const setShareValue = shared => {
    registerAndGetData(key, shared)[0] = shared
  }

  const data = getData(key)

  if (data.length) {
    return [data[0], setShareValue]
  }
  if (defaultFactory) {
    const defaultValue = defaultFactory()
    setShareValue(defaultValue)
    return [defaultValue, setShareValue]
  }

  return [undefined, setShareValue]
}

export const formatSpeedText = (speed: number, nameBtnStyle = false) => {
  if (nameBtnStyle && speed === 1) {
    return '倍速'
  }
  return Math.trunc(speed) === speed ? `${speed}.0x` : `${speed}x`
}

export const parseSpeedText = (text: string) => {
  if (text === '倍速') {
    return 1
  }
  const matchResult = /([0-9]*[.]?[0-9]+)x/.exec(text)
  if (matchResult) {
    return parseFloat(matchResult[1])
  }
  throw new Error(`unknown speed text: ${text}`)
}
