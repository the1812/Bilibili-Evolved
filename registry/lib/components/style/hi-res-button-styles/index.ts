import { defineComponentMetadata } from '@/components/define'
import { addComponentListener } from '@/core/settings'
import { playerUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'hiResButtonStyles',
  displayName: 'Hi-Res 音质按钮布局调整',
  entry: () => {
    addComponentListener(
      'hiResButtonStyles.fillThemeColor',
      (value: boolean) => {
        if (value) {
          document.documentElement.style.setProperty(
            '--be-color-button-hires',
            'var(--theme-color, #00a1d6)',
          )
        } else {
          document.documentElement.style.removeProperty('--be-color-button-hires')
        }
      },
      true,
    )
  },
  instantStyles: [
    {
      name: 'hiResButtonStyles',
      style: () => import('./hi-res-button-styles.scss'),
    },
  ],
  options: {
    fillThemeColor: {
      displayName: '开启 Hi-Res 时将按钮填充为主题色',
      defaultValue: true,
    },
  },
  tags: [componentsTags.style, componentsTags.video],
  urlInclude: playerUrls,
})
