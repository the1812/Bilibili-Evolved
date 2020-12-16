type supportedVideoPlayRates = keyof typeof settings.defaultVideoSpeedList

const getDefaultVideoSpeed = () => parseFloat(settings.defaultVideoSpeed)

const setVideoSpeed = async (speed: supportedVideoPlayRates) => {
  (await SpinQuery.select(`.bilibili-player-video-btn-speed-menu .bilibili-player-video-btn-speed-menu-list[data-value="${speed}"]`))?.click()
}

const getSpeedFromSetting = () => {
  for (const [level, aids] of Object.entries(settings.defaultVideoSpeedList)) {
    if (aids.some(aid => aid === unsafeWindow.aid)) {
      return parseFloat(level)
    }
  }
}

const addSpeedToSetting = (speed: supportedVideoPlayRates, aid: string, force = false) => {
  let aidOldIndex = -1;
  // 如果原来设置中记忆了有关的 aid，就需要先移除它
  for (const aids of Object.values(settings.defaultVideoSpeedList)) {
    aidOldIndex = aids.indexOf(aid)
    if (aidOldIndex !== -1) {
      aids.splice(aidOldIndex, 1)
      break
    }
  }
  // 对于没有被记忆的 aid，并且 force 参数为假就直接返回
  if (aidOldIndex === -1 && !force) {
    return
  }
  // 防止以后 B 站自己加上了别的倍数，有必要的话就重新初始化个数组
  if (!settings.defaultVideoSpeedList[speed]) {
    settings.defaultVideoSpeedList[speed] = []
  }
  // 追加记忆值
  settings.defaultVideoSpeedList[speed].push(aid)
  // 持久化
  settings.defaultVideoSpeedList = settings.defaultVideoSpeedList
}

Observer.videoChange(async () => {
  if (settings.useDefaultVideoSpeed) {
    await setVideoSpeed((getSpeedFromSetting() || getDefaultVideoSpeed()) as supportedVideoPlayRates)
  }
})

SpinQuery.select(".bilibili-player-video-btn-speed-menu").then(value => {
  if (!value) {
    throw "speed menu not found!"
  }
  Observer.all(value, (mutations) => {
    if (!settings.useDefaultVideoSpeed) {
      return
    }
    mutations.forEach(mutation => {
      const selectedSpeedOption = mutation.target as HTMLLIElement;
      if (selectedSpeedOption.classList.contains("bilibili-player-active")) {
        const currentSpeed = parseFloat(selectedSpeedOption.dataset.value || '1')
        if (!unsafeWindow.aid) {
          throw "aid is undefined"
        }
        addSpeedToSetting(currentSpeed as supportedVideoPlayRates, unsafeWindow.aid, currentSpeed !== getDefaultVideoSpeed())
      }
    })
  })
})
