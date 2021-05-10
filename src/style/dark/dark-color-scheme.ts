const matchList = matchMedia('(prefers-color-scheme: dark)')
const check = async (isSystemDark: boolean) => {
  if (isSystemDark !== settings.useDarkStyle) {
    console.log('[dark-color-scheme]', isSystemDark, settings.useDarkStyle)
    settings.useDarkStyle = isSystemDark
    if (isSystemDark) {
      await resources.fetchByKey('useDarkStyle')
    } else {
      const darkStyles = await import('./dark-styles')
      console.log('[dark-color-scheme]', darkStyles)
      darkStyles?.unload()
    }
  }
}
check(matchList.matches)
matchList.addEventListener('change', e => {
  check(e.matches)
})
