import { PluginMetadata } from '@/plugins/plugin'

export const plugin: PluginMetadata = {
  name: 'i18n.language.japanese',
  displayName: '日语语言包',
  setup: async ({ registerData, addData }) => {
    addData('i18n', (languages: Record<string, string>) => {
      languages['ja-JP'] = '日本語'
    })
    const { map, regex } = await import('./data')
    registerData('i18n.ja-JP', map, regex)
  },
}
