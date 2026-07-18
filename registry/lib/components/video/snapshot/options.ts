import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'
import { unreachable } from '@/core/utils'

export enum ButtonPosition {
  Off = '关',
  TopLeft = '左上',
  TopRight = '右上',
  BottomLeft = '左下',
  BottomRight = '右下',
}

export function parseButtonPosition(position: ButtonPosition) {
  switch (position) {
    case ButtonPosition.TopLeft:
      return 'top left'
    case ButtonPosition.TopRight:
      return 'top right'
    case ButtonPosition.BottomLeft:
      return 'bottom left'
    case ButtonPosition.BottomRight:
      return 'bottom right'
    default:
      return unreachable()
  }
}

export function isButtonEnabled(position: ButtonPosition) {
  return position !== ButtonPosition.Off
}

export const options = defineOptionsMetadata({
  gridRows: {
    displayName: '快照图网格行数',
    defaultValue: 6,
  },
  gridColumns: {
    displayName: '快照图网格列数',
    defaultValue: 5,
  },
  gridGap: {
    displayName: '快照图网格间隔（像素）',
    defaultValue: 4,
  },
  gridBorder: {
    displayName: '快照图边框（像素）',
    defaultValue: 12,
  },
  gridBackgroundColor: {
    displayName: '快照图背景颜色',
    color: true,
    defaultValue: '#000000',
  },
  textColor: {
    displayName: '快照图文字颜色',
    color: true,
    defaultValue: '#ffffff',
  },
  textSize: {
    displayName: '快照图文字大小（像素）',
    defaultValue: 32,
  },
  textFont: {
    displayName: '快照图文字字体',
    defaultValue: 'sans-serif',
  },
  enlargeSmallImage: {
    displayName: '放大过小的快照图',
    defaultValue: true,
  },
  showInfoHeader: {
    displayName: '快照图呈现视频信息',
    defaultValue: true,
  },
  enablePreviewDownload: {
    displayName: '预览快照图时可下载',
    defaultValue: false,
  },
  recommendListButton: {
    displayName: '推荐列表视频按钮',
    dropdownEnum: ButtonPosition,
    defaultValue: ButtonPosition.TopRight,
  },
  uploadListButton: {
    displayName: 'UP主投稿视频按钮',
    dropdownEnum: ButtonPosition,
    defaultValue: ButtonPosition.TopRight,
  },
  favoriteListButton: {
    displayName: '收藏夹视频按钮',
    dropdownEnum: ButtonPosition,
    defaultValue: ButtonPosition.TopRight,
  },
  feedCardButton: {
    displayName: '动态视频按钮',
    dropdownEnum: ButtonPosition,
    defaultValue: ButtonPosition.TopRight,
  },
})

export type Options = OptionsOfMetadata<typeof options>
