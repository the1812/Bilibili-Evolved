/* eslint-disable no-bitwise */

export interface BisectNext<O> {
  low: number
  high: number
  mid: number
  slice: O[]
  rouge: number
}

export interface InitialState {
  low?: number
  high?: number
}

export function* bisectLeft<O>(data: readonly O[], initialState?: InitialState) {
  let low = initialState?.low ?? 0
  let high = initialState?.high ?? data.length
  let mid = (low + high) >>> 1

  while (true) {
    const seeingBad = yield ({
      low,
      high,
      mid,
      slice: data.slice(low, mid),
      rouge: ~~Math.log2(high - low),
    } as BisectNext<O>) || false

    if (seeingBad) {
      high = mid
    } else {
      low = mid
    }
    if (low + 1 < high) {
      mid = (low + high) >>> 1
    } else {
      return data[low]
    }
  }
}

export function* bisectRight<O>(data: readonly O[], initialState?: InitialState) {
  let low = initialState?.low ?? 0
  let high = initialState?.high ?? data.length
  let mid = (low + high) >>> 1

  while (true) {
    const seeingBad = yield ({
      low,
      high,
      mid,
      slice: data.slice(mid, high),
      rouge: ~~Math.log2(high - low),
    } as BisectNext<O>) || false

    if (seeingBad) {
      low = mid
    } else {
      high = mid
    }
    if (low + 1 < high) {
      mid = (low + high) >>> 1
    } else {
      return data[low]
    }
  }
}

export const bisect = bisectLeft
