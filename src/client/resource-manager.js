export class ResourceManager {
  constructor () {
    this.data = Resource.all
    this.skippedImport = []
    this.attributes = {}
    this.styleManager = new StyleManager(this)
    const styleMethods = Object.getOwnPropertyNames(StyleManager.prototype).filter(it => it !== 'constructor')
    for (const key of styleMethods) {
      this[key] = function (...params) {
        this.styleManager[key](...params)
      }
    }
    this.setupColors()
  }
  setupColors () {
    this.color = new ColorProcessor(settings.customStyleColor)
    settings.foreground = this.color.foreground
    settings.blueImageFilter = this.color.blueImageFilter
    settings.pinkImageFilter = this.color.pinkImageFilter
    settings.brightness = this.color.brightness
    settings.filterInvert = this.color.filterInvert

    const hexToRgba = input => this.color.rgbToString(this.color.hexToRgba(input))
    let styles = []
    styles.push('--theme-color:' + settings.customStyleColor)
    for (let opacity = 10; opacity <= 90; opacity += 10) {
      const color = this.color.hexToRgba(settings.customStyleColor)
      color.a = opacity / 100
      styles.push(`--theme-color-${opacity}:` + this.color.rgbToString(color))
    }
    styles.push('--foreground-color:' + settings.foreground)
    styles.push('--foreground-color-b:' + hexToRgba(settings.foreground + 'b'))
    styles.push('--foreground-color-d:' + hexToRgba(settings.foreground + 'd'))
    styles.push('--blue-image-filter:' + settings.blueImageFilter)
    styles.push('--pink-image-filter:' + settings.pinkImageFilter)
    styles.push('--brightness:' + settings.brightness)
    styles.push('--invert-filter:' + settings.filterInvert)
    styles.push('--blur-background-opacity:' + settings.blurBackgroundOpacity)
    // styles.push("--custom-control-background-opacity:" + settings.customControlBackgroundOpacity);
    this.applyStyleFromText(`html{${styles.join(';')}}`, 'bilibili-evolved-variables')
  }
  resolveComponentName (componentName) {
    const filename = '/' + componentName.substring(componentName.lastIndexOf('/') + 1) + '.min.js'
    for (const [name, value] of Object.entries(Resource.all)) {
      if (value.url.endsWith(filename)) {
        return name
      }
    }
    if (componentName.endsWith('Html') || componentName.endsWith('Style')) {
      return componentName
    }
    return filename.replace('/', '')
  }
  resolveComponent (componentName) {
    const name = this.resolveComponentName(componentName)
    let resource = Resource.all[name]
    if (!resource) {
      resource = new Resource(name)
      let key = name.substring(0, name.indexOf('.')).replace(/-\w/g, t => t.substr(1).toUpperCase())
      if (name.includes('.vue.')) {
        key += 'Component'
      }
      resource.key = key
      if (resource.text === undefined) {
        resource.text = null
      }
      Resource.all[key] = resource
    }
    return resource
  }
  importAsync (componentName) {
    return new Promise(resolve => {
      const resource = this.resolveComponent(componentName)
      if (!resource) {
        resolve(unsafeWindow.bilibiliEvolved)
      }
      if (!Object.keys(this.attributes).includes(resource.key)) {
        if (resource.type.name === 'html' || resource.type.name === 'style') {
          resource.download().then(() => resolve(this.import(componentName)))
        } else {
          this.fetchByKey(resource.key).then(() => resolve(this.import(componentName)))
        }
      } else {
        resolve(this.import(componentName))
      }
    })
  }
  import (componentName) {
    const resource = this.resolveComponent(componentName)
    if (!resource) {
      return unsafeWindow.bilibiliEvolved
    }
    if (resource.type.name === 'html' || resource.type.name === 'style') {
      if (!resource.downloaded) {
        console.error(`Import failed: component "${componentName}" is not loaded.`)
        return null
      }
      return resource.text
    } else {
      const attribute = this.attributes[this.resolveComponentName(componentName)]
      if (attribute === undefined) {
        console.error(`Import failed: component "${componentName}" is not loaded.`)
        return null
      }
      return attribute.export
    }
  }
  async fetchByKey (key) {
    const resource = Resource.all[key]
    if (!resource) {
      return null
    }
    const text = await resource.download().catch(reason => {
      console.error(`Download error, XHR status: ${reason}`)
      let toastMessage = `无法下载组件<span>${Resource.all[key].displayName}</span>`
      if (settings.toastInternalError) {
        toastMessage += '\n' + reason
      }
      Toast.error(toastMessage, '错误')
    })
    // await Promise.all(resource.dependencies
    //   .filter(it => it.type.name === 'style')
    //   .map(it => this.styleManager.fetchStyleByKey(it.key)))
    await Promise.all(resource.dependencies
      .filter(it => it.type.name === 'script')
      .map(it => this.fetchByKey(it.key)))
    this.applyComponent(key, text)
  }
  async fetch () {
    const isCacheValid = this.validateCache()
    // let loadingToast = null
    if (settings.toast === true) {
      await this.fetchByKey('toast')
      unsafeWindow.bilibiliEvolved.Toast = Toast = this.attributes.toast.export.Toast || this.attributes.toast.export
      // if (!isCacheValid && settings.useCache) {
      //   loadingToast = Toast.info(/* html */`<div class="loading"></div>正在初始化脚本`, '初始化')
      // }
    }
    const promises = []
    for (const key in settings) {
      if (settings[key] === true && key !== 'toast') {
        await this.styleManager.fetchStyleByKey(key)
        const promise = this.fetchByKey(key)
        if (promise) {
          promises.push(promise)
        }
      }
    }
    await Promise.all(promises)
    // if (loadingToast) {
    //   loadingToast.dismiss()
    // }
    this.applyReloadables() // reloadables run sync
    // await this.applyDropdownOptions();
    // this.applyWidgets() // No need to wait the widgets
    if (!isOffline()) {
      const checkUpdates = () => this.checkUpdates(!isCacheValid)
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(checkUpdates)
      } else {
        fullyLoaded(checkUpdates)
      }
    }
  }
  applyReloadables () {
    const checkAttribute = (key, attributes) => {
      if (attributes.reload && attributes.unload) {
        addSettingsListener(key, newValue => {
          if (newValue === true) {
            attributes.reload()
          } else {
            attributes.unload()
          }
        })
      }
    }
    for (const key of Resource.reloadables) {
      const attributes = this.attributes[key]
      if (attributes === undefined) {
        const fetchListener = async newValue => {
          if (newValue === true) {
            const isDownloading =
              typeof offlineData === 'undefined' &&
              (settings.useCache ? settings.cache[key] === undefined : true)
            try {
              if (isDownloading) {
                const downloading = document.createElement('i')
                downloading.classList.add('mdi', 'mdi-18px', 'downloading', 'mdi-download')
                downloading.innerHTML = '下载中'
                dq(`li[data-key=${key}] label`).insertAdjacentElement('beforeend', downloading)
                dq(`input[key=${key}]`).disabled = true
              }
              await this.styleManager.fetchStyleByKey(key)
              await this.fetchByKey(key)
              removeSettingsListener(key, fetchListener)
              checkAttribute(key, this.attributes[key])
            } finally {
              if (isDownloading) {
                dq(`li[data-key=${key}] i.downloading`).remove()
                dq(`input[key=${key}]`).disabled = false
              }
            }
          }
        }
        addSettingsListener(key, fetchListener)
      } else {
        checkAttribute(key, attributes)
      }
    }
  }
  applyComponent (key, text) {
    const func = typeof text === 'string' ? eval(text) : text
    if (func) {
      try {
        const attribute = func(settings, this) || {}
        this.attributes[key] = attribute
      } catch (error) {
        console.error(`Failed to apply feature "${key}": ${error}`)
        const displayName = Resource.all[key].displayName
        let toastMessage = `加载组件<span>${displayName || key}</span>失败`
        if (settings.toastInternalError) {
          toastMessage += '\n' + error
        }
        Toast.error(toastMessage, '错误')
      }
    }
  }
  async checkUpdates () {
    if (isOffline()) {
      return
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
    // const getHash = async (message) => {
    //   const msgUint8 = new TextEncoder().encode(message)
    //   const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
    //   const hashArray = Array.from(new Uint8Array(hashBuffer))
    //   const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    //   return hashHex
    // }
    // if (fullDownload) {
    const url = Resource.root + 'min/bundle.zip'
    const zip = new JSZip()
    await zip.loadAsync(await Ajax.monkey({
      url,
      responseType: 'blob',
    }))
    let cache = {}
    const files = zip.file(/.+/)
    for (const file of files) {
      const url = Resource.root + 'min/' + file.name
      const resource = Object.values(Resource.all).find(it => it.rawUrl === url)
      if (resource) {
        if (scriptVersion === 'Stable' && resource.alwaysPreview) {
          continue
        }
        const text = await file.async('text')
        cache[resource.key] = text
        // console.log(`bundle update: saved ${resource.key}`)
      }
    }
    settings.cache = Object.assign(settings.cache, cache)
    // } else {
    //   const hashJson = await Ajax.monkey({
    //     url: Resource.root + 'min/bundle.json',
    //     responseType: 'json',
    //   })
    //   const scriptHashWrap = h => `(()=>{return${h}})();`
    //   await Promise.all(Object.entries(hashJson).map(async ([name, hash]) => {
    //     const url = Resource.root + 'min/' + name
    //     const resource = Object.values(Resource.all).find(it => it.rawUrl === url)
    //     if (!resource) {
    //       return
    //     }
    //     const cache = settings.cache[resource.key]
    //     if (cache) {
    //       const cacheHash = await getHash(cache)
    //       if (cacheHash.toLowerCase() !== hash.toLowerCase() &&
    //         scriptHashWrap(cacheHash).toLowerCase() !== hash.toLowerCase()) {
    //         console.log(`hash not match: ${resource.key} (${cacheHash.toLowerCase()}) !== (${hash.toLowerCase()})`)
    //         await resource.download()
    //         settings.cache = Object.assign(settings.cache, {
    //           [resource.key]: resource.text
    //         })
    //         console.log(`downloaded ${resource.key}`)
    //       } else {
    //         console.log(`checked hash: ${resource.key}`)
    //       }
    //     }
    //   }))
    // }

  }
  async applyWidget (info) {
    let condition = true
    if (typeof info.condition === 'function') {
      condition = info.condition()
      if (typeof condition === 'object' && 'then' in condition) {
        condition = await condition.catch(() => { return false })
      }
    }
    if (condition === true) {
      if (info.content) {
        document.querySelector('.widgets-container').insertAdjacentHTML('beforeend', info.content)
      }
      if (info.success) {
        info.success()
      }
    }
  }
  async applyWidgets () {
    await Promise.all(Object.values(this.attributes)
      .filter(it => it.widget)
      .map(it => this.applyWidget(it.widget))
    )
  }
  async applyDropdownOptions () {
    async function applyDropdownOption (info) {
      if (Array.isArray(info)) {
        await Promise.all(info.map(applyDropdownOption))
      } else {
        const dropdownInput = dq(`.gui-settings-dropdown input[key=${info.key}]`)
        dropdownInput.value = settings[info.key]
        dropdownInput.setAttribute('data-name', settings[info.key])
        const dropdown = dropdownInput.parentElement
        const list = dropdown.querySelector('ul')
        const input = dropdown.querySelector('input')
        info.items.forEach(itemHtml => {
          list.insertAdjacentHTML('beforeend', `<li data-name="${itemHtml}">${itemHtml}</li>`)
        })
        list.querySelectorAll('li').forEach(li => li.addEventListener('click', () => {
          input.value = li.innerText
          input.setAttribute('data-name', li.getAttribute('data-name'))
          settings[info.key] = li.getAttribute('data-name')
        }))
      }
    }
    const manifests = Object.values(Resource.manifest).filter(it => it.dropdown).map(it => it.dropdown)
    Object.values(Resource.all)
      // .concat(Object.values(this.attributes))
      .filter(it => it.dropdown)
      .map(it => it.dropdown)
      .forEach(it => {
        if (!manifests.some(m => m.key === it.key)) {
          manifests.push(it)
        }
      })
    manifests.push({
      key: 'scriptLoadingMode',
      items: ['同时', '延后']
    })
    await Promise.all(manifests.map(it => applyDropdownOption(it)))
  }
  toggleStyle (content, id) {
    if (id === undefined) { // content is resource name
      this.styleManager.applyStyle(content)
      return {
        reload: () => this.styleManager.applyStyle(content),
        unload: () => this.styleManager.removeStyle(content)
      }
    } else { // content is style text
      this.styleManager.applyStyleFromText(content, id)
      return {
        reload: () => this.styleManager.applyStyleFromText(content, id),
        unload: () => document.getElementById(id).remove()
      }
    }
  }
  validateCache () {
    if (typeof offlineData !== 'undefined') { // offline version always has cache
      return true
    }
    if (Object.getOwnPropertyNames(settings.cache).length === 0) { // has no cache
      return false
    }
    if (settings.cache.version === undefined) { // Has newly downloaded cache
      settings.cache = Object.assign(settings.cache, { version: settings.currentVersion })
      // settings.cache.version = settings.currentVersion;
      return true
    }
    if (settings.cache.version !== settings.currentVersion) { // Has old version cache
      settings.cache = {}
      return false
    }
    return true // Has cache
  }
}
