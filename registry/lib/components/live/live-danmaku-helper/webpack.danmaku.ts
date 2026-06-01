import { buildByEntry } from '../../../../webpack/config'

export default () => [
  buildByEntry({
    src: './registry/lib/components/',
    type: 'component',
    entry: './registry/lib/components/live/live-danmaku-helper/index.ts',
  }),
]
