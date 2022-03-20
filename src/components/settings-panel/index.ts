import { mountVueComponent } from '@/core/utils'
import { LoadingMode } from '@/core/loading-mode'
import { TextColor } from '@/core/text-color'
import { CdnTypes } from '@/core/cdn-types'
import { addComponentListener } from '@/core/settings'
import { DownloadPackageEmitMode } from '@/core/download-mode'
import { ComponentEntry, ComponentMetadata, componentsTags } from '../types'
import { provideActions } from './external-actions'
import description from './desc.md'

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
  configurable: false,
  description,
  entry,
  options: {
    themeColor: {
      defaultValue: '#00A0D8',
      displayName: '主题颜色',
      color: true,
    },
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
    downloadPackageEmitMode: {
      defaultValue: DownloadPackageEmitMode.Packed,
      displayName: '文件下载模式',
      dropdownEnum: DownloadPackageEmitMode,
    },
    devMode: {
      defaultValue: false,
      displayName: '开发者模式',
    },
  },
  tags: [componentsTags.general],
  i18n: {
    'en-US': {
      map: [
        ['通用设置', 'General'],
        ['实验性', 'Experimental'],
        ['通用', 'General'],
        ['开发者模式', 'Dev mode'],
        ['辅助颜色', 'Accent color'],
        ['功能加载模式', 'Script loading mode'],
        ['样式加载模式', 'Style loading mode'],
      ],
    },
  },
  plugin: {
    displayName: '设置面板 - 功能扩展',
    setup: () => {
      provideActions()
    },
  },
}
