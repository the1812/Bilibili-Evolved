export const installStyle = style => {
  const { name } = style
  const existingStyle = settings.customStyles.find(it => it.name === name)
  if (existingStyle) {
    Object.assign(existingStyle, style)
  } else {
    settings.customStyles.push(Object.assign({
      enabled: true,
      mode: 'default',
    }, style))
  }
  settings.customStyles = settings.customStyles
  console.log(`已安装自定义样式'${style.displayName}'`)
}
export const uninstallStyle = name => {
  const styleIndex = settings.customStyles.findIndex(it => it.name === name || it.displayName === name)
  if (styleIndex !== -1) {
    settings.customStyles.splice(styleIndex, 1)
    settings.customStyles = settings.customStyles
    console.log(`已卸载自定义样式.`)
  }
}