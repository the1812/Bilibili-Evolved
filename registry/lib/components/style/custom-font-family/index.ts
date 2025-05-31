import { defineComponentMetadata } from '@/components/define'
import { addComponentListener } from '@/core/settings'
import { fontFamilyDefaultValue, coverOptionsName, coverOptionsDefaultValue } from './data'

const docElement = document.documentElement

const kebabName = 'custom-font-family'

const camelName = 'customFontFamily'

const name = camelName

const displayName = '自定义字体'

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
    `${name}.disableTitlePunctuationTextIndent`,
    (value: boolean) => {
      docElement.setAttribute(
        `${kebabName}--options--disable-title-punctuation-text-indent`,
        `${value}`,
      )
    },
    true,
  )

  for (const coverOptionName of coverOptionsName) {
    addComponentListener(
      `${name}.${coverOptionName.camel}`,
      (value: boolean) => {
        docElement.setAttribute(`${kebabName}--options--${coverOptionName.kebab}`, `${value}`)
      },
      true,
    )
  }
}

const options = {
  fontFamily: {
    displayName: '字体',
    defaultValue: fontFamilyDefaultValue,
    hidden: true,
  },
  disableTitlePunctuationTextIndent: {
    displayName: '禁用标题标点符号缩进',
    defaultValue: true,
  },
}

const invokeCoverOptions = () => {
  for (const coverOptionName of coverOptionsName) {
    options[coverOptionName.camel] = {
      displayName: coverOptionName.display,
      defaultValue: coverOptionsDefaultValue[coverOptionName.camel],
      hidden: true,
    }
  }
}

invokeCoverOptions()

const extraOptions = () => import('./extra-options/Entry.vue').then(m => m.default)

const instantStyles = [
  {
    name: `${kebabName}--style--set-font-family`, // style 标签 id
    style: () => import('./set-font-family.scss'),
    important: true,
  },
  {
    name: `${kebabName}--style--disable-title-punctuation-text-indent`,
    style: () => import('./disable-title-punctuation-text-indent.scss'),
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
  tags,
  entry,
  options,
  extraOptions,
  instantStyles,
  author,
})
