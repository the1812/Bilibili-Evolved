import { OptionsOfMetadata, defineOptionsMetadata } from '@/components/define'

export const options = defineOptionsMetadata({
  types: {
    defaultValue: [] as number[],
    displayName: '过滤动态类型',
    hidden: true,
  },
  patterns: {
    defaultValue: [] as string[],
    displayName: '过滤关键词',
    hidden: true,
  },
  sideCards: {
    /** FIXME: 虽然代码里按照`number[]`, 但其实存进去的是`string[]`? */
    defaultValue: [] as number[],
    displayName: '过滤侧边栏',
    hidden: true,
  },
  specialTypes: {
    defaultValue: [] as number[],
    displayName: '过滤特殊动态类型',
    hidden: true,
  },
})

export type FeedsFilterOptions = OptionsOfMetadata<typeof options>
