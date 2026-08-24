import { defineComponentMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import { darkExcludes } from '../dark-urls'

export const component = defineComponentMetadata({
  name: 'darkModeFollowSystem',
  displayName: '夜间模式跟随系统',
  entry: () => {
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
  },
  urlExclude: darkExcludes,
  tags: [componentsTags.style, componentsTags.general],
})
