import lodash from 'lodash'
import webpack, { Configuration } from 'webpack'
import { getBanner, getDefaultConfig } from './webpack.config'
import previewMeta from '../src/client/bilibili-evolved.preview.meta.json'

const previewConfig = Object.assign(getDefaultConfig(), {
  entry: './src/client/bilibili-evolved.ts',
  output: {
    filename: 'bilibili-evolved.dev.user.js',
  },
}) as Configuration
previewConfig.plugins.push(
  new webpack.BannerPlugin({
    banner: getBanner({
      ...previewMeta,
      description: 'Bilibili Evolved 本地 AdGuard 兼容修复版 (分块存储与组件调度修复).',
    }),
    raw: true,
    entryOnly: true,
  }),
)

// see src/client/init-vue.ts
lodash.set(previewConfig, 'resolve.alias.vue$', 'vue/dist/vue.runtime.common.prod.js')

export default previewConfig
