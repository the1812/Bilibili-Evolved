import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'

export enum FieldsMode {
  ALL = '全部',
  Standard = '仅标准字段',
}

export const options = defineOptionsMetadata({
  fieldsMode: {
    defaultValue: FieldsMode.ALL,
    displayName: 'FFMETADATA 字段',
    dropdownEnum: FieldsMode,
  },
  convertBangumiSkips: {
    displayName: '将番剧的「跳过头尾」转换为章节', //
    defaultValue: true,
  },
})

export type Options = OptionsOfMetadata<typeof options>
