import Color from 'color'
import { makeImageFilter } from '@/core/theme-color/image-filter'
import { expect } from 'chai'

describe('Color API', () => {
  it('makeImageFilter', () => {
    const pink = Color({
      r: 251,
      g: 113,
      b: 152,
    }, 'rgb')
    const blue = Color({
      r: 0,
      g: 160,
      b: 213,
    }, 'rgb')
    const theme = Color('#00ACC1', 'hex')
    const pinkFilter = makeImageFilter(pink, theme)
    const blueFilter = makeImageFilter(blue, theme)
    expect(pinkFilter).equal('hue-rotate(-156.5deg) saturate(145%)')
    expect(blueFilter).equal('hue-rotate(-8.4deg) saturate(100%)')
  })
})
