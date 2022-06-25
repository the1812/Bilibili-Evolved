import { FeatureBase } from '@/components/types'

interface ResultInstance {
  readonly isOk: <X extends FeatureBase>(
    this: LoadFeatureCodeResult<X>
  ) => this is LoadFeatureCodeResultOk<X>

  readonly isError: (
    this: LoadFeatureCodeResult<FeatureBase>
  ) => this is LoadFeatureCodeResultError

  readonly isNoExport: (
    this: LoadFeatureCodeResult<FeatureBase>
  ) => this is LoadFeatureCodeResultNoExport

  readonly isCodeThrew: (
    this: LoadFeatureCodeResult<FeatureBase>
  ) => this is LoadFeatureCodeResultCodeThrew
}

/**
 * 成功从代码中获取 feature
 *
 * @namespace
 * @property feature 从代码中获取的导出值
 */
interface LoadFeatureCodeResultOk<X extends FeatureBase> extends ResultInstance {
  readonly tag: 'Ok',
  readonly feature: X,
}

/** 代码没有导出任何值 */
interface LoadFeatureCodeResultNoExport extends ResultInstance {
  readonly tag: 'NoExport',
}

/**
 * 执行代码过程中产生了抛出值。
 *
 * @namespace
 * @property thrown 抛出的值
 */
interface LoadFeatureCodeResultCodeThrew extends ResultInstance {
  readonly tag: 'CodeThrew',
  readonly thrown: unknown,
}

type LoadFeatureCodeResultError =
  LoadFeatureCodeResultNoExport
  | LoadFeatureCodeResultCodeThrew
type LoadFeatureCodeResult<X extends FeatureBase> =
  LoadFeatureCodeResultOk<X>
  | LoadFeatureCodeResultError

const resultProto: ResultInstance = {
  isOk() { return this.tag === 'Ok' },
  isError() { return this.tag !== 'Ok' },
  isNoExport() { return this.tag === 'NoExport' },
  isCodeThrew() { return this.tag === 'CodeThrew' },
}

const okResult = <X extends FeatureBase>(feature: X): LoadFeatureCodeResultOk<X> => lodash.create(
  resultProto,
  {
    tag: 'Ok' as const,
    feature,
  },
)

const noExportResult = lodash.create(resultProto, {
  tag: 'NoExport' as const,
})

const codeThrewResult = (thrown: unknown): LoadFeatureCodeResultCodeThrew => lodash.create(
  resultProto,
  {
    tag: 'CodeThrew' as const,
    thrown,
  },
)

/**
 * 加载组件或插件的代码字符串，获取其导出 feature
 *
 * @param code 代码字符串
 * @returns 一个不会失败的 `Promise`，其结果值为 {@link LoadFeatureCodeResult}
 */
const loadFeatureCode = async <X extends FeatureBase>(
  code: string,
): Promise<LoadFeatureCodeResult<X>> => {
  // 收集代码导出值
  const exports = {}
  let result: X
  try {
    result = eval(code)
  } catch (thrown) {
    return codeThrewResult(thrown)
  }
  const values = Object.values(exports)
  if (values.length === 0) {
    if (typeof result === 'object') {
      return okResult(result)
    }
    return noExportResult
  }
  return okResult(values[0] as X)
}

export {
  loadFeatureCode,
  LoadFeatureCodeResult,
  LoadFeatureCodeResultOk,
  LoadFeatureCodeResultError,
  LoadFeatureCodeResultNoExport,
  LoadFeatureCodeResultCodeThrew,
}
