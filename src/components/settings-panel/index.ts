import { mountVueComponent } from '@/core/utils'
import { LoadingMode } from '@/core/loading-mode'
import { TextColor } from '@/core/text-color'
import { CdnTypes } from '@/core/cdn-types'
import { addComponentListener } from '@/core/settings'
import { ComponentEntry, ComponentMetadata, componentsTags } from '../types'
import { addI18nData } from '../i18n/helpers'

export const WidgetsPlugin = 'widgets'
export enum SettingsPanelDockSide {
  Left = '左侧',
  Right = '右侧',
}
const entry: ComponentEntry = async ({ metadata }) => {
  const { isIframe } = await import('@/core/utils')
  if (isIframe()) {
    return
  }
  addComponentListener(`${metadata.name}.dockSide`, (value: SettingsPanelDockSide) => {
    document.body.classList.toggle('settings-panel-dock-right', value === SettingsPanelDockSide.Right)
  }, true)
  requestIdleCallback(async () => {
    const Container = await import('./SettingsContainer.vue')
    const instance = mountVueComponent(Container)
    document.body.insertAdjacentElement('beforeend', instance.$el)
  })
}
export const component: ComponentMetadata = {
  name: 'settingsPanel',
  displayName: '通用设置',
  enabledByDefault: true,
  configurable: false,
  // hidden: true,
  entry,
  options: {
    themeColor: {
      defaultValue: '#00A0D8',
      displayName: '主题颜色',
      color: true,
    },
    // accentColor: {
    //   defaultValue: '#D55480',
    //   displayName: '辅助颜色',
    //   color: true,
    // },
    scriptLoadingMode: {
      defaultValue: LoadingMode.Delay,
      displayName: '功能加载模式',
      dropdownEnum: LoadingMode,
    },
    styleLoadingMode: {
      defaultValue: LoadingMode.Race,
      displayName: '样式加载模式',
      dropdownEnum: LoadingMode,
    },
    textColor: {
      defaultValue: TextColor.Auto,
      displayName: '文本颜色',
      dropdownEnum: TextColor,
    },
    cdnRoot: {
      defaultValue: CdnTypes.jsDelivr,
      displayName: '更新源',
      dropdownEnum: CdnTypes,
    },
    dockSide: {
      defaultValue: SettingsPanelDockSide.Left,
      displayName: '设置面板停靠',
      dropdownEnum: SettingsPanelDockSide,
    },
    filenameFormat: {
      defaultValue: '[title][ - ep]',
      displayName: '文件命名格式',
    },
    batchFilenameFormat: {
      defaultValue: '[n - ][ep]',
      displayName: '批量命名格式',
    },
    devMode: {
      defaultValue: false,
      displayName: '开发者模式',
    },
  },
  tags: [componentsTags.general],
  plugin: {
    displayName: '通用设置 - 多语言',
    setup: () => {
      addI18nData(
        'en-US',
        [
          ['通用设置', 'General'],
          ['实验性', 'Experimental'],
          ['通用', 'General'],
          ['开发者模式', 'Dev mode'],
          ['辅助颜色', 'Accent color'],
          ['功能加载模式', 'Script loading mode'],
          ['样式加载模式', 'Style loading mode'],
        ],
      )
    },
  },
}
