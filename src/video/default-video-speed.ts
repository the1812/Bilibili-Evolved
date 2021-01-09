const instanceMap = new Map<HTMLElement, VideoSpeedController>()

export class VideoSpeedController {
  static readonly classNameMap = {
    speedMenuList: "bilibili-player-video-btn-speed-menu",
    speedMenuItem: "bilibili-player-video-btn-speed-menu-list",
    speedNameBtn: "bilibili-player-video-btn-speed-name",
    speedContainer: "bilibili-player-video-btn-speed",
    active: "bilibili-player-active",
    show: "bilibili-player-speed-show",
    video: "bilibili-player-video"
  }
  static readonly nativeSupportedRates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
  static get extendedSupportedRates() {
    if (typeof settings.extendVideoSpeed === "boolean") {
      return settings.extendVideoSpeed ? [2.5, 3.0] : []
    }
    return settings.extendVideoSpeed
  }
  // 扩展倍数不支持热重载
  static readonly supportedRates = [...VideoSpeedController.nativeSupportedRates, ...VideoSpeedController.extendedSupportedRates]

  /**
   * 获取后备默认速度
   */
  static get fallbackVideoSpeed() {
    // 向下兼容，原本 settings.defaultVideoSpeed 被设计为 string 类型，用于存储全局倍数
    return parseFloat(settings.defaultVideoSpeed)
  }

  static formatSpeedText(speed: number) {
    if (speed === 1) {
      return "倍数"
    }
    return Math.trunc(speed) === speed ? `${speed}.0x` : `${speed}x`
  }

  static getRememberSpeed(aid?: string) {
    for (const [level, aids] of Object.entries(settings.rememberVideoSpeedList)) {
      if (aids.some(aid_ => aid_ === getAid(aid))) {
        return parseFloat(level)
      }
    }
  }

  /**
   * 忘记对指定 aid 记忆的倍速，返回值表示指定的 aid 之前是否被记忆
   * 
   * @param aid 要忘记的 aid，若不指定则从页面中自动获取
   */
  static forgetSpeed(aid?: string) {
    aid = getAid(aid)

    let aidOldIndex = -1
    for (const aids of Object.values(settings.rememberVideoSpeedList)) {
      aidOldIndex = aids.indexOf(aid)
      if (aidOldIndex !== -1) {
        aids.splice(aidOldIndex, 1)
        break
      }
    }
    // 持久化
    settings.rememberVideoSpeedList = settings.rememberVideoSpeedList

    return aidOldIndex !== -1
  }

  /**
   * 为指定 aid 记忆指定倍数
   * 
   * @param speed 要记忆的倍数
   * @param force 对于之前没有被记忆的 aid，**如果不将此参数设置为 `true`，调用完成也不会将相应的倍数记忆到设置中的**
   * @param aid 要记忆的 aid，若不指定则从页面中自动获取
   */
  static rememberSpeed(speed: number, force = false, aid?: string) {
    aid = getAid(aid)
    const remembered = VideoSpeedController.forgetSpeed(aid)
    // 对于没有被记忆的 aid，并且 force 参数为假就直接返回
    if (!remembered && !force) {
      return
    }
    // 为新的速度值初始化相应的 aid 数组
    if (!settings.rememberVideoSpeedList[speed]) {
      settings.rememberVideoSpeedList[speed] = []
    }
    // 追加记忆值
    settings.rememberVideoSpeedList[speed].push(aid)
    // 持久化
    settings.rememberVideoSpeedList = settings.rememberVideoSpeedList
  }

  private _containerElement: HTMLElement
  private _menuListElement: HTMLElement
  private _nameBtn: HTMLButtonElement
  private _videoElement: HTMLVideoElement
  // 这个值模拟原生内部记录的速度倍数，它不应该被赋值成扩展倍数的值
  private _nativeSpeedVal: number
  private _previousSpeedVal: number

