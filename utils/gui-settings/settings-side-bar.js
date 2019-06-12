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
  document.querySelector('.gui-settings').addEventListener('click', e => {
    if (e.shiftKey === false) {
      document.querySelectorAll('.gui-settings-box,.gui-settings-mask').forEach(it => it.classList.add('opened'))
    } else {
      document.querySelectorAll('.bilibili-evolved-about,.gui-settings-mask').forEach(it => it.classList.add('opened'))
      raiseEvent(document.querySelector('.bilibili-evolved-about'), 'be:about-load')
    }
  })
  document.querySelector('.gui-settings-widgets').addEventListener('click', () => {
    document.querySelectorAll('.gui-settings-widgets-box,.gui-settings-mask').forEach(it => it.classList.add('opened'))
  })
}
const setSideBarOffset = (value = settings.sideBarOffset) => {
  document.body.style.setProperty("--side-bar-offset", value + "%")
}
addSettingsListener("sideBarOffset", setSideBarOffset)
setSideBarOffset()