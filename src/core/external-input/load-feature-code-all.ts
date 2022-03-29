import {
  loadFeatureCode,
  LoadFeatureCodeError,
  LoadFeatureCodeResult,
  LoadFeatureCodeResultOk,
} from '@/core/external-input/load-feature-code'
import { FeatureBase } from '@/components/types'

// ========== result type definitions ==========

class LoadFeatureCodeAllResultConstructor<X extends FeatureBase> {
  isOk(): this is LoadFeatureCodeAllResultOk<X> {
    return this instanceof LoadFeatureCodeAllResultOk
  }

  isError(): this is LoadFeatureCodeAllError {
    return !this.isOk()
  }

  isNoExport(): this is LoadFeatureCodeAllResultNoExport {
    return this instanceof LoadFeatureCodeAllResultNoExport
  }

  isCodeThrew(): this is LoadFeatureCodeAllResultCodeThrew {
    return this instanceof LoadFeatureCodeAllResultCodeThrew
  }

  tryGetFeatures(): X[] | undefined {
    if (this.isOk()) {
      return this.features
    }
    return undefined
  }
}

/**
 * 成活从代码中获取 features
 *
 * @member features 从代码中获取的导出值
 */
export class LoadFeatureCodeAllResultOk<X extends FeatureBase> extends LoadFeatureCodeAllResultConstructor<X> {
  constructor(public readonly features: X[]) {
    super()
  }
}

/**
 * 代码没有导出任何值
 *
 * @member index 出错代码对应的代码数组下标
 */
export class LoadFeatureCodeAllResultNoExport extends LoadFeatureCodeAllResultConstructor<never> {
  constructor(public readonly index: number) {
    super()
  }
}

/**
 * 执行代码过程中产生了抛出值。
 *
 * @member index 出错代码对应的代码数组索引
 * @member thrown 抛出的值
 */
export class LoadFeatureCodeAllResultCodeThrew extends LoadFeatureCodeAllResultConstructor<never> {
  constructor(public readonly index: number, public readonly thrown: unknown) {
    super()
  }
}

export type LoadFeatureCodeAllError =
  LoadFeatureCodeAllResultNoExport
  | LoadFeatureCodeAllResultCodeThrew
export type LoadFeatureCodeAllResult<X extends FeatureBase> =
  LoadFeatureCodeAllResultOk<X>
  | LoadFeatureCodeAllError

// ========== internal definitions ==========

type Task<Ok, Err = never> = Promise<Ok>

type LdRes<X> = LoadFeatureCodeResult<X>
type LdOk<X> = LoadFeatureCodeResultOk<X>
type LdErr = LoadFeatureCodeError

type LdAllRes<X> = LoadFeatureCodeAllResult<X>
type LdAllOk<X> = LoadFeatureCodeAllResultOk<X>
type LdAllErr = LoadFeatureCodeAllError

type LoadCodesTask<X> = Task<LdOk<X>[], [number, LdErr]>

const LdCodeThrew = LoadFeatureCodeAllResultCodeThrew
const LdAllOk = LoadFeatureCodeAllResultOk
const LdAllNoExport = LoadFeatureCodeAllResultNoExport
const LdAllCodeThrew = LoadFeatureCodeAllResultCodeThrew

// covert `Task<LdRes<X>>` to `Task<LdOk<X>, LdErr>`
const rejectErrorResult = <X>(t: Task<LdRes<X>>): Task<LdOk<X>, LdErr> => (
  t.then(r => r.isOk() ? r : Promise.reject(r))
)

// load feature code, and return `Task<LdOk<X>, LdErr>`
const loadCode = <X>(code: string): Task<LdOk<X>, LdErr> => (
  rejectErrorResult(loadFeatureCode(code))
)

// covert `Task`'s `Err` type from `T` to `[number, T]`
const addIndexToRejected = <N extends number, O, E>(t: Task<O, E>, i: N): Task<O, [N, E]> => (
  t.catch(e => Promise.reject([i, e]))
)

// create `LdAllOk` from an array of `LdOk`
const createOkResult = <X>(arr: LdOk<X>[]): LdAllOk<X> => (
  new LdAllOk(arr.map(r => r.feature))
)

// create `LdAllErr` from `[number, LdErr]`
const createErrResult = (t: [number, LdErr]): LdAllErr => (
  t[1] instanceof LdCodeThrew
    ? new LdAllCodeThrew(t[0], t[1].thrown)
    : new LdAllNoExport(t[0])
)

// load all feature codes, and return `LoadCodesTask`
const loadCodes = <X>(codes: string[]): LoadCodesTask<X> => lodash(codes)
  .map<Task<LdOk<X>, LdErr>>(loadCode)
  .map(addIndexToRejected)
  .thru<LoadCodesTask<X>>(arr => Promise.all(arr))
  .value()

// create a `LdAllRes` wrapped by `Task`
const createTaskResult = <X>(t: LoadCodesTask<X>): Task<LdAllRes<X>> => t
  .then(createOkResult)
  .catch(createErrResult)

// ========== paramount function to export ==========

/**
 * 批量加载组件或插件的代码字符串，获取其导出 feature
 *
 * 只要有一个代码出现了错误，则返回错误。
 *
 * @param codes 代码字符串数组
 * @returns 一个不会失败的 `Promise`，其结果值为 `LoadFeatureCodeAllResult`
 */
export const loadFeatureCodeAll = <X>(codes: string[]): Promise<LoadFeatureCodeAllResult<X>> => lodash(codes)
  .thru<LoadCodesTask<X>>(loadCodes)
  .thru(createTaskResult)
  .value()