  constructor(containerElement: HTMLElement, videoElement: HTMLVideoElement, nativeSpeedVal: number = 1) {
    const controller = instanceMap.get(containerElement)
    if (controller) {
      return controller
    }

    this._containerElement = containerElement
    this._videoElement = videoElement
    this._previousSpeedVal = this._nativeSpeedVal = nativeSpeedVal
    this._nameBtn = this._containerElement.querySelector(`.${VideoSpeedController.classNameMap.speedNameBtn}`) as HTMLButtonElement
    this._menuListElement = this._containerElement.querySelector(`.${VideoSpeedController.classNameMap.speedMenuList}`) as HTMLElement

    instanceMap.set(containerElement, this)
  }

  get playbackRate() {
    return this._videoElement.playbackRate
  }

  get nativeSpeedVal() {
    return this._nativeSpeedVal
  }

  getSpeedMenuItem(speed: number): HTMLElement;
  getSpeedMenuItem(speed?: number) {
    if (speed) {
      return this._menuListElement.querySelector(`.${VideoSpeedController.classNameMap.speedMenuItem}[data-value="${speed}"]`)
    }
    return this._menuListElement.querySelector(`.${VideoSpeedController.classNameMap.speedMenuItem}.${VideoSpeedController.classNameMap.active}`)
  }

  // 观察倍数菜单，用于触发事件，记忆选定的倍数
  observe() {
    Observer.all(this._menuListElement, (mutations) => {
      let [previousSpeed, currentSpeed] = [1, 1]
      // 遍历所有的 mutations，获取上一个倍数值和当前倍数值（真正意义上的）
      mutations.forEach(mutation => {
        const selectedSpeedOption = mutation.target as HTMLLIElement

        if (!selectedSpeedOption.classList.contains(VideoSpeedController.classNameMap.active)) {
          previousSpeed = parseFloat(selectedSpeedOption.dataset.value ?? '1')
          return
        }

        currentSpeed = parseFloat(selectedSpeedOption.dataset.value ?? '1')

        this._containerElement.dispatchEvent(new CustomEvent("changed", { detail: { speed: currentSpeed, previousSpeed: this._previousSpeedVal } }))

        if (VideoSpeedController.nativeSupportedRates.includes(currentSpeed)) {
          this._nativeSpeedVal = currentSpeed
          this._containerElement.dispatchEvent(new CustomEvent("native-speed-changed", { detail: { speed: this._nativeSpeedVal, previousSpeed: this._previousSpeedVal } }))
        }
        // 原生支持倍数的应用后，有必要清除扩展倍数选项上的样式
        if (settings.extendVideoSpeed && VideoSpeedController.nativeSupportedRates.includes(currentSpeed)) {
          this._menuListElement.querySelector(`.${VideoSpeedController.classNameMap.speedMenuItem}.extended.${VideoSpeedController.classNameMap.active}`)?.classList.remove(VideoSpeedController.classNameMap.active)
        }
        // 记忆
        // - `useDefaultVideoSpeed` 表示是否启用记忆
        // - `rememberVideoSpeed` 表示是否启用细化到视频级别的记忆
        if (settings.useDefaultVideoSpeed) {
          if (settings.rememberVideoSpeed) {
            VideoSpeedController.rememberSpeed(currentSpeed, currentSpeed !== VideoSpeedController.fallbackVideoSpeed)
          } else {
            settings.defaultVideoSpeed = currentSpeed.toString()
          }
        }
      })
      // 刷新 this._previousSpeedVal
      // 用户可以通过倍数菜单或者重置倍数快捷键造成类似 2.0x 1.0x 1.0x ... 这样的倍数设定序列
      // 我们不希望在第二个 1.0x 的时候刷新 this._previousSpeedVal，这样会比较死板
      // 判定依据在于 previousSpeed !== currentSpeed
      if (previousSpeed !== currentSpeed) {
        this._previousSpeedVal = previousSpeed
      }
    })
  }

