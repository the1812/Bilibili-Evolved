import lodash from 'lodash'
import webpack, { Configuration } from 'webpack'
import { getBanner, getDefaultConfig } from './webpack.config'
import previewConfig from './webpack.dev'
import mainMeta from '../src/client/bilibili-evolved.meta.json'

const mainConfig = Object.assign(getDefaultConfig(), {
  mode: 'production',
  entry: './src/client/bilibili-evolved.ts',
  output: {
    filename: 'bilibili-evolved.user.js',
  },
}) as Configuration
mainConfig.plugins.push(
  new webpack.BannerPlugin({
    banner: getBanner(mainMeta),
    raw: true,
    entryOnly: true,
  }),
)

// see src/client/init-vue.ts
lodash.set(mainConfig, 'resolve.alias.vue$', 'vue/dist/vue.runtime.common.prod.js')

previewConfig.output.filename = 'bilibili-evolved.preview.user.js'
previewConfig.mode = 'production'
const targets = [mainConfig, previewConfig].map(config => {
  config.cache = { type: 'memory' }
  config.devtool = false
  return config
})

export default targets
