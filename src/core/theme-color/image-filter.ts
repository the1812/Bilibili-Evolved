import Color from 'color'

export const makeImageFilter = (from: Color, to: Color) => {
  const hue = to.hue() - from.hue()
  const saturate = ((to.saturationv() - from.saturationv()) / 100 + 1) * 100
  const fixed = (value: number) => Math.round(value * 10) / 10
  const filter = `hue-rotate(${fixed(hue)}deg) saturate(${fixed(saturate)}%)`
  return filter
}
