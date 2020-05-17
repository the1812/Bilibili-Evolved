import { ThemeColors } from './theme-colors'
import { SettingsSearch } from './settings-search'
import { Validator } from './text-validate'

let inputs = []
let checkBoxes = []
let textBoxes = []
function getCategoryItems (category) {
  let element = category.nextElementSibling
  const elements = []
  while (element !== null && !element.classList.contains('category')) {
    elements.push(element)
    element = element.nextElementSibling
  }
  return elements
}
function syncGui () {
  textBoxes.forEach(it => it.value = settings[it.getAttribute('key')])
  checkBoxes.forEach(it => it.checked = settings[it.getAttribute('key')])
}
function setupEvents () {
  document.querySelector('.gui-settings-mask').addEventListener('click', () => {
    document.querySelectorAll('.gui-settings-widgets-box,.gui-settings-box,.gui-settings-mask,.bilibili-evolved-about')
      .forEach(it => it.classList.remove('opened'))
  })
  textBoxes.forEach(element => {
    element.setAttribute('placeholder', settings[element.getAttribute('key')])
  })
  document.querySelectorAll('.gui-settings-content ul li.category').forEach(it => {
    it.addEventListener('click', e => {
      const searchBox = document.querySelector('.gui-settings-search')
      if (searchBox.value !== '') {
        searchBox.value = ''
        raiseEvent(searchBox, 'input')
      }
      e.currentTarget.classList.toggle('folded')
      getCategoryItems(e.currentTarget).forEach(it => it.classList.toggle('folded'))
    })
  })
  document.querySelectorAll('.gui-settings-dropdown>input').forEach(it => {
    it.addEventListener('click', e => {
      e.currentTarget.parentElement.classList.toggle('opened')
    })
  })
  dqa('.gui-settings-header .operation').forEach(it => {
    it.addEventListener('click', e => {
      if (e.target.classList.contains('export')) {
        const a = document.createElement('a')
        a.style.display = 'none'
        const url = URL.createObjectURL(new Blob([JSON.stringify(_.omit(settings, 'cache'))]))
        a.href = url
        a.download = 'bilibili-evolved-settings.json'
        document.body.insertAdjacentElement('beforeend', a)
        a.click()
        URL.revokeObjectURL(url)
        a.remove()
      } else if (e.target.classList.contains('import')) {
        const input = document.createElement('input')
        input.style.display = 'none'
        input.type = 'file'
        input.accept = '.json,text/json'
        document.body.insertAdjacentElement('beforeend', input)
        input.addEventListener('change', async () => {
          try {
            const file = input.files[0]
            const obj = JSON.parse(await new Response(file).text())
            for (const [key, value] of Object.entries(obj)) {
              if (key in settings && key !== 'cache') {
                settings[key] = value
              }
            }
            Toast.success('已成功导入设置, 部分设置需要刷新后生效.', '导入设置', 3000)
          } catch (error) {
            Toast.error('选择的设置文件无效.', '导入设置', 3000)
          } finally {
            input.remove()
          }
        }, { once: true })
        input.click()
      }
    })
  })
}
function listenSettingsChange () {
  checkBoxes.forEach(element => {
    element.addEventListener('change', () => {
      const key = element.getAttribute('key')
      const value = element.checked
      settings[key] = value
    })
  })
  textBoxes.forEach(element => {
    element.addEventListener('change', () => {
      const key = element.getAttribute('key')
      const value = Validator.getValidator(key).validate(element.value)
      settings[key] = value
      element.value = value
    })
  })
}
function listenDependencies () {
  const deps = inputs.map(it => [it.getAttribute('dependencies').split(' ').map(dep => inputs.find(input => input.getAttribute('key') === dep)), it])
  const li = element => element.nodeName.toUpperCase() === 'LI' ? element : li(element.parentElement)
  deps.forEach(([parents, child]) => {
    if (parents[0] === undefined) {
      return
    }
    const change = () => {
      if (parents.every(p => p.checked)) {
        li(child).classList.remove('disabled')
      } else {
        li(child).classList.add('disabled')
      }
    }
    parents.forEach(it => it.addEventListener('change', change))
    change()
  })
}
function checkOfflineData () {
  if (typeof offlineData !== 'undefined') {
    // document.querySelector('.gui-settings-checkbox-container>input[key=useCache]').parentElement.parentElement.classList.add('disabled')
    // document.querySelector('input[key=useCache]').disabled = true
  }
}
function checkCompatibility () {
  // if (!CSS.supports('backdrop-filter', 'blur(24px)') &&
  //   !CSS.supports('-webkit-backdrop-filter', 'blur(24px)')) {
  //   inputs.find(it => it.getAttribute('key') === 'blurVideoControl').disabled = true
  //   settings.blurVideoControl = false
  // }
  if (window.devicePixelRatio === 1) {
    inputs.find(it => it.getAttribute('key') === 'harunaScale').disabled = true
    inputs.find(it => it.getAttribute('key') === 'imageResolution').disabled = true
    settings.harunaScale = false
    settings.imageResolution = false
  }
}
function setDisplayNames () {
  for (const [key, name] of Object.entries(Resource.displayNames)) {
    const input = inputs.find(it => it.getAttribute('key') === key)
    if (!input) {
      continue
    }
    switch (input.type) {
      case 'checkbox':
        input.nextElementSibling.nextElementSibling.innerHTML = name
        break
      case 'text':
        const parent = input.parentElement
        if (parent.classList.contains('gui-settings-textbox-container')) {
          input.previousElementSibling.innerHTML = name
        } else if (parent.classList.contains('gui-settings-dropdown')) {
          parent.previousElementSibling.innerHTML = name
        }
        break
      default:
        break
    }
  }
}

