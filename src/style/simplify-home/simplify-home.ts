(async () => {
  if (document.URL.replace(window.location.search, '') !== 'https://www.bilibili.com/') {
    resources.removeStyle('simplifyHomeStyle')
    return
  }
  document.body.insertAdjacentHTML('beforeend', /*html*/`
    <simplify-home :home-style="homeStyle"></simplify-home>
  `)
  const vm = new Vue({
    el: 'simplify-home',
    components: {
      SimplifyHome: () => import('simplify-home.vue'),
    },
    data: {
      homeStyle: settings.simplifyHomeStyle,
    },
  })
  addSettingsListener('simplifyHomeStyle', value => vm.homeStyle = value, false)
})()