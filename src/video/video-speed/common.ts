export const minValue = 0.0625
export const maxValue = 16
export const stepValue = 0.5
export const errorMessageDuration = 2000

export const calcOrder = (value: number) => {
  return ((maxValue - value) * 10000).toString()
}
