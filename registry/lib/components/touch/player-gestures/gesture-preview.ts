/** 进度调整模式(灵敏度) */
export enum ProgressSeekMode {
  fast = '高速',
  medium = '中速',
  slow = '低速',
}
/** 手势操作预览参数 */
export interface GesturePreviewParams {
  /** 亮度调整 */
  brightness?: number
  /** 音量调整 */
  volume?: number
  /** 进度调整 */
  progress?: number
}
