import { addComponentListener } from '@/core/settings'

export enum areaPrimaryTitleColorEnum {
  Dark = '深色',
  Light = '浅色',
}

const map = {
  [areaPrimaryTitleColorEnum.Dark]: 'dark',
  [areaPrimaryTitleColorEnum.Light]: 'light',
}

addComponentListener(
  'freshHome.areaPrimaryTitleColor',
  (value: areaPrimaryTitleColorEnum) => {
    document.documentElement.setAttribute(
      'fresh-home--options--area-primary-title-color',
      map[value],
    )
  },
  true,
)
