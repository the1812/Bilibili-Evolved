import { pickFile } from '@/core/file-picker'

export * from './load-feature-code'

/** 外部输入包装类型, 详见`parseExternalInput`的文档 */
export type ExternalInput<T> = undefined | string | T
// const arrayReturn = <InputType extends any[], OutputType>(
//   func: (...args: InputType) => Promise<OutputType>,
// ) => async (...args: InputType) => {
//     const returnValue = await func(...args)
//     if (returnValue === null) {
//       return null
//     }
//     if (Array.isArray(returnValue)) {
//       return returnValue as OutputType[]
//     }
//     return [returnValue]
//   }

export const parseExternalInput = async <T>(input: ExternalInput<T>): Promise<T> => {
  if (typeof input === 'undefined') {
    const files = await pickFile({ accept: 'application/json' })
    if (files.length > 0) {
      const [file] = files
      const text = await file.text()
      try {
        return eval(`(${text})`) as T
      } catch (error) {
        console.error(error)
        return null
      }
    } else {
      console.error('[parseExternalInput] No file selected')
      return null
    }
  } else if (typeof input === 'string') {
    try {
      /** eval magic variable */
      const exports = {}
      const result = eval(input) as T
      // console.log(exports)
      if (Object.values(exports).length > 0) {
        const value = Object.values(exports)[0]
        // if (typeof value === 'function') {
        //   const { coreApis } = await import('@/core/core-apis')
        //   return value(coreApis) as T
        // }
        return value as T
      }
      return result
    } catch (error) {
      console.error(error)
      return null
    }
  } else {
    return input
  }
}
