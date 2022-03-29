import { FeatureBase } from '@/components/types'

class LoadFeatureCodeResultConstructor<X extends FeatureBase> {
  isOk(): this is LoadFeatureCodeResultOk<X> {
    return this instanceof LoadFeatureCodeResultOk
  }

  isError(): this is LoadFeatureCodeError {
    return !this.isOk()
  }

  isNoExport(): this is LoadFeatureCodeResultNoExport {
    return this instanceof LoadFeatureCodeResultNoExport
  }

  isCodeThrew(): this is LoadFeatureCodeResultCodeThrew {
    return this instanceof LoadFeatureCodeResultCodeThrew
  }

  tryGetFeature(): X | undefined {
    if (this.isOk()) {
      return this.feature
    }
    return undefined
  }
}

/**
 * 成功从代码中获取 feature
 *
 * @member feature 从代码中获取的导出值
 */
export class LoadFeatureCodeResultOk<X extends FeatureBase> extends LoadFeatureCodeResultConstructor<X> {
  constructor(public readonly feature: X) {
    super()
  }
}

/** 代码没有导出任何值 */
export class LoadFeatureCodeResultNoExport extends LoadFeatureCodeResultConstructor<never> {
}

/**
 * 执行代码过程中产生了抛出值。
 *
 * @member {unknown} thrown 抛出的值
 */
export class LoadFeatureCodeResultCodeThrew extends LoadFeatureCodeResultConstructor<never> {
  constructor(public readonly thrown: unknown) {
    super()
  }
}

export type LoadFeatureCodeError = LoadFeatureCodeResultNoExport | LoadFeatureCodeResultCodeThrew
export type LoadFeatureCodeResult<X extends FeatureBase> =
  LoadFeatureCodeResultOk<X>
  | LoadFeatureCodeError

/**
 * 加载组件或插件的代码字符串，获取其导出 feature
 *
 * @param code 代码字符串
 * @returns 一个不会失败的 `Promise`，其结果值为 {@link LoadFeatureCodeResult}
 */
export const loadFeatureCode = async <X extends FeatureBase>(code: string): Promise<LoadFeatureCodeResult<X>> => {
  // 收集代码导出值
  const exports = {}
  try {
    eval(code)
  } catch (thrown) {
    return new LoadFeatureCodeResultCodeThrew(thrown)
  }
  const values = Object.values(exports)
  if (values.length === 0) {
    return new LoadFeatureCodeResultNoExport()
  }
  return new LoadFeatureCodeResultOk(values[0] as X)
}
