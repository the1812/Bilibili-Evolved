import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'

export enum CommentSortMode {
  Default = '默认顺序',
  LikesDescending = '点赞数从高到低',
  LikesAscending = '点赞数从低到高',
  TimeDescending = '发布时间从新到旧',
  TimeAscending = '发布时间从旧到新',
  LevelDescending = '用户等级从高到低',
  LevelAscending = '用户等级从低到高',
}

export const sortCommentsOptions = defineOptionsMetadata({
  sortMode: {
    defaultValue: CommentSortMode.Default,
    displayName: '评论排序方式',
    dropdownEnum: CommentSortMode,
  },
  autoSort: {
    defaultValue: true,
    displayName: '自动排序（新评论加载时自动刷新排序）',
  },
  showPanel: {
    defaultValue: true,
    displayName: '显示排序悬浮面板',
  },
})

export type SortCommentsOptions = OptionsOfMetadata<typeof sortCommentsOptions>