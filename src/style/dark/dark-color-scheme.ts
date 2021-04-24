const matchList = matchMedia('(prefers-color-scheme: dark)')
const check = (isSystemDark: boolean) => {
  if (isSystemDark !== settings.useDarkStyle) {
    settings.useDarkStyle = isSystemDark
  }
  return isSystemDark
}
(async()=>{
  const { load:loadDarkMod, unload:unloadDarkMod } = await import('./dark-styles')
  check(matchList.matches) ? loadDarkMod() : unloadDarkMod()
})()
matchList.addEventListener('change', e => {
  check(e.matches)
})
