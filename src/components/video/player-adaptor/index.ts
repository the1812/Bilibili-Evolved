import { bpxPlayerPolyfill } from './bpx'
import { v2PlayerPolyfill } from './v2'
import { v3PlayerPolyfill } from './v3'

export const playerPolyfill = lodash.once(() =>
  Promise.allSettled([bpxPlayerPolyfill(), v2PlayerPolyfill(), v3PlayerPolyfill()]),
)

export * from './events'
