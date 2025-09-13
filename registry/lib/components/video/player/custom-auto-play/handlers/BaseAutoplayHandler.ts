import { ComponentSettings } from '@/core/settings'
import { sq, select } from '@/core/spin-query'
import { getVue2Data as getVueData } from '@/core/utils'
import { logger } from '..'
import { AutoplayActionType } from '../AutoplayActionType'

/** 自动连播处理器基类 */
export abstract class BaseAutoplayHandler {
  // #region 初始化

  /** 脚本设置 */
  static settings: ComponentSettings

  /** 自动连播处理器实例列表 */
  protected static handlers: BaseAutoplayHandler[] = []

  /** 添加自动连播处理器实例到列表 */
  static register(handler: BaseAutoplayHandler) {
    BaseAutoplayHandler.handlers.push(handler)
  }

  /** 获取匹配当前页面的自动连播处理器实例 */
  static async getHandler(): Promise<BaseAutoplayHandler | null> {
    for (const handler of BaseAutoplayHandler.handlers) {
      if (await handler.match()) {
        return handler
      }
    }

    return null
  }

  // #endregion

  // #region 抽象

  /** 自动连播类型 */
  abstract type: string

  /** 处理器是否适用当前页面 */
  abstract match(): Promise<boolean>

  /** 是否应启用自动连播 */
  abstract shouldAutoplay(): Promise<boolean>

  /**
   * 设置自动连播状态
   * @param enable true：启用，false：禁用
   */
  abstract setupAutoPlay(enable: boolean): Promise<void>

  // #endregion

  // #region 工具方法

  /**
   * 默认连播方式判断，自动连播行为类型为AUTO时使用回调处理
   * @param actionType 自动连播行为类型
   * @param autoTypeHandler 自动连播行为类型为AUTO时的处理回调
   * @returns 是否应该自动连播
   */
  static shouldAutoplayWithAutoHandler(
    actionType: AutoplayActionType,
    autoTypeHandler: () => boolean,
  ): boolean {
    switch (actionType) {
      case AutoplayActionType.ALWAYS:
        return true
      case AutoplayActionType.DISABLE:
        return false
      case AutoplayActionType.AUTO:
      default:
        return autoTypeHandler()
    }
  }

  /**
   * 获取分P序号文本
   * @returns 例如：'1/10' 或 '（1/10）'
   */
  protected getSequentialNumberString(): string {
    return ''
  }

  /**
   * 解析分P序号
   * @returns 例如：[1,10]
   */
  protected parseSequentialNumbers(): number[] {
    return this.getSequentialNumberString()
      .replace(/[（）()]/g, '')
      .split('/')
      .map(it => parseInt(it))
  }

  /** 是否最后1P视频 */
  protected isLastSequentialNumber(): boolean {
    const sequentialNumbers = this.parseSequentialNumbers()
    if (!sequentialNumbers || sequentialNumbers.length < 2) {
      return true
    }
    return sequentialNumbers[0] >= sequentialNumbers[1]
  }

  /** 设置自动连播按钮状态（位于右上角） */
  protected async setupAutoPlay_SwitchBtn(enableAutoplay: boolean) {
    sq(() => {
      try {
        const app = document.getElementById('app')
        const vueInstance = getVueData(app)
        vueInstance.setContinuousPlay(enableAutoplay)
        return true
      } catch (e) {
        logger.debug(`${this.constructor.name}：设置自动连播按钮状态发生错误，错误信息：${e}`)
        return false
      }
    })
  }

  /** 设置番剧自动连播状态 */
  protected async setupAutoPlay_Player(enableAutoplay: boolean) {
    const selector = enableAutoplay
      ? '.bpx-player-ctrl-setting-handoff input[type="radio"][value="0"]'
      : '.bpx-player-ctrl-setting-handoff input[type="radio"][value="2"]'
    const radio = (await select(selector)) as HTMLInputElement

    if (radio === null) {
      logger.error(`${this.constructor.name}：未找到对应的播放方式按钮`)
    }
    radio.click()
  }

  // #endregion
}
