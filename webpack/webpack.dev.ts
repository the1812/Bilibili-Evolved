import type { Configuration } from 'webpack'
import webpack from 'webpack'

import previewMeta from '../src/client/bilibili-evolved.preview.meta.json'
import { getBanner, getDefaultConfig } from './webpack.config'

const previewConfig = Object.assign(getDefaultConfig(), {
  entry: './src/client/bilibili-evolved.ts',
  output: {
    filename: 'bilibili-evolved.dev.user.js',
  },
}) as Configuration
previewConfig.plugins.push(
  new webpack.BannerPlugin({
    banner: getBanner(previewMeta),
    raw: true,
    entryOnly: true,
  }),
)

// see src/client/init-vue.ts
lodash.set(previewConfig, 'resolve.alias.vue$', 'vue/dist/vue.runtime.common.prod.js')

export default previewConfig
