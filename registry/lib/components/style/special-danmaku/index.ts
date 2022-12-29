import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { playerUrls } from '@/core/utils/urls'
import { addComponentListener } from '@/core/settings'

const options = defineOptionsMetadata({
  highlight: {
    displayName: '禁用高赞弹幕',
    defaultValue: true,
  },
  up: {
    displayName: '禁用UP主弹幕',
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
  description: {
    'zh-CN': '移除高赞弹幕或 UP 主弹幕的特殊样式, 弹幕内容不会移除.',
  },
  options,
})
