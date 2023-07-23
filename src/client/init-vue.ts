import { default as VueLibrary } from 'vue'

export const initVue = () => {
  // # 在 core 和 features 中使用同一个 Vue 库的实现方式
  //
  // 1. 在 core 中使用 commonjs 版本的 vue。通过配置 webpack/webpack.dev.ts, webpack/webpack.prod.ts 完成
  // 2. 将 `window.Vue` 设置为 'vue' 模块的默认导出。在 src/client/init-vue.ts 中完成
  // 3. 在 registry 中将 'vue' 设置为外部依赖，来源为 `window.Vue`。在 registry/webpack/config.ts 中完成
  //
  // 使用 commonjs 版本的原因：为了使 `window.Vue` 同时包含 Vue 2.7 提供的具名导出 API。（见：https://v2.vuejs.org/v2/guide/migration-vue-2-7.html#Notes-on-API-exposure）
  window.Vue = VueLibrary

  Vue.config.devtools = false
  Vue.config.productionTip = false
  Vue.directive('hit', {
    inserted(el, { value }) {
      if (value && typeof value === 'function') {
        const wrapper = (e: KeyboardEvent | MouseEvent) => {
          if (value.length > 0) {
            value(e)
          } else {
            value()
          }
        }
        el.addEventListener('click', value)
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            wrapper(e)
          }
        })
      }
    },
  })
}
