export function loadResources () {
  Resource.root = 'https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/'
  Resource.cdnRoot = 'https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/'
  Resource.all = {}
  Resource.displayNames = {}
  Resource.reloadables = []
  for (const [key, data] of Object.entries(Resource.manifest)) {
    const resource = new Resource(data.path, { styles: data.styles, alwaysPreview: data.alwaysPreview })
    resource.key = key
    resource.dropdown = data.dropdown
    if (data.reloadable) {
      Resource.reloadables.push(key)
    }
    if (data.displayNames) {
      resource.displayName = data.displayNames[key]
      Object.assign(Resource.displayNames, data.displayNames)
    }
    if (data.style) {
      const styleKey = key + 'Style'
      const style = Resource.all[styleKey] = new Resource(data.path.replace('.js', '.css'), { alwaysPreview: data.alwaysPreview })
      style.key = styleKey
      switch (data.style) {
        case 'instant':
        {
          resource.styles.push(styleKey)
          break
        }
        case true:
        {
          resource.dependencies.push(style)
          break
        }
        case 'important':
        {
          resource.styles.push({
            key: styleKey,
            important: true
          })
          break
        }
        default:
        {
          if (typeof data.style === 'object') {
            resource.styles.push(Object.assign({ key: styleKey }, data.style))
          }
          break
        }
      }
    }
    if (data.html === true) {
      const htmlKey = key + 'Html'
      const html = Resource.all[htmlKey] = new Resource(data.path.replace('.js', '.html'), { alwaysPreview: data.alwaysPreview })
      html.key = htmlKey
      resource.dependencies.push(html)
    }
    Resource.all[key] = resource
  }
  for (const [key, data] of Object.entries(Resource.manifest)) {
    if (data.dependencies) {
      Resource.all[key].dependencies.push(...data.dependencies.map(name => Resource.all[name]))
    }
  }
}
