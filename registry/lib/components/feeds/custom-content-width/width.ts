export type WidthUnit = 'px' | 'vw'

export interface WidthValue {
  number: number
  unit: WidthUnit
}

/** px 取 B 站原生布局边界, vw 取它们在 2560px 视口下的等效值; px 不留小数, vw 保留 2 位 */
export const widthUnits: Record<
  WidthUnit,
  { min: number; max: number; decimals: number; displayName: string }
> = {
  px: { min: 556, max: 1954, decimals: 0, displayName: '像素 (px)' },
  vw: { min: 22, max: 76, decimals: 2, displayName: '百分比 (vw)' },
}

/** 默认宽度值与旧版百分比模式一致 */
const defaultWidthValue: WidthValue = { number: 50, unit: 'vw' }

export const defaultWidth = `${defaultWidthValue.number}${defaultWidthValue.unit}`

const widthPattern = /^(\d+(?:\.\d+)?)(px|vw)$/

/** 无法解析时按默认值处理 */
export const parseWidth = (value: unknown): WidthValue => {
  const match = widthPattern.exec(typeof value === 'string' ? value.trim() : '')
  return match ? { number: Number(match[1]), unit: match[2] as WidthUnit } : defaultWidthValue
}

/** 无法解析时保留原值, 数值按单位范围收敛到对应精度 */
export const validateWidth = (value: string, oldValue: string) => {
  const match = widthPattern.exec(value.trim())
  if (!match) {
    return oldValue
  }
  const unit = match[2] as WidthUnit
  const { min, max, decimals } = widthUnits[unit]
  return `${lodash.clamp(lodash.round(Number(match[1]), decimals), min, max)}${unit}`
}

/** 换算成另一个单位的等效值, 避免切换单位时数值被新单位的取值范围收敛掉 */
export const convertWidth = ({ number, unit }: WidthValue, target: WidthUnit): WidthValue => {
  if (unit === target) {
    return { number, unit }
  }
  // vw 以视口宽度(含滚动条)为基准
  const viewport = window.innerWidth
  const px = unit === 'px' ? number : (number / 100) * viewport
  return { number: target === 'px' ? px : (px / viewport) * 100, unit: target }
}
