import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { playerUrls } from '@/core/utils/urls'
import { addComponentListener } from '@/core/settings'
import { watchLocalStorage } from '@/core/local-storage'

enum DanmakuBorderStyle {
  Heavy,
  Stroke,
  Shadow,
}
const danmakuTextShadowMap = {
  [DanmakuBorderStyle.Heavy]:
    '1px 0 1px #000000,0 1px 1px #000000,0 -1px 1px #000000,-1px 0 1px #000000',
  [DanmakuBorderStyle.Stroke]: '0px 0px 1px #000000,0 0 1px #000000,0 0 1px #000000',
  [DanmakuBorderStyle.Shadow]: '1px 1px 2px #000000,0 0 1px #000000',
}
const watchDanmakuBorderSettings = () => {
  const localStorageKey = 'bpx_player_profile'
  const updateDanmakuTextShadow = (playerSettings: any) => {
    const danmakuBorderStyle: DanmakuBorderStyle = lodash.get(
      playerSettings,
      'dmSetting.fontborder',
    )
    document.documentElement.style.setProperty(
      '--danmaku-text-shadow',
      danmakuTextShadowMap[danmakuBorderStyle],
    )
  }
  updateDanmakuTextShadow(JSON.parse(localStorage.getItem(localStorageKey)))
  watchLocalStorage((key, value) => {
    if (key === localStorageKey) {
      updateDanmakuTextShadow(JSON.parse(value))
    }
  })
}

const options = defineOptionsMetadata({
  highlight: {
    displayName: '禁用高赞弹幕',
    defaultValue: true,
  },
  up: {
    displayName: '禁用UP主弹幕',
    defaultValue: true,
  },
  upSlogan: {
    displayName: '禁用带货弹幕',
    defaultValue: true,
  },
  vip: {
    displayName: '禁用大会员弹幕',
    defaultValue: true,
  },
})

type Options = OptionsOfMetadata<typeof options>

const entry: ComponentEntry<Options> = ({ metadata, settings }) => {
  Object.keys(settings.options).forEach(disableType => {
    addComponentListener(
      `${metadata.name}.${disableType}`,
      (value: boolean) => {
        document.body.classList.toggle(`disable-${disableType}-danmaku-style`, value)
      },
      true,
    )
  })
  watchDanmakuBorderSettings()
}

const name = 'disableSpecialDanmaku'
export const component = defineComponentMetadata({
  name,
  entry,
  displayName: '禁用特殊弹幕样式',
  tags: [componentsTags.style],
  instantStyles: [
    {
      name,
      style: () => import('./special-danmaku.scss'),
    },
  ],
  urlInclude: playerUrls,
  options,
})