(async () => {
  resources.applyStyle('guiSettingsStyle')
  // resources.applyStyle('scrollbarStyle')
  resources.applyImportantStyle('iconsStyle')
  document.body.classList.add('round-corner')

  const isIframe = document.body && unsafeWindow.parent.window !== unsafeWindow
  if (isIframe) {
    document.querySelector('.gui-settings-icon-panel').style.display = 'none'
    // return;
  }

  addSettingsListener('guiSettingsDockSide', value => {
    document.body.classList.toggle('gui-settings-dock-right', value === '右侧')
  }, true)
  addSettingsListener('autoHideSideBar', value => {
    document.body.classList.toggle('gui-settings-auto-hide-side-bar', value)
  }, true)
  addSettingsListener('elegantScrollbar', value => {
    document.documentElement.classList.toggle('elegant-scrollbar', value)
  }, true)
  const settingsBox = resources.data.guiSettingsHtml.text
  document.body.insertAdjacentHTML('beforeend', settingsBox)

  const { style } = await import('../../style/mdi')
  if (!style) {
    document.body.insertAdjacentHTML('afterbegin', `<link rel="stylesheet" href="//cdn.materialdesignicons.com/3.6.95/css/materialdesignicons.min.css">`)
  }

  const widgetsContainer = document.querySelector('.widgets-container')
  const emptyTip = widgetsContainer.querySelector('.empty-tip')
  Observer.childList(widgetsContainer, () => {
    if (widgetsContainer.childElementCount <= 1) {
      emptyTip.classList.add('show')
    } else {
      emptyTip.classList.remove('show')
    }
  })
  const boxes = document.querySelectorAll('.gui-settings-widgets-box,.gui-settings-box')
  const iconPanel = document.querySelector('.gui-settings-icon-panel')
  iconPanel.addEventListener('mouseover', async () => {
    const { loadTooltip } = await import('./tooltip/settings-tooltip.loader')
    await loadTooltip()
    await resources.applyDropdownOptions()
    resources.applyWidgets()
    raiseEvent(iconPanel, 'be:load')
    const aboutPanel = dq('.bilibili-evolved-about')
    if (aboutPanel) {
      raiseEvent(aboutPanel, 'be:about-load')
    }
    new ThemeColors().setupDom()
    boxes.forEach(it => it.classList.add('loaded'))
    inputs = [...document.querySelectorAll('input[key]')]
    checkBoxes = inputs.filter(it => it.type === 'checkbox')
    textBoxes = inputs.filter(it => it.type === 'text' && !it.parentElement.classList.contains('gui-settings-dropdown'))
    setupEvents()
    checkOfflineData()
    syncGui()
    listenDependencies()
    listenSettingsChange()
    // foldAllCategories();
    checkCompatibility()
    setDisplayNames()
    dq('.script-info .version').textContent = scriptVersion + ' v' + GM.info.script.version
    new SettingsSearch()
  }, { once: true })
})()
