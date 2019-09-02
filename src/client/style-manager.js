export class StyleManager {
  constructor (resources) {
    this.resources = resources
  }
  getDefaultStyleId (key) {
    return key.replace(/([a-z][A-Z])/g,
      g => `${g[0]}-${g[1].toLowerCase()}`)
  }
  applyStyle (key, id) {
    if (id === undefined) {
      id = this.getDefaultStyleId(key)
    }
    Resource.all[key].applyStyle(id, false)
  }
  removeStyle (key) {
    const style = document.querySelector(`#${this.getDefaultStyleId(key)}`)
    style && style.remove()
  }
  applyImportantStyle (key, id) {
    if (id === undefined) {
      id = this.getDefaultStyleId(key)
    }
    Resource.all[key].applyStyle(id, true)
  }
  applyStyleFromText (text, id) {
    if (!id) {
      document.head.insertAdjacentHTML('afterbegin', text)
    } else {
      const style = document.createElement('style')
      style.id = id
      style.innerText = text
      document.head.insertAdjacentElement('afterbegin', style)
    }
  }
  applyImportantStyleFromText (text, id) {
    if (!id) {
      document.body.insertAdjacentHTML('beforeend', text)
    } else {
      const style = document.createElement('style')
      style.id = id
      style.innerText = text
      document.body.insertAdjacentElement('beforeend', style)
    }
  }
  getStyle (key, id) {
    return Resource.all[key].getStyle(id)
  }
  fetchStyleByKey (key) {
    if (settings[key] !== true) {
      return
    }
    const resource = Resource.all[key]
    if (!resource || !resource.styles) {
      return
    }
    resource.styles
      .filter(it => it.condition !== undefined ? it.condition() : true)
      .forEach(it => {
        const important = typeof it === 'object' ? it.important : false
        const styleKey = typeof it === 'object' ? it.key : it
        Resource.all[styleKey].download().then(() => {
          if (important) {
            contentLoaded(() => this.applyImportantStyle(styleKey))
          } else {
            this.applyStyle(styleKey)
          }
        })
      })
  }
  prefetchStyles () {
    for (const key in Resource.all) {
      if (typeof offlineData !== 'undefined' || settings.useCache && settings.cache[key]) {
        this.fetchStyleByKey(key)
      }
    }
  }
}
