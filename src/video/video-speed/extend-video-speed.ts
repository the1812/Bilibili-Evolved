export const getExtraSpeedMenuItemElements = async () => {
  const { VideoSpeedController } = await import("./video-speed-controller")

  const getRecommandedValue = () => VideoSpeedController.supportedRates.slice(-1)[0] + 0.5

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
    input.setAttribute("max", "16")  // 这是 Chrome 内核的最大倍数限制，不同浏览器的限制和控制表现可能不一样
    input.setAttribute("step", "0.5")
    updateInput(input)
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        const value = parseFloat(input.value)
        settings.extendVideoSpeedList.push(value)
        settings.extendVideoSpeedList = VideoSpeedController.extendedSupportedRates
        li.after(createExtendedSpeedMenuItemElement(value))
      }
    })

    li.prepend(iconElement, input)

    // 默认情况下隐藏 inputAreaElement
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
