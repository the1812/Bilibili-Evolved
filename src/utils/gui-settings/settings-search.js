export class SettingsSearch {
  constructor () {
    this.input = document.querySelector('.gui-settings-search')
    const items = [...document.querySelectorAll('.gui-settings-content>ul>li')]
    const ifCategory = condition => item => item.classList.contains('category') === condition
    this.categories = items.filter(ifCategory(true))
    this.items = items.filter(ifCategory(false))
    this.importToolTips().then(() => this.input.addEventListener('input', () => this.keywordChange()))
  }
  async importToolTips () {
    if (typeof getI18nKey === 'undefined') {
      console.error('请更新脚本后再使用设置搜索功能.')
      return
    }
    const { toolTips } = await import(`settings-tooltip.${getI18nKey()}`)
    this.toolTips = toolTips
  }
  keywordChange () {
    const value = this.input.value.trim()
    if (!value) {
      this.categories.concat(this.items).forEach(it => it.classList.add('folded'))
      return
    }
    this.items.forEach(item => {
      const key = item.querySelector('input').getAttribute('key')
      const tooltip = this.toolTips.get(key)
      let texts = Resource.displayNames[key]
      if (tooltip !== undefined) {
        texts += tooltip.replace(/<.*>|<\/.*>/g, '')
      }
      if (texts.includes(value)) {
        item.classList.remove('folded')
        const dependencies = item.getAttribute('data-dependencies')
        if (dependencies !== undefined && dependencies !== null) {
          dependencies.split(' ').forEach(dependency => {
            const parent = this.items.find(item => item.getAttribute('data-key') === dependency)
            if (parent !== undefined) {
              parent.classList.remove('folded')
            }
          })
        }
      } else {
        item.classList.add('folded')
      }
    })
    this.foldCategories()
  }
  foldCategories () {
    for (const category of this.categories) {
      function fold () {
        let item = category.nextElementSibling
        while (item !== null && !item.classList.contains('category')) {
          if (!item.classList.contains('folded')) {
            return 'remove'
          }
          item = item.nextElementSibling
        }
        return 'add'
      }
      category.classList[fold()]('folded')
    }
  }
}
export default {
  export: { SettingsSearch }
}
