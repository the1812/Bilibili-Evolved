/** 元素查询函数, 调用时执行 `SpinQuery.select` 查询, 可访问 `selector` 获取选择器 */
export type ElementQuery<Target = HTMLElement> = {
  (): Promise<Target | null>
  sync: () => Target | null
  selector: string
}
export interface CustomNestedQuery<QueryResult> {
  [key: string]: QueryResult | CustomNestedQuery<QueryResult>
}
export interface CustomQuery<QueryResult> extends CustomNestedQuery<QueryResult> {
  [key: string]: QueryResult
}
export type AgentType = 'video' | 'bangumi' | 'live'
export type CustomQueryProvider<TargetType> = {
  [key in AgentType]?: TargetType
} & { video: TargetType }
export interface PlayerQuery<QueryResult> extends CustomNestedQuery<QueryResult> {
  playerWrap: QueryResult
  bilibiliPlayer: QueryResult
  playerArea: QueryResult
  video: {
    element: QueryResult
    wrap: QueryResult
    top: QueryResult
    state: QueryResult
    panel: QueryResult
    popup: QueryResult
    subtitle: QueryResult
    basDanmaku: QueryResult
    advDanmaku: QueryResult
    danmaku: QueryResult
    container: QueryResult
  }
  control: {
    element: QueryResult
    wrap: QueryResult
    mask: QueryResult
    top: QueryResult
    progress: QueryResult
    bottom: QueryResult
    bottomLeft: QueryResult
    bottomCenter: QueryResult
    bottomRight: QueryResult
    buttons: {
      start: QueryResult
      next: QueryResult
      time: QueryResult
      quality: QueryResult
      pageList: QueryResult
      speed: QueryResult
      subtitle: QueryResult
      volume: QueryResult
      settings: QueryResult
      pip: QueryResult
      widescreen: QueryResult
      webFullscreen: QueryResult
      fullscreen: QueryResult
    }
    settings: {
      wrap: QueryResult
      lightOff: QueryResult
    }
  }
  toastWrap: QueryResult
  danmakuTipLayer: QueryResult
  danmakuSwitch: QueryResult
}

export enum PlayerAgentEventTypes {
  Play = 'play',
  Pause = 'pause',
}
