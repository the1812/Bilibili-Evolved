export class ColorProcessor {
  constructor (hex) {
    this.hex = hex
  }
  get rgb () {
    return this.hexToRgb(this.hex)
  }
  get rgba () {
    return this.hexToRgba(this.hex)
  }
  getHexRegex (alpha, shorthand) {
    const repeat = shorthand ? '' : '{2}'
    const part = `([a-f\\d]${repeat})`
    const count = alpha ? 4 : 3
    const pattern = `#?${part.repeat(count)}`
    return new RegExp(pattern, 'ig')
  }
  hexToRgbOrRgba (hex, alpha) {
    const isShortHand = hex.length < 6
    if (isShortHand) {
      const shorthandRegex = this.getHexRegex(alpha, true)
      hex = hex.replace(shorthandRegex, function (...args) {
        let result = ''
        let i = 1
        while (args[i]) {
          result += args[i].repeat(2)
          i++
        }
        return result
      })
    }

    const regex = this.getHexRegex(alpha, false)
    const regexResult = regex.exec(hex)
    if (regexResult) {
      const color = {
        r: parseInt(regexResult[1], 16),
        g: parseInt(regexResult[2], 16),
        b: parseInt(regexResult[3], 16)
      }
      if (regexResult[4]) {
        color.a = parseInt(regexResult[4], 16) / 255
      }
      return color
    } else if (alpha) {
      const rgb = this.hexToRgbOrRgba(hex, false)
      if (rgb) {
        rgb.a = 1
        return rgb
      }
    }
    return null
  }
  hexToRgb (hex) {
    return this.hexToRgbOrRgba(hex, false)
  }
  hexToRgba (hex) {
    return this.hexToRgbOrRgba(hex, true)
  }
  rgbToString (color) {
    if (color.a) {
      return `rgba(${color.r},${color.g},${color.b},${color.a})`
    }
    return `rgb(${color.r},${color.g},${color.b})`
  }
  rgbToHsb (rgb) {
    const { r, g, b } = rgb
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    const s = Math.round((max === 0 ? 0 : delta / max) * 100)
    const v = Math.round(max / 255 * 100)

    let h
    if (delta === 0) {
      h = 0
    } else if (r === max) {
      h = (g - b) / delta % 6
    } else if (g === max) {
      h = (b - r) / delta + 2
    } else if (b === max) {
      h = (r - g) / delta + 4
    }
    h = Math.round(h * 60)
    if (h < 0) {
      h += 360
    }

    return { h: h, s: s, b: v }
  }
  get hsb () {
    return this.rgbToHsb(this.rgb)
  }
  get grey () {
    const color = this.rgb
    return 1 - (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255
  }
  get foreground () {
    const color = this.rgb
    if (color && this.grey < 0.35) {
      return '#000'
    }
    return '#fff'
  }
  makeImageFilter (originalRgb) {
    const { h, s } = this.rgbToHsb(originalRgb)
    const targetColor = this.hsb

    const hue = targetColor.h - h
    const saturate = ((targetColor.s - s) / 100 + 1) * 100
    // const brightness = ((targetColor.b - b) / 100 + 1) * 100;
    const filter = `hue-rotate(${hue}deg) saturate(${saturate}%)`
    return filter
  }
  get blueImageFilter () {
    const blueColor = {
      r: 0,
      g: 160,
      b: 213
    }
    return this.makeImageFilter(blueColor)
  }
  get pinkImageFilter () {
    const pinkColor = {
      r: 251,
      g: 113,
      b: 152
    }
    return this.makeImageFilter(pinkColor)
  }
  get brightness () {
    return `${this.foreground === '#000' ? '100' : '0'}%`
  }
  get filterInvert () {
    return this.foreground === '#000' ? 'invert(0)' : 'invert(1)'
  }
}
