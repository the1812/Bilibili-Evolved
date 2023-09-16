import { defineComponentMetadata } from '@/components/define'
import { addComponentListener } from '@/core/settings'
import { fontFamilyDefaultValue } from './font-family-default-value'

const docElement = document.documentElement

const kebabName = 'custom-font-family'

const camelName = 'customFontFamily'

const name = camelName

const displayName = '自定义字体'

const description = {
  'zh-CN':
    '使用组件提供的字体设置覆盖原版的主站字体，并使主站字体可被自定义。字体设置写法请参考 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/font-family) 、默认设置与设置说明',
}

const tags = [componentsTags.style, componentsTags.general]

const entry = () => {
  addComponentListener(
    `${name}.fontFamily`,
    (value: string) => {
      if (!value) {
        docElement.setAttribute(`${kebabName}--detect--is-input-empty`, 'true')
        return
      }
      docElement.style.setProperty(`--${kebabName}--options--font-family`, `${value}`)
      docElement.setAttribute(`${kebabName}--detect--is-input-empty`, 'false')
    },
    true,
  )

  addComponentListener(
    `${name}.disableQuotationMarkTextIndent`,
    (value: boolean) => {
      docElement.setAttribute(
        `${kebabName}--options--disable-quotation-mark-text-indent`,
        `${value}`,
      )
    },
    true,
  )

  const onOptionNames = [
    { camel: 'onOrnament', kebab: 'on-ornament' },
    { camel: 'onFansMedal', kebab: 'on-fans-medal' },
    { camel: 'onDanmaku', kebab: 'on-danmaku' },
    { camel: 'onIconFont', kebab: 'on-icon-font' },
    { camel: 'onColumn', kebab: 'on-column' },
    { camel: 'onScore', kebab: 'on-score' },
  ]

  onOptionNames.forEach(onOptionName => {
    addComponentListener(
      `${name}.${onOptionName.camel}`,
      (value: boolean) => {
        docElement.setAttribute(`${kebabName}--options--${onOptionName.kebab}`, `${value}`)
      },
      true,
    )
  })
}

const options = {
  fontFamily: {
    displayName: '字体',
    defaultValue: fontFamilyDefaultValue,
    hidden: true,
  },
  disableQuotationMarkTextIndent: {
    displayName: '禁用引号缩进',
    defaultValue: true,
  },
  onOrnament: {
    displayName: '覆盖装扮字体',
    defaultValue: false,
  },
  onFansMedal: {
    displayName: '覆盖粉丝勋章字体',
    defaultValue: false,
  },
  onDanmaku: {
    displayName: '覆盖弹幕字体',
    defaultValue: false,
  },
  onIconFont: {
    displayName: '覆盖图标字体',
    defaultValue: false,
  },
  onColumn: {
    displayName: '覆盖专栏自定义字体',
    defaultValue: false,
  },
  onScore: {
    displayName: '覆盖评分字体',
    defaultValue: false,
  },
}

const extraOptions = () => import('./extra-options/entry.vue').then(m => m.default)

const instantStyles = [
  {
    name: `${name}--style--setFontFamily`,
    style: () => import('./set-font-family.scss'),
    important: true,
  },
  {
    name: `${name}--style--disableQuotationMarkTextIndent`,
    style: () => import('./disable-quotation-mark-text-indent.scss'),
    important: true,
  },
]

const author = {
  name: 'Tinhone',
  link: 'https://github.com/Tinhone',
}

export const component = defineComponentMetadata({
  name,
  displayName,
  description,
  tags,
  entry,
  options,
  extraOptions,
  instantStyles,
  author,
})
