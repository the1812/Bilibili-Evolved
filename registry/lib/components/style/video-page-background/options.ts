import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'

export interface BackgroundImage {
  name: string
  url: string
}

export const LOCAL_UPLOAD_LIMIT_KIB = 1024

export const emptyBackgroundImage = (): BackgroundImage => ({ name: '', url: '' })

export enum BackgroundSize {
  Cover = '覆盖',
  Contain = '包含',
  Original = '原始大小',
}

export enum BackgroundPosition {
  CenterBottom = '底部居中',
  Center = '居中',
  LeftBottom = '左下',
  RightBottom = '右下',
}

export const options = defineOptionsMetadata({
  backgroundImage: {
    displayName: '背景图片',
    defaultValue: emptyBackgroundImage(),
    hidden: true,
  },
  imageOpacity: {
    displayName: '图片不透明度 (%)',
    defaultValue: 100,
    slider: {
      min: 0,
      max: 100,
      step: 1,
    },
  },
  maskOpacity: {
    displayName: '遮罩不透明度 (%)',
    defaultValue: 0,
    slider: {
      min: 0,
      max: 100,
      step: 1,
    },
  },
  blur: {
    displayName: '背景模糊 (px)',
    defaultValue: 0,
    slider: {
      min: 0,
      max: 30,
      step: 1,
    },
  },
  backgroundSize: {
    displayName: '图片缩放方式',
    defaultValue: BackgroundSize.Cover,
    dropdownEnum: BackgroundSize,
  },
  backgroundPosition: {
    displayName: '图片位置',
    defaultValue: BackgroundPosition.CenterBottom,
    dropdownEnum: BackgroundPosition,
  },
  followDarkMode: {
    displayName: '随深色模式切换配色',
    defaultValue: true,
  },
  backgroundColor: {
    displayName: '页面底色（浅色）',
    defaultValue: '#d6ebea',
    color: true,
  },
  maskColor: {
    displayName: '遮罩颜色（浅色）',
    defaultValue: '#d6ebea',
    color: true,
  },
  darkBackgroundColor: {
    displayName: '页面底色（深色）',
    defaultValue: '#1d2736',
    color: true,
  },
  darkMaskColor: {
    displayName: '遮罩颜色（深色）',
    defaultValue: '#1d2736',
    color: true,
  },
})

export type Options = OptionsOfMetadata<typeof options>
