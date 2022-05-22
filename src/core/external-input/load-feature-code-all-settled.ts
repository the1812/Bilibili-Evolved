import {
  loadFeatureCode, LoadFeatureCodeResult,
} from '@/core/external-input/load-feature-code'

type LdRes<X> = LoadFeatureCodeResult<X>
type SettledRes<T> = PromiseSettledResult<T>
type FilledRes<T> = PromiseFulfilledResult<T>

const unwrapSettledResult = <T>(r: SettledRes<T>): T => (r as FilledRes<T>).value

const mapSettledArray = <T>(arr: SettledRes<T>[]): T[] => (
  arr.map(unwrapSettledResult)
)

const mapSettleResult = <T>(p: Promise<SettledRes<T>[]>): Promise<T[]> => (
  p.then(mapSettledArray)
)

/**
 * 批量加载组件或插件的代码字符串，获取其导出 feature
 *
 * @param codes 代码字符串数组
 * @returns 不会失败的 `Promise`。其结果为一个数组，其中每个元素都是代表代码执行结果的对象
 */
export const loadFeatureCodeAllSettled = <X>(
  codes: string[],
): Promise<LoadFeatureCodeResult<X>[]> => lodash(codes)
    .map<Promise<LdRes<X>>>(loadFeatureCode)
    .thru<Promise<SettledRes<LdRes<X>>[]>>(arr => Promise.allSettled(arr))
    .thru(mapSettleResult)
    .value()
