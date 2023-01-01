import { defineComponentMetadata } from '@/components/define'
import { LifeCycleEventTypes } from '@/core/life-cycle'
import { darkExcludes } from '../dark-urls'

export const component = defineComponentMetadata({
  name: 'darkModeFollowSystem',
  displayName: '夜间模式跟随系统',
  entry: () => {
    unsafeWindow.addEventListener(LifeCycleEventTypes.End, async () => {
      const { getComponentSettings } = await import('@/core/settings')
      const darkMode = getComponentSettings('darkMode')
      const matchList = matchMedia('(prefers-color-scheme: dark)')
      const check = (isSystemDark: boolean) => {
        if (isSystemDark !== darkMode.enabled) {
          darkMode.enabled = isSystemDark
        }
      }
      check(matchList.matches)
      matchList.addEventListener('change', e => {
        check(e.matches)
      })
    })
  },
  urlExclude: darkExcludes,
  tags: [componentsTags.style, componentsTags.general],
  description: {
    'zh-CN': `
使夜间模式同步系统设置的亮 / 暗主题, 请勿和 \`夜间模式计划时段\` 一同使用.

> 注：在某些浏览器 (如 \`Microsoft Edge\`) 中，夜间模式仅会同步浏览器的亮 / 暗主题.
    `.trim(),
  },
})
