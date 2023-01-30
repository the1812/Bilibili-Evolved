import Color from 'color'

interface ColorWrapper {
  color: Color
  red: number
  green: number
  blue: number
  hue: number
  saturation: number
  brightness: number
  hex: string
  hueGradient: string
  saturationGradient: string
  brightnessGradient: string
  redGradient: string
  greenGradient: string
  blueGradient: string
  change(prop: string, value: string | number): void
  updateProps(): void
}

export const createColorWrapper = (color: string): ColorWrapper => {
  let internalColor = new Color(color)
  const wrapper: Partial<ColorWrapper> = {
    get color(): Color {
      return internalColor
    },
    set color(newColor: Color) {
      internalColor = newColor
      this.updateProps()
    },
    change(prop: string, value: string | number) {
      if (typeof value === 'string') {
        value = parseFloat(value)
        if (Number.isNaN(value)) {
          return
        }
      }
      this.color = internalColor[prop](value)
    },
    updateProps() {
      this.red = internalColor.red()
      this.green = internalColor.green()
      this.blue = internalColor.blue()
      this.hue = internalColor.hue()
      this.saturation = internalColor.saturationv()
      this.brightness = internalColor.value()
      this.hex = internalColor.hex()
      this.hueGradient = `linear-gradient(to right, ${internalColor.hue(0).hex()}, ${internalColor
        .hue(60)
        .hex()}, ${internalColor.hue(120).hex()}, ${internalColor.hue(180).hex()}, ${internalColor
        .hue(240)
        .hex()}, ${internalColor.hue(300).hex()}, ${internalColor.hue(0).hex()})`
      this.saturationGradient = `linear-gradient(to right, ${internalColor
        .saturationv(0)
        .hex()}, ${internalColor.saturationv(100).hex()})`
      this.brightnessGradient = `linear-gradient(to right, ${internalColor
        .value(0)
        .hex()}, ${internalColor.value(100).hex()})`
      this.redGradient = `linear-gradient(to right, ${internalColor.red(0).hex()}, ${internalColor
        .red(255)
        .hex()})`
      this.greenGradient = `linear-gradient(to right, ${internalColor
        .green(0)
        .hex()}, ${internalColor.green(255).hex()})`
      this.blueGradient = `linear-gradient(to right, ${internalColor.blue(0).hex()}, ${internalColor
        .blue(255)
        .hex()})`
    },
  }
  wrapper.updateProps()
  return wrapper as ColorWrapper
}
