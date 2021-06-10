/** 插入主站导航图标 SVG 符号定义 */
export const addCategoryIcons = async () => {
  if (document.getElementById('be-category-icons')) {
    return
  }
  const { default: svg } = await import('./category-icons.svg')
  document.body.insertAdjacentHTML('beforeend', svg)
}
