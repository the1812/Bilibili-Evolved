import Vue from 'vue'

/**
 * 创建一个组件并动态注入 props
 *
 * 主要用于额外设置、小组件传入参数值
 *
 * 示例：extraOptions: () => import('./Setting.vue').then(m => createComponentWithProps(m.default, { isWidget: false })),
 */
export function createComponentWithProps(component: any, props: Record<string, any>) {
  return Vue.extend({
    render(h) {
      return h(component, {
        props,
      })
    },
  })
}
