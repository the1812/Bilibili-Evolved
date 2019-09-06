(async () => {
  if (document.URL.replace(window.location.search, '') !== 'https://www.bilibili.com/') {
    return
  }
  const SimplifyHome = await import((() => 'simplify-home.vue')())
  document.body.insertAdjacentHTML('beforeend', /*html*/`
    <simplify-home :home-style="homeStyle"></simplify-home>
  `)
  const vm = new Vue({
    el: 'simplify-home',
    components: {
      'simplify-home': SimplifyHome,
    },
    data: {
      homeStyle: settings.simplifyHomeStyle,
    },
  })
  addSettingsListener('simplifyHomeStyle', value => vm.homeStyle = value, false)
})()