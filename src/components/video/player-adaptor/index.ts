import { bpxPlayerPolyfill } from './bpx'
import { v2PlayerPolyfill } from './v2'
import { v3PlayerPolyfill } from './v3'
import { v4PlayerPolyfill } from './v4'

export const playerPolyfill = lodash.once(() =>
  Promise.allSettled([
    bpxPlayerPolyfill(),
    v2PlayerPolyfill(),
    v3PlayerPolyfill(),
    v4PlayerPolyfill(),
  ]),
)

export * from './events'
