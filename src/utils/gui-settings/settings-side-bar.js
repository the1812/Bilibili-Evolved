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
    dqa('.gui-settings-box,.gui-settings-mask').forEach(it => it.classList.add('opened'))
  })
  dq('.gui-settings-widgets').addEventListener('click', e => {
    if (e.shiftKey === false) {
      dqa('.gui-settings-widgets-box,.gui-settings-mask').forEach(it => it.classList.add('opened'))
    } else {
      debugger
    }
  })
}
addSettingsListener("sideBarOffset", value => {
  document.documentElement.style.setProperty("--side-bar-offset", value + "vh")
}, true)
