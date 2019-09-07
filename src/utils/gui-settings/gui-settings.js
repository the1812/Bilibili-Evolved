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
  if (!CSS.supports('backdrop-filter', 'blur(24px)') &&
    !CSS.supports('-webkit-backdrop-filter', 'blur(24px)')) {
    inputs.find(it => it.getAttribute('key') === 'blurVideoControl').disabled = true
    settings.blurVideoControl = false
  }
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
  resources.applyImportantStyle('iconsStyle')
  document.body.classList.add('round-corner')

  const isIframe = document.body && unsafeWindow.parent.window !== unsafeWindow
  if (isIframe) {
    document.querySelector('.gui-settings-icon-panel').style.display = 'none'
    // return;
  }

  const settingsBox = resources.data.guiSettingsHtml.text
  document.body.insertAdjacentHTML('beforeend', settingsBox)

  const { style } = await import('../../style/mdi')
  if (!style) {
    document.body.insertAdjacentHTML('afterbegin', `<link rel="stylesheet" href="//cdn.materialdesignicons.com/3.6.95/css/materialdesignicons.min.css">`)
  }
  resources.applyDropdownOptions()

  const widgetsContainer = document.querySelector('.widgets-container')
  const emptyTip = widgetsContainer.querySelector('.empty-tip')
  Observer.childList(widgetsContainer, () => {
    if (widgetsContainer.childElementCount <= 1) {
      emptyTip.classList.add('show')
    } else {
      emptyTip.classList.remove('show')
    }
  })

  new ThemeColors().setupDom()

  const boxes = document.querySelectorAll('.gui-settings-widgets-box,.gui-settings-box')
  const iconPanel = document.querySelector('.gui-settings-icon-panel')
  iconPanel.addEventListener('mouseover', () => {
    raiseEvent(iconPanel, 'be:load')
    raiseEvent(dq('.bilibili-evolved-about'), 'be:about-load')
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
    new SettingsSearch()
  }, { once: true })
})()