  extendMenuItem() {
    // 如果开启了扩展倍数，存在一种场景使倍数设置会失效：
    //   1. 用户从原生支持的倍数切换到扩展倍数
    //   2. 用户从扩展倍数切换到之前选中的原生倍数
    // 这是因为播放器内部实现维护了一个速度值，但是在切换到扩展倍数时没法更新，因此切换回来的时候被判定没有发生变化
    // 为了解决这个问题，需要通过 forceUpdate 方法替官方更新元素，并为视频设置正确的倍数，并关闭菜单
    this._menuListElement.addEventListener("click", (ev) => {
      const option = (ev.target as HTMLElement)
      const value = parseFloat(option.dataset.value as string)
      if ((ev.target as HTMLElement).classList.contains("extended")) {
        this.setExtendedVideoSpeed(value)
      }
      // 从扩展倍数切换到之前选中的原生倍数
      if (VideoSpeedController.extendedSupportedRates.includes(this.playbackRate) && this._nativeSpeedVal === value) {
        this.forceUpdate(value)
      }
    })
    // 添加扩展的倍数选项
    for (const rate of VideoSpeedController.extendedSupportedRates) {
      const li = document.createElement("li")
      li.innerText = VideoSpeedController.formatSpeedText(rate)
      li.classList.add(VideoSpeedController.classNameMap.speedMenuItem, "extended")
      li.dataset.value = rate.toString()
      this._menuListElement.prepend(li)
    }
  }

  toggleVideoSpeed() {
    this.setVideoSpeed(this._previousSpeedVal)
  }

  reset(forget = false) {
    if (forget) {
      this.setVideoSpeed(VideoSpeedController.fallbackVideoSpeed)
      VideoSpeedController.forgetSpeed()
    } else {
      this.setVideoSpeed(1)
    }
  }

  setVideoSpeed(speed: number) {
    this.getSpeedMenuItem(speed).click()
  }

  private setExtendedVideoSpeed(speed: number) {
    if (VideoSpeedController.nativeSupportedRates.includes(speed)) {
      this.getSpeedMenuItem(speed).click()
    } else {
      this.forceUpdate(speed)
    }
  }

  private forceUpdate(value: number) {
    this._menuListElement.querySelector(`.${VideoSpeedController.classNameMap.speedMenuItem}[data-value="${this.playbackRate}"]`)?.classList.remove(VideoSpeedController.classNameMap.active);
    this._menuListElement.querySelector(`.${VideoSpeedController.classNameMap.speedMenuItem}[data-value="${value}"]`)?.classList.add(VideoSpeedController.classNameMap.active);
    this._videoElement.playbackRate = value
    this._containerElement.classList.remove(VideoSpeedController.classNameMap.show)
    this._nameBtn.innerText = VideoSpeedController.formatSpeedText(value)
  }
}

if (settings.useDefaultVideoSpeed || settings.extendVideoSpeed) {
  // 分 P 切换时共享同一个倍数
  let nativeSpeedVal = 1

  Observer.videoChange(async () => {
    const containerElement = await SpinQuery.select(`.${VideoSpeedController.classNameMap.speedContainer}`)
    const videoElement = await SpinQuery.select(`.${VideoSpeedController.classNameMap.video} video`)

    if (!containerElement) {
      throw "speed container element not found!"
    }
    if (!videoElement) {
      throw "video element not found!"
    }
    // 有必要传递之前的 nativeSpeedVal，跨分 P 时原生倍数将保持一样
    const controller = new VideoSpeedController(containerElement, videoElement as HTMLVideoElement, nativeSpeedVal)

    controller.observe()

    if (settings.extendVideoSpeed) {
      controller.extendMenuItem()
      containerElement.addEventListener("native-speed-changed", (ev: CustomEvent) => {
        nativeSpeedVal = ev.detail.speed
      })
    }
    // 首次加载可能会遇到意外情况，导致内部强制更新失效，因此延时 100 ms 再触发速度设置
    setTimeout(() => {
      settings.useDefaultVideoSpeed &&
        controller.setVideoSpeed((settings.rememberVideoSpeed && VideoSpeedController.getRememberSpeed()) || VideoSpeedController.fallbackVideoSpeed)
    }, 100)
  })
}
