import { ComponentMetadata, componentsTags } from '@/components/types'

interface UpdateCheckItem {
  url: string
  lastUpdateCheck: number
  installTime: number
  alwaysUpdate?: boolean
}
export const component: ComponentMetadata = {
  name: 'autoUpdate',
  displayName: '自动更新器',
  description: {
    'zh-CN': '自动检查组件, 插件和样式的更新. (仅限从设置面板中安装的)',
  },
  enabledByDefault: true,
  tags: [componentsTags.utils],
  options: {
    lastUpdateCheck: {
      displayName: '最后检查更新日期',
      defaultValue: 0,
      hidden: true,
    },
    minimumDuration: {
      displayName: '更新间隔 (ms)',
      defaultValue: 1000 * 3600 * 24,
    },
    urls: {
      displayName: '更新链接',
      defaultValue: {
        components: {},
        plugins: {},
        styles: {},
      },
      hidden: true,
    },
  },
  entry: async ({ settings: { options } }) => {
    const { getGeneralSettings, settings } = await import('@/core/settings')
    const now = Number(new Date())
    const duration = now - options.lastUpdateCheck
    const {
      components,
      plugins,
      styles,
    } = options.urls as Record<string, Record<string, UpdateCheckItem>>
    const { devMode } = getGeneralSettings()
    const checkUpdate = async (
      items: Record<string, UpdateCheckItem>,
      existPredicate: (name: string) => boolean,
      installer: (code: string)=> Promise<{ message: string }>,
    ) => {
      // Remove uninstalled items
      Object.keys(items).filter(it => !existPredicate(it)).forEach(key => {
        delete items[key]
      })
      const results = await Promise.allSettled(
        Object.entries(items).map(async ([name, item]) => {
          const { url, lastUpdateCheck, alwaysUpdate } = item
          const isDebugItem = alwaysUpdate && devMode
          if (!isDebugItem && now - lastUpdateCheck <= options.minimumDuration) {
            return `[${name}] 未超过更新间隔期, 已跳过`
          }
          const response: string = await coreApis.ajax.monkey({ url })
          // 需要再检查下是否还安装着, 有可能正好在下载途中被卸载
          if (!(name in items)) {
            return `[${name}] 已被卸载, 取消更新`
          }
          const { message } = await installer(response)
          item.lastUpdateCheck = Number(new Date())
          return `[${name}] ${message}`
        }),
      )
      return results.map((r, index) => {
        if (r.status === 'fulfilled') {
          return r.value
        }
        const message = r.reason?.message ?? r.reason.toString()
        return `[${Object.keys(items)[index]}] ${message}`
      }).join('\n').trim()
    }
    const checkUpdates = async () => {
      const { installComponent } = await import('@/components/user-component')
      console.log('[自动更新器] 开始检查更新')
      console.log(await checkUpdate(
        components,
        name => settings.userComponents[name] !== undefined,
        installComponent,
      ) || '暂无组件更新')
      const { installPlugin } = await import('@/plugins/plugin')
      console.log(await checkUpdate(
        plugins,
        name => settings.userPlugins[name] !== undefined,
        installPlugin,
      ) || '暂无插件更新')
      const { installStyle } = await import('@/plugins/style')
      console.log(await checkUpdate(
        styles,
        name => settings.userStyles[name] !== undefined,
        installStyle,
      ) || '暂无样式更新')
      options.lastUpdateCheck = Number(new Date())
      console.log('[自动更新器] 完成更新检查')
    }

    if (duration >= options.minimumDuration) {
      coreApis.lifeCycle.fullyLoaded(checkUpdates)
    }
    return {
      checkUpdates,
      checkUpdatesAndReload: async () => {
        await checkUpdates()
        window.location.reload()
      },
    }
  },
  plugin: {
    setup: ({ addHook, coreApis: { settings: { getComponentSettings } } }) => {
      const types = ['components', 'plugins', 'styles']
      types.forEach(type => {
        console.log(`user${lodash.startCase(type)}.add`)
        addHook(`user${lodash.startCase(type)}.add`, {
          after: (_, url: string, metadata: { name: string }) => {
            console.log('hook', `user${lodash.startCase(type)}.add`, metadata.name, url)
            const { options } = getComponentSettings('autoUpdate')
            const existingItem = options.urls[type][metadata.name] as UpdateCheckItem
            if (!existingItem) {
              options.urls[type][metadata.name] = {
                url,
                lastUpdateCheck: Number(new Date()),
                installTime: Number(new Date()),
                alwaysUpdate: url.startsWith('http://localhost'),
              } as UpdateCheckItem
            } else {
              existingItem.url = url
              existingItem.lastUpdateCheck = Number(new Date())
              existingItem.alwaysUpdate = url.startsWith('http://localhost')
              // keep install time
            }
          },
        })
        addHook(`user${lodash.startCase(type)}.remove`, {
          after: (metadata: { name: string }) => {
            const { options } = getComponentSettings('autoUpdate')
            if (!options.urls[type][metadata.name]) {
              return
            }
            delete options.urls[type][metadata.name]
          },
        })
      })
    },
  },
}
