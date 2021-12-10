/** 表示脚本的代码或样式的加载模式 */
export enum LoadingMode {
  /** 延后加载 (`load`事件) */
  Delay = '延后',
  /** 同时加载, 可能会与B站原脚本抢占 (`DCL`事件) */
  Race = '同时',
}
