import { mountVueComponent } from '@/core/utils'
import { LoadingMode } from '@/core/loading-mode'
import { TextColor } from '@/core/text-color'
import { CdnTypes } from '@/core/cdn-types'
import { addComponentListener } from '@/core/settings'
import { DownloadPackageEmitMode } from '@/core/download-mode'
import { ComponentEntry, componentsTags } from '../types'
import { defineComponentMetadata, defineOptionsMetadata, OptionsOfMetadata } from '../define'
import { provideActions } from './external-actions'
import { SettingsPanelDockSide } from './dock'

export const WidgetsPlugin = 'widgets'

const options = defineOptionsMetadata({
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
    defaultValue: CdnTypes.AltCdn,
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
    multiline: true,
  },
  batchFilenameFormat: {
    defaultValue: '[n - ][ep]',
    displayName: '批量命名格式',
    multiline: true,
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
})

export type Options = OptionsOfMetadata<typeof options>

const entry: ComponentEntry<Options> = async ({ metadata }) => {
  const { isIframe } = await import('@/core/utils')
  if (isIframe()) {
    return
  }
  addComponentListener(
    `${metadata.name}.dockSide`,
    (value: SettingsPanelDockSide) => {
      document.body.classList.toggle(
        'settings-panel-dock-right',
        value === SettingsPanelDockSide.Right,
      )
    },
    true,
  )
  requestIdleCallback(async () => {
    const Container = await import('./SettingsContainer.vue')
    const instance = mountVueComponent(Container)
    document.body.insertAdjacentElement('beforeend', instance.$el)
  })
}

export const component = defineComponentMetadata({
  name: 'settingsPanel',
  displayName: '通用设置',
  configurable: false,
  entry,
  options,
  tags: [componentsTags.general],
  plugin: {
    displayName: '设置面板 - 功能扩展',
    setup: () => {
      provideActions()
    },
  },
})
