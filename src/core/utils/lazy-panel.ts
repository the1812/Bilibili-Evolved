import { select } from '../spin-query'
import { raiseEvent, dq, delay } from '.'

/** 懒加载面板的参数 */
export interface LazyPanelParameters {
  /** `mouseover`后到真正载入面板时需要等待的时间 */
  enterDelay?: number
  /** `mouseout`后到收起面板需要等待的时间 */
  leaveDelay?: number
  /** 期间注入的样式, 可以暂时隐藏面板 */
  style?: string
}
/** 提前加载某个懒加载的面板
 * @param selector 选择器
 * @param params 懒加载面板参数
 */
export const loadLazyPanel = async (selector: string, params: LazyPanelParameters = {}) => {
  const { style, enterDelay = 750, leaveDelay = 1000 } = params
  const panel = (await select(selector)) as HTMLElement
  if (!panel) {
    throw new Error(`lazy panel failed! selector = ${selector}`)
  }
  let tempStyle: HTMLStyleElement
  if (style !== undefined) {
    tempStyle = document.createElement('style')
    tempStyle.textContent = style
    document.body.insertAdjacentElement('beforeend', tempStyle)
  }
  raiseEvent(panel, 'mouseover')
  await delay(enterDelay)
  raiseEvent(panel, 'mouseout')
  setTimeout(() => tempStyle?.remove(), leaveDelay)
  return panel
}
/**
 * 加载播放器的某个设置面板, 通过对应按钮上的`mouseover`/`mouseout`来触发
 * @param buttonSelector 触发面板加载的按钮选择器
 * @param panelSelector 面板选择器
 * @param params 懒加载面板参数
 */
export const loadLazyPlayerSettingsPanel = async (
  buttonSelector: string,
  panelSelector: string,
  params: LazyPanelParameters = {},
) => {
  await loadLazyPanel(buttonSelector, {
    style: `${panelSelector} { display: none !important; }`,
    ...params,
  })
  const panel = dq(panelSelector) as HTMLElement
  if (!panel) {
    throw new Error(`lazy player settings panel failed! panelSelector = ${panelSelector}`)
  }
  return panel
}
/** 加载弹幕设置的面板 */
export const loadDanmakuSettingsPanel = () =>
  loadLazyPlayerSettingsPanel(
    '.bilibili-player-video-danmaku-setting, .bpx-player-dm-setting',
    '.bilibili-player-video-danmaku-setting-wrap, .bpx-player-dm-setting-wrap',
  )
/** 加载字幕设置的面板 */
export const loadSubtitleSettingsPanel = () =>
  loadLazyPlayerSettingsPanel(
    '.bilibili-player-video-btn-subtitle, .bpx-player-ctrl-subtitle',
    '.bilibili-player-video-subtitle-setting-wrap, .bpx-player-ctrl-subtitle-box',
    {
      style: `
      .bpx-player-ctrl-subtitle-box,
      .bilibili-player-video-subtitle-setting-wrap,
      .bilibili-player-video-subtitle {
        display: none
      }
    `,
    },
  )
