import type { UserStyle } from '@/plugins/style'
import { removeUserStyle } from '../user-item'
import { SettingsFeature } from './base'
import type { SettingsFeatureDetail, SettingsFeatureOperations, SettingsFeatureRow } from './types'

export class StyleSettingsFeature extends SettingsFeature<Required<UserStyle>> {
  protected readonly openHook = 'settingsPanel.styleDetail.open'
  protected readonly closeHook = undefined
  readonly related = undefined
  readonly isChildOf = undefined

  get row(): SettingsFeatureRow {
    return { icon: 'mdi-tune' }
  }

  get detail(): SettingsFeatureDetail {
    return {
      showName: true,
      description: {
        description:
          '自定义样式能简单修改界面元素，是早期兼容 v1 版本的过渡产物，如有需要建议使用 Stylus 浏览器插件或者开发标准的组件',
      },
    }
  }

  get operations(): SettingsFeatureOperations {
    return { removal: { run: () => removeUserStyle(this.metadata), confirm: true } }
  }
}
