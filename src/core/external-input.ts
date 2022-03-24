import { pickFile } from './file-picker'

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

/**
 * 加载的代码没有任何导出值
 */
export class NoExportError extends Error {
  constructor() {
    super('No exported value in loaded feature code.')
  }
}

/**
 * 加载的代码有抛出值
 */
export class CodeThrewError extends Error {
  /** 代码抛出的值 */
  public readonly thrown: unknown

  constructor(thrown: unknown) {
    super('Something was thrown when loading feature code.')
    this.thrown = thrown
  }
}

/**
 * 加载组件或插件的代码字符串，获取其导出 feature
 *
 * @param code 代码字符串
 * @returns 一个 `Promise`。
 *
 * 若一切顺利，则 `Promise` 的最终状态为 `fulfilled`，其结果为导出值
 *
 * 若代码执行过程中有任何抛出值，则 `Promise` 的最终状态为 `rejected`，且结果为 `CodeThrewError` 对象
 *
 * 若代码没有任何导出，则 `Promise` 的最终状态为 `rejected`，且结果为 `NoExportError` 对象
 */
export const loadFeatureCode = async <X>(code: string): Promise<X> => {
  // 收集代码导出值
  const exports = {}
  try {
    eval(code)
  } catch (thrown) {
    return Promise.reject(new CodeThrewError(thrown))
  }
  const values = Object.values(exports)
  if (values.length === 0) {
    return Promise.reject(new NoExportError())
  }
  const value = values[0]
  if (typeof value === 'function') {
    const { coreApis } = await import('@/core/core-apis')
    try {
      return value(coreApis)
    } catch (thrown) {
      return Promise.reject(new CodeThrewError(thrown))
    }
  }
  return value as X
}

/**
 * 批量加载组件或插件的代码字符串，获取其导出 feature
 *
 * @param codes 代码字符串数组
 * @returns 一个 `Promise`。
 *
 * 若一切顺利，则 `Promise` 的最终状态为 `fulfilled`，其结果为导出值数组
 *
 * 若有任何代码在执行过程中有抛出值，则 `Promise` 的最终状态为 `rejected`，
 * 其结果类型为 `[number, CodeThrewError]`，其中 `number` 为传入代码的索引，
 *
 * 若存在代码没有任何导出，则 `Promise` 的最终状态为 `rejected`，
 * 其结果类型为 `[number, NoExportError]`，其中 `number` 为传入代码的索引
 */
export const loadFeatureCodeAll = <X>(codes: string[]): Promise<X[]> => {
  const sequence = ([i, p]: [number, Promise<any>]): Promise<any> => p.then(
    lodash.identity,
    rej => [i, rej],
  )
  return lodash
    .chain(codes)
    .map(loadFeatureCode)
    .zipWith(lodash.range(codes.length), (p, i) => [i, p])
    .map(sequence)
    .thru(Promise.all)
    .value() as Promise<X[]>
}

/**
 * 批量加载组件或插件的代码字符串，获取其导出 feature
 *
 * @param codes 代码字符串数组
 * @returns 一个 `Promise`。
 *
 * 无论代码执行是否成功，`Promise` 的完成状态都是 `fulfilled`，其结果为一个
 * `PromiseSettledResult` 数组，数组下标与传入代码的下标对应。
 *
 * 每个 `PromiseSettledResult` 可为以下几种状态之一：
 *
 * - 若代码执行顺利，则其类型为：`{ status: 'fulfilled', value: X }`
 * - 若代码有抛出值，则其类型为：`{ status: 'rejected', reason: CodeThrewError }`
 * - 若代码没有导出值，则其类型为：`{ status: 'rejected', reason: NoExportError }`
 */
export const loadFeatureCodeAllSettled = <X>(
  codes: string[],
): Promise<PromiseSettledResult<X>[]> => lodash
  .chain(codes)
  .map(loadFeatureCode)
  .thru(Promise.allSettled)
  .value() as Promise<PromiseSettledResult<X>[]>
