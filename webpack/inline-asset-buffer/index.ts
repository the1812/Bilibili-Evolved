import webpack from 'webpack'

export class InlineAssetBufferPlugin {
  apply(compiler: webpack.Compiler) {
    if (!compiler.options.cache || compiler.options.cache.type !== 'filesystem') {
      return
    }
    compiler.hooks.normalModuleFactory.tap(InlineAssetBufferPlugin.name, factory => {
      factory.hooks.generator.for('asset/inline').tap(InlineAssetBufferPlugin.name, generator => {
        const generate = generator.generate.bind(generator)
        generator.generate = (...args: Parameters<typeof generator.generate>) => {
          const source = generate(...args)
          if (source && source.size() > 100 * 1024) {
            const data = (args[1] as { getData?: () => Map<string, unknown> }).getData?.()
            const url = data?.get('url') as { javascript?: string } | undefined
            delete url?.javascript
            return new webpack.sources.RawSource(source.buffer())
          }
          return source
        }
      })
    })
  }
}
