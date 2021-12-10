import { PluginMetadata } from '@/plugins/plugin'

export const plugin: PluginMetadata = {
  name: 'i18n.language.english',
  displayName: '英语语言包',
  setup: async ({ registerData, addData }) => {
    addData('i18n', (languages: Record<string, string>) => {
      languages['en-US'] = 'English'
    })
    const { map, regex } = await import('./data')
    registerData('i18n.en-US', map, regex)
  },
}
