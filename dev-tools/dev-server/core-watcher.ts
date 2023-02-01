import exitHook from 'async-exit-hook'
import webpack from 'webpack'

import webpackConfig from 'webpack/webpack.dev'
import { defaultWatcherHandler } from './watcher-common'
import { sendMessage } from './web-socket-server'

export const startCoreWatcher = () =>
  new Promise<void>(resolve => {
    const compiler = webpack(webpackConfig as webpack.Configuration)
    console.log('本体编译中...')
    const instance = compiler.watch(
      {},
      defaultWatcherHandler(
        () => resolve(),
        result => {
          console.log('本体已编译:', result.hash)
          sendMessage({
            type: 'coreUpdate',
          })
        },
      ),
    )
    exitHook(exit =>
      instance.close(() => {
        console.log('本体编译器已退出')
        exit()
      }),
    )
  })
