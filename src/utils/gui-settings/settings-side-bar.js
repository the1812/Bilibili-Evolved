if (document.querySelector('.gui-settings-icon-panel') === null) {
  document.body.insertAdjacentHTML('beforeend', /*html*/`
    <div class='gui-settings-icon-panel icons-enabled'>
        <div class='gui-settings-widgets' title='附加功能'>
            <i class="icon-widgets"></i>
        </div>
        <div class='gui-settings' title='设置'>
            <i class="icon-settings"></i>
        </div>
    </div>`)
  dq('.gui-settings').addEventListener('click', e => {
    if (e.shiftKey === false) {
      dqa('.gui-settings-box,.gui-settings-mask').forEach(it => it.classList.add('opened'))
    } else {
      dqa('.bilibili-evolved-about,.gui-settings-mask').forEach(it => it.classList.add('opened'))
      // raiseEvent(document.querySelector('.bilibili-evolved-about'), 'be:about-load')
    }
  })
  dq('.gui-settings-widgets').addEventListener('click', e => {
    if (e.shiftKey === false) {
      dqa('.gui-settings-widgets-box,.gui-settings-mask').forEach(it => it.classList.add('opened'))
    } else {
      debugger
    }
  })

  const widgetsIcon = dq('.gui-settings-icon-panel .gui-settings-widgets>i')
  const settingsIcon = dq('.gui-settings-icon-panel .gui-settings>i')
  let keyup = false
  let blur = false
  const restoreIcon = () => {
    settingsIcon.classList.remove('icon-info')
    settingsIcon.classList.add('icon-settings')
    settingsIcon.parentElement.title = '设置'
    widgetsIcon.classList.remove('icon-time')
    widgetsIcon.classList.add('icon-widgets')
    widgetsIcon.parentElement.title = '附加功能'
    keyup = false
    blur = false
  }
  const changeIcon = () => {
    settingsIcon.classList.remove('icon-settings')
    settingsIcon.classList.add('icon-info')
    settingsIcon.parentElement.title = '关于'
    widgetsIcon.classList.remove('icon-widgets')
    widgetsIcon.classList.add('icon-time')
    widgetsIcon.parentElement.title = '「ザ・ワールド」'
    if (!keyup) {
      document.body.addEventListener('keyup', restoreIcon, { once: true })
      keyup = true
    }
    if (!blur) {
      window.addEventListener('blur', restoreIcon, { once: true })
      blur = true
    }
  }
  document.body.addEventListener('keydown', e => {
    if (document.activeElement &&
      ["input", "textarea"].includes(document.activeElement.nodeName.toLowerCase())) {
      return
    }
    if (e.shiftKey === true) {
      changeIcon()
    }
  })
}
const setSideBarOffset = (value = settings.sideBarOffset) => {
  document.body.style.setProperty("--side-bar-offset", value + "%")
}
addSettingsListener("sideBarOffset", setSideBarOffset)
setSideBarOffset()