import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'

/** 提示停留位置 */
export enum ToastPosition {
  RightTop = '右上',
  LeftTop = '左上',
  RightBottom = '右下',
  LeftBottom = '左下',
  Center = '居中',
}

/** 触发后的默认操作 */
export enum ToastDefaultAction {
  /** 自动从头播放, 提示中可还原/下一集 */
  Restart = '重头播放',
  /** 不自动跳转, 由用户在提示中选择 */
  Manual = '手动选择',
}

export const options = defineOptionsMetadata({
  thresholdPercent: {
    defaultValue: 80,
    displayName: '视频结尾百分比阈值',
    slider: {
      min: 50,
      max: 99,
      step: 1,
    },
  },
  enableOfficialEnding: {
    defaultValue: true,
    displayName: '优先使用官方片尾点 (番剧/影视)',
  },
  enableControlButton: {
    defaultValue: true,
    displayName: '在播放器控制栏显示按钮',
  },
  defaultAction: {
    defaultValue: ToastDefaultAction.Restart,
    displayName: '默认操作',
    dropdownEnum: ToastDefaultAction,
  },
  toastDurationSeconds: {
    defaultValue: 8,
    displayName: '提示停留时间 (秒)',
    slider: {
      min: 3,
      max: 30,
      step: 1,
    },
  },
  toastPosition: {
    defaultValue: ToastPosition.RightTop,
    displayName: '提示停留位置',
    dropdownEnum: ToastPosition,
  },
  minDuration: {
    defaultValue: 60,
    displayName: '最短生效时长 (秒)',
    hidden: true,
  },
  historyWaitTimeout: {
    defaultValue: 5000,
    displayName: '等待历史定位超时 (毫秒)',
    hidden: true,
  },
})

export type Options = OptionsOfMetadata<typeof options>
