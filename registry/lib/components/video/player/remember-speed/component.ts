import { Toast } from '@/core/toast'
import { EntrySpeedComponent, VideoIdObject } from '../common/speed'
import { NoSuchSpeedMenuItemElementError, SpeedContext } from '../common/speed/context'
import { formatSpeedText } from '../common/speed/utils'

export type Options = {
  /** 全局倍速 */
  globalSpeed: number
  /** 固定全局倍速 */
  fixGlobalSpeed: boolean
  /** 独立记忆倍速 */
  individualRemember: boolean
  /** 独立记忆倍速记录 */
  individualRememberRecord: Record<string, (string | number)[]>
  /** 弹出还原倍速提示 */
  showRestoreTip: boolean
}

export class RememberSpeedComponent extends EntrySpeedComponent<Options> {
  static readonly getAid = (aid = unsafeWindow.aid) => {
    if (!aid) {
      throw new Error('aid is unknown')
    }
    return aid
  }

  protected static readonly aidComparator = (a: string | number, b: string | number) =>
    a.toString() === b.toString()

  getSpeedContextMixin({
    videoIdObject,
    set,
    reset: originReset,
    toggle,
    getActiveVideoSpeed,
    getOldActiveVideoSpeed,
  }: SpeedContext): Partial<SpeedContext> {
    const reset = async () => {
      const restoredVideoSpeed = this.getRestoredVideoSpeed(videoIdObject)
      await set(restoredVideoSpeed ?? 1)
    }
    return {
      reset,
      // 当固定全局倍速且不开启独立记忆的情况下，普通的切换操作是在全局倍速与上一次倍速之间切换
      // 否则，就是在 1.0x 倍速与上一次倍速之间切换
      toggle: async (...args) => {
        const [legacyOrOffset, ...restArgs] = args
        // seek 用法，使用原 toggle 实现
        if (legacyOrOffset != null && typeof legacyOrOffset !== 'boolean') {
          toggle(legacyOrOffset, ...restArgs)
          return
        }
        const { fixGlobalSpeed, individualRemember, globalSpeed } = this.options
        const individualFixGlobalSpeed = fixGlobalSpeed && !individualRemember

        if (
          legacyOrOffset ||
          getActiveVideoSpeed() === (individualFixGlobalSpeed ? globalSpeed : 1)
        ) {
          await set(getOldActiveVideoSpeed())
          return
        }

        await (individualFixGlobalSpeed ? reset() : originReset())
      },
    }
  }

  protected migrate() {
    type MinedOptions = Partial<Options> & {
      speed?: number
      individualRememberList?: Record<string, (number | string)[]>
      remember?: boolean
    }
    const { options }: { options: MinedOptions } = this.settings
    let flag = false
    if (options.speed) {
      options.globalSpeed = +options.speed || 1
      delete options.speed
      flag = true
    }
    if (options.individualRememberList) {
      options.individualRememberRecord = lodash.cloneDeep(options.individualRememberList)
      delete options.individualRememberList
      flag = true
    }
    if (flag) {
      options.fixGlobalSpeed = false
      options.showRestoreTip = true
      delete options.remember
      Toast.show(
        '「扩展倍速」和倍速快捷键插件成为独立的组件或插件啦！详情请阅读组件描述.（此弹出提醒仅显示一次）',
        '【记忆倍速】迁移提醒',
        8e3,
      )
    }
  }

