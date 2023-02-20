/* eslint-disable no-bitwise */

export interface BisectNext<O> {
  low: number
  high: number
  mid: number
  slice: O[]
  rouge: number
}

export interface BisectReturn<O> extends BisectNext<O> {
  target: O
}

export interface InitialState {
  low?: number
  high?: number
}

export function* bisectLeft<O>(
  data: readonly O[],
  initialState?: InitialState,
): Generator<BisectNext<O>, BisectReturn<O>> {
  let low = initialState?.low ?? 0
  let high = initialState?.high ?? data.length
  let mid: number

  while (low + 1 < high) {
    mid = (low + high) >>> 1

    const seeingBad = yield {
      low,
      high,
      mid,
      slice: data.slice(low, mid),
      rouge: Math.trunc(Math.log2(high - low)),
    }

    if (seeingBad) {
      high = mid
    } else {
      low = mid
    }
  }

  return {
    low,
    high,
    mid,
    slice: data.slice(low, mid),
    rouge: Math.trunc(Math.log2(high - low)),
    target: data[low],
  }
}

export function* bisectRight<O>(
  data: readonly O[],
  initialState?: InitialState,
): Generator<BisectNext<O>, BisectReturn<O>> {
  let low = initialState?.low ?? 0
  let high = initialState?.high ?? data.length
  let mid = (low + high) >>> 1

  while (low + 1 < high) {
    mid = (low + high) >>> 1

    const seeingBad = yield {
      low,
      high,
      mid,
      slice: data.slice(mid, high),
      rouge: Math.trunc(Math.log2(high - low)),
    }

    if (seeingBad) {
      low = mid
    } else {
      high = mid
    }
  }

  return {
    low,
    high,
    mid,
    slice: data.slice(low, mid),
    rouge: Math.trunc(Math.log2(high - low)),
    target: data[low],
  }
}

export const bisect = bisectLeft
