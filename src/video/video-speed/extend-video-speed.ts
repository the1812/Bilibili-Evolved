export const getExtraSpeedMenuItemElements = async () => {
  const { VideoSpeedController } = await import("./video-speed-controller")

  const stepValue = 0.5
  const minValue = 0.0625
  const maxValue = 16

  const getRecommandedValue = () => VideoSpeedController.supportedRates.slice(-1)[0] + stepValue

  const createExtendedSpeedMenuItemElement = (rate: number) => {
    const li = document.createElement("li")
    li.innerText = VideoSpeedController.formatSpeedText(rate)
    li.classList.add(VideoSpeedController.classNameMap.speedMenuItem, "extended")
    li.dataset.value = rate.toString()

    const i = document.createElement("i")
    i.classList.add("mdi", "mdi-close-circle")
    i.addEventListener("click", () => {
      settings.extendVideoSpeedList = _.pull(settings.extendVideoSpeedList, rate)
      li.remove()
    })

    li.append(i)

    return li
  }

  const createAddEntryElement = () => {
    const updateInput = (elem: HTMLInputElement) => {
      const value = getRecommandedValue().toString()
      elem.setAttribute("min", value)
      elem.value = value
    }

    const li = document.createElement("li")
    li.classList.add(VideoSpeedController.classNameMap.speedMenuItem)

    const iconElement = document.createElement("i")
    iconElement.classList.add("mdi", "mdi-playlist-plus")

    const input = document.createElement("input")
    input.setAttribute("type", "number")
    input.setAttribute("max", maxValue.toString())
    input.setAttribute("step", stepValue.toString())
    updateInput(input)
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        const value = parseFloat(input.value)
        if (!isFinite(value)) {
          logError("无效的倍数值")
          return false
        }
        if (value < minValue) {
          logError("倍数值太小了")
          return false
        }
        if (value > maxValue) {
          logError("倍数值太大了")
          return false
        }
        if (VideoSpeedController.supportedRates.includes(value)) {
          logError("不能重复添加已有的倍数值")
          return false
        }
        settings.extendVideoSpeedList.push(value)
        settings.extendVideoSpeedList = VideoSpeedController.extendedSupportedRates
        li.after(createExtendedSpeedMenuItemElement(value))
      }
    })

    li.prepend(iconElement, input)

    input.style.display = "none";
    li.addEventListener("mouseenter", () => {
      updateInput(input)
      input.style.display = "inline"
      iconElement.style.display = "none"
    })
    li.addEventListener("mouseleave", () => {
      iconElement.style.display = "inline"
      input.style.display = "none"
    })

    return li
  }

  // 应用样式
  resources.applyStyleFromText(`
  .${VideoSpeedController.classNameMap.speedContainer} .${VideoSpeedController.classNameMap.speedMenuItem}:first-child .mdi-playlist-plus {
    font-size: 1.5em;
  }
  .${VideoSpeedController.classNameMap.speedContainer} .${VideoSpeedController.classNameMap.speedMenuItem}:first-child input {
    background: transparent;
    outline: none;
    width: 100%;
    border: none;
    text-align: center;
  }
  .${VideoSpeedController.classNameMap.speedMenuItem} .mdi-close-circle {
    color: hsla(0,0%,100%,.8);
    display: none;
    position: absolute;
    right: 2px;
  }
  .${VideoSpeedController.classNameMap.speedMenuItem}:hover .mdi-close-circle {
    display: inline;
  }
  .${VideoSpeedController.classNameMap.speedMenuItem} .mdi-close-circle:hover {
    color: var(--theme-color);
    transition: color .3s;
  }
  `, "extendVideoSpeedStyle")

  const elements = VideoSpeedController.extendedSupportedRates
    .map(rate => createExtendedSpeedMenuItemElement(rate))
    .reverse()

  elements.unshift(createAddEntryElement());

  return elements
}

(async () => {
  const { VideoSpeedController } = await import("./video-speed-controller")
  VideoSpeedController.init()
})()
