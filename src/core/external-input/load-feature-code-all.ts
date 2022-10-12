import {
  loadFeatureCode,
  LoadFeatureCodeResult,
  LoadFeatureCodeResultError,
  LoadFeatureCodeResultOk,
} from '@/core/external-input/load-feature-code'
import { FeatureBase } from '@/components/types'

interface ResultInstance {
  readonly isOk: <X extends FeatureBase>(
    this: LoadFeatureCodeAllResult<X>,
  ) => this is LoadFeatureCodeAllResultOk<X>

  readonly isError: (
    this: LoadFeatureCodeAllResult<FeatureBase>,
  ) => this is LoadFeatureCodeAllResultError

  readonly isNoExport: (
    this: LoadFeatureCodeAllResult<FeatureBase>,
  ) => this is LoadFeatureCodeAllResultNoExport

  readonly isCodeThrew: (
    this: LoadFeatureCodeAllResult<FeatureBase>,
  ) => this is LoadFeatureCodeAllResultCodeThrew
}

/**
 * 成功从代码中获取 features
 *
 * @namespace
 * @property features 从代码中获取的导出值
 */
interface LoadFeatureCodeAllResultOk<X extends FeatureBase> extends ResultInstance {
  readonly tag: 'Ok'
  readonly features: X[]
}

/** 代码没有导出任何值 */
interface LoadFeatureCodeAllResultNoExport extends ResultInstance {
  readonly tag: 'NoExport'
}

/**
 * 执行代码过程中产生了抛出值。
 *
 * @namespace
 * @property thrown 抛出的值
 */
interface LoadFeatureCodeAllResultCodeThrew extends ResultInstance {
  readonly tag: 'CodeThrew'
  readonly thrown: unknown
}

type LoadFeatureCodeAllResultError =
  | LoadFeatureCodeAllResultNoExport
  | LoadFeatureCodeAllResultCodeThrew
type LoadFeatureCodeAllResult<X extends FeatureBase> =
  | LoadFeatureCodeAllResultOk<X>
  | LoadFeatureCodeAllResultError

const resultProto: ResultInstance = {
  isOk() {
    return this.tag === 'Ok'
  },
  isError() {
    return this.tag !== 'Ok'
  },
  isNoExport() {
    return this.tag === 'NoExport'
  },
  isCodeThrew() {
    return this.tag === 'CodeThrew'
  },
}

const okResult = <X extends FeatureBase>(features: X[]): LoadFeatureCodeAllResultOk<X> =>
  lodash.create(resultProto, {
    tag: 'Ok' as const,
    features,
  })

const noExportResult = lodash.create(resultProto, {
  tag: 'NoExport' as const,
})

const codeThrewResult = (thrown: unknown): LoadFeatureCodeAllResultCodeThrew =>
  lodash.create(resultProto, {
    tag: 'CodeThrew' as const,
    thrown,
  })

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Task<Ok, Err = never> = Promise<Ok>

type LdRes<X> = LoadFeatureCodeResult<X>
type LdOk<X> = LoadFeatureCodeResultOk<X>
type LdErr = LoadFeatureCodeResultError

type LdAllRes<X> = LoadFeatureCodeAllResult<X>
type LdAllOk<X> = LoadFeatureCodeAllResultOk<X>
type LdAllErr = LoadFeatureCodeAllResultError

type LoadCodesTask<X> = Task<LdOk<X>[], [number, LdErr]>

// covert `Task<LdRes<X>>` to `Task<LdOk<X>, LdErr>`
const rejectErrorResult = <X>(t: Task<LdRes<X>>): Task<LdOk<X>, LdErr> =>
  t.then(r => (r.isOk() ? r : Promise.reject(r)))

// load feature code, and return `Task<LdOk<X>, LdErr>`
const loadCode = <X>(code: string): Task<LdOk<X>, LdErr> => rejectErrorResult(loadFeatureCode(code))

// covert `Task`'s `Err` type from `T` to `[number, T]`
const addIndexToRejected = <N extends number, O, E>(
  t: Task<O, E>,
  i: N,
  // eslint-disable-next-line prefer-promise-reject-errors
): Task<O, [N, E]> => t.catch(e => Promise.reject([i, e]))

// create `LdAllOk` from an array of `LdOk`
const createOkResult = <X>(arr: LdOk<X>[]): LdAllOk<X> => okResult(arr.map(r => r.feature))

// create `LdAllErr` from `[number, LdErr]`
const createErrResult = (t: [number, LdErr]): LdAllErr =>
  t[1].isCodeThrew() ? codeThrewResult(t[1].thrown) : noExportResult

// load all feature codes, and return `LoadCodesTask`
const loadCodes = <X>(codes: string[]): LoadCodesTask<X> =>
  lodash(codes)
    .map<Task<LdOk<X>, LdErr>>(loadCode)
    .map(addIndexToRejected)
    .thru<LoadCodesTask<X>>(arr => Promise.all(arr))
    .value()

// create a `LdAllRes` wrapped by `Task`
const createTaskResult = <X>(t: LoadCodesTask<X>): Task<LdAllRes<X>> =>
  t.then(createOkResult).catch(createErrResult)

/**
 * 批量加载组件或插件的代码字符串，获取其导出 feature
 *
 * 只要有一个代码出现了错误，则返回错误。
 *
 * @param codes 代码字符串数组
 * @returns 一个不会失败的 `Promise`，其结果值为 `LoadFeatureCodeAllResult`
 */
const loadFeatureCodeAll = <X>(codes: string[]): Promise<LoadFeatureCodeAllResult<X>> =>
  lodash(codes).thru<LoadCodesTask<X>>(loadCodes).thru(createTaskResult).value()

export {
  loadFeatureCodeAll,
  LoadFeatureCodeAllResult,
  LoadFeatureCodeAllResultOk,
  LoadFeatureCodeAllResultError,
  LoadFeatureCodeAllResultNoExport,
  LoadFeatureCodeAllResultCodeThrew,
}
