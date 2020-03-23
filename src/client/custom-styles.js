export const installStyle = style => {
  const { name, style: content, displayName, mode } = style
  const styleManager = unsafeWindow.bilibiliEvolved.resources.styleManager
  const id = styleManager.getDefaultStyleId(name)
  const existingStyle = settings.customStyles.find(it => it.name === name)
  if (existingStyle) {
    Object.assign(existingStyle, style)
    const styleElement = dq(`#${id}`)
    if (styleElement) {
      styleElement.remove()
    }
  } else {
    settings.customStyles.push(Object.assign({
      enabled: true,
      mode: 'default',
    }, style))

  }
  settings.customStyles = settings.customStyles
  styleManager[mode === 'important' ? 'applyImportantStyleFromText' : 'applyStyleFromText'](content, id)
  console.log(`已安装自定义样式'${displayName}'`)
}
export const uninstallStyle = name => {
  const styleIndex = settings.customStyles.findIndex(it => it.name === name || it.displayName === name)
  if (styleIndex !== -1) {
    settings.customStyles.splice(styleIndex, 1)
    settings.customStyles = settings.customStyles
    const styleManager = unsafeWindow.bilibiliEvolved.resources.styleManager
    const style = dq(`#${styleManager.getDefaultStyleId(name)}`)
    if (style) {
      style.remove()
    }
    console.log(`已卸载自定义样式.`)
  }
}
export const toggleStyle = name => {
  const style = settings.customStyles.find(it => it.name === name || it.displayName === name)
  if (style) {
    style.enabled = !style.enabled
    settings.customStyles = settings.customStyles
    const styleManager = unsafeWindow.bilibiliEvolved.resources.styleManager
    if (style.enabled) {
      const id = styleManager.getDefaultStyleId(style.name)
      styleManager[style.mode === 'important' ? 'applyImportantStyleFromText' : 'applyStyleFromText'](style.style, id)
    } else {
      const style = dq(`#${styleManager.getDefaultStyleId(name)}`)
      if (style) {
        style.remove()
      }
    }
    console.log(`已${style.enabled ? '开启' : '关闭'}自定义样式: ${style.displayName || style.name}`)
  }
}