  onSpeedContext({ videoSpeedChange$, videoIdObject }: SpeedContext) {
    // 如果开启「独立记忆倍速」，则同时开启「固定全局倍速」
    this.options.individualRemember$.subscribe(value => {
      if (value) {
        this.options.fixGlobalSpeed = true
      }
    })
    // 如果关闭「固定全局倍速」，则同时关闭「独立记忆倍速」
    this.options.fixGlobalSpeed$.subscribe(value => {
      if (!value) {
        this.options.individualRemember = false
      }
    })
    const restoredVideoSpeed = this.getRestoredVideoSpeed(videoIdObject)
    // 在用户第一次使用倍速记忆功能时，restoredVideoSpeed 可能为空
    if (restoredVideoSpeed) {
      // 还原记忆的倍速值
      requestIdleCallback(async () => {
        try {
          await this.setVideoSpeed(restoredVideoSpeed, 1000)
          if (this.options.showRestoreTip) {
            let msg = `已还原到 ${formatSpeedText(restoredVideoSpeed)} 倍速`
            if (this.options.individualRemember && this.matchRememberSpeed() != null) {
              msg = `【独立倍速视频】${msg}`
            }
            Toast.info(msg, this.metadata.displayName, 3000)
          }
        } catch (err) {
          const toastTitle = `${this.metadata.displayName} - 倍速还原操作失败`
          const toastContent =
            err instanceof NoSuchSpeedMenuItemElementError
              ? `没有 ${err.formattedSpeed} 这样的倍速项`
              : String(err)
          Toast.error(toastContent, toastTitle, 5000)
          console.error(err)
        }
      })
    }

    videoSpeedChange$.subscribe(value => {
      if (!this.settings.enabled) {
        return
      }
      // 记忆倍速值
      if (this.options.individualRemember) {
        // 仅当被设定的倍速不等于全局记忆倍速时，才作为新的视频级别倍速记忆
        if (value !== +this.options.globalSpeed) {
          this.rememberSpeed(value)
        }
      } else if (!this.options.fixGlobalSpeed) {
        this.rememberSpeed(value, null)
      }
    })
  }

  protected getRestoredVideoSpeed(videoIdObject: VideoIdObject) {
    // 按以下优先级尝试获取需要还原的倍速值
    // - 如果启用了“分视频记忆（individualRemember）”，则使用当前视频相应的记忆倍速值（如果有）
    // - 使用“全局记忆值（speed）”
    return (
      (this.options.individualRemember && this.matchRememberSpeed(videoIdObject.aid)) ||
      this.readGlobalVideoSpeed()
    )
  }

  /**
   * 读取全局记忆的倍速值
   *
   * @returns 全局记忆的倍速值
   */
  readGlobalVideoSpeed() {
    return parseFloat(String(this.options.globalSpeed))
  }

  /**
   * 根据 aid 匹配记忆的倍速（用于区分视频记忆倍速的情形）
   *
   * @param aid 欲匹配的 aid，缺省情况下取当前页面视频的 aid
   * @returns 匹配的相应记忆倍速
   */
  matchRememberSpeed(aid?: string) {
    for (const [level, aids] of Object.entries(this.options.individualRememberRecord)) {
      if (aids.some(aid_ => aid_.toString() === RememberSpeedComponent.getAid(aid).toString())) {
        return parseFloat(level)
      }
    }
    return null
  }

  /**
   * 记忆指定倍速
   *
   * @param speed 要记忆的倍速
   * @param aid 要针对性记忆的 aid 或 aid 数组，若不指定则从页面中自动获取，若指定为 `null`，则将 `speed` 参数以全局倍速值记忆
   */
  rememberSpeed(speed: number, aid?: string | string[] | null) {
    // 全局记忆
    if (lodash.isNull(aid)) {
      this.options.globalSpeed = speed
      return
    }
    // 针对特定视频/当前视频记忆
    if (lodash.isUndefined(aid)) {
      aid = RememberSpeedComponent.getAid(aid)
    }
    const aidList = lodash.castArray(aid)
    this.forgetSpeed(aidList)
    this.options.individualRememberRecord = {
      ...this.options.individualRememberRecord,
      [speed]: lodash.unionWith(
        this.options.individualRememberRecord[speed],
        aidList,
        RememberSpeedComponent.aidComparator,
      ),
    }
  }

  /**
   * 忘记对指定 aid 记忆的倍速，返回值表示指定的 aid 之前是否被记忆
   *
   * @param aid 要忘记的 aid 或 aid 数组，若不指定则从页面中自动获取
   */
  forgetSpeed(aid?: string | string[]) {
    if (lodash.isNil(aid)) {
      aid = RememberSpeedComponent.getAid(aid)
    }

    const aidList = lodash.castArray(aid)

    this.options.individualRememberRecord = lodash(this.options.individualRememberRecord)
      .mapValues(aids =>
        lodash(aids)
          .pullAllWith(aidList, RememberSpeedComponent.aidComparator)
          .uniqWith(RememberSpeedComponent.aidComparator) // 避免重复的项目
          .value(),
      )
      .pickBy((v: (string | number)[]) => v.length) // 避免留下无用的空数组
      .value()
  }
}
