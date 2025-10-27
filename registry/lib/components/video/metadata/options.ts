import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'

export enum FieldsMode {
  ALL = '全部',
  Standard = '仅标准字段',
}

export enum TimeFormat {
  Timestmp = '时间戳',
  Local = '本地时间',
  ISO = 'ISO时间',
}

export const options = defineOptionsMetadata({
  fieldsMode: {
    displayName: 'FFMETADATA 字段',
    dropdownEnum: FieldsMode,
    defaultValue: FieldsMode.ALL,
  },
  timeFormat: {
    displayName: '时间格式',
    dropdownEnum: TimeFormat,
    defaultValue: TimeFormat.Local,
  },
  convertBangumiSkips: {
    displayName: '将番剧的「跳过头尾」转换为章节', //
    defaultValue: true,
  },
  includeStat: {
    displayName: '包含状态数（播放数、点赞数等）', //
    defaultValue: true,
  },
})

export type Options = OptionsOfMetadata<typeof options>
