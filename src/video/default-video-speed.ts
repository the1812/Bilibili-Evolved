const getDefaultVideoSpeed = () => parseFloat(settings.defaultVideoSpeed)

const setVideoSpeed = async (speed: number) => {
  (await SpinQuery.select(`.bilibili-player-video-btn-speed-menu .bilibili-player-video-btn-speed-menu-list[data-value="${speed}"]`))?.click()
}

const getSpeedFromSetting = () => {
  for (const [level, aids] of Object.entries(settings.defaultVideoSpeedList)) {
    if (aids.some(aid => aid === unsafeWindow.aid)) {
      return parseFloat(level)
    }
  }
}

const addSpeedToSetting = (speed: number, aid: string, force = false) => {
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
  // 为新的速度值初始化相应的 aid 数组
  if (!settings.defaultVideoSpeedList[speed]) {
    settings.defaultVideoSpeedList[speed] = []
  }
  // 追加记忆值
  settings.defaultVideoSpeedList[speed].push(aid)
  // 持久化
  settings.defaultVideoSpeedList = settings.defaultVideoSpeedList
}

const setup = _.once(async () => {
  const menu = await SpinQuery.select(".bilibili-player-video-btn-speed-menu")

  if (!menu) {
    throw "speed menu not found!"
  }

  Observer.all(menu, (mutations) => {
    if (!settings.useDefaultVideoSpeed) {
      return
    }
    mutations.forEach(mutation => {
      const selectedSpeedOption = mutation.target as HTMLLIElement
      if (selectedSpeedOption.classList.contains("bilibili-player-active")) {
        const currentSpeed = parseFloat(selectedSpeedOption.dataset.value || '1')
        if (!unsafeWindow.aid) {
          throw "aid is undefined"
        }
        addSpeedToSetting(currentSpeed, unsafeWindow.aid, currentSpeed !== getDefaultVideoSpeed())
      }
    })
  })
})

Observer.videoChange(async () => {
  await setup()
  if (settings.useDefaultVideoSpeed) {
    await setVideoSpeed((getSpeedFromSetting() || getDefaultVideoSpeed()))
  }
})
