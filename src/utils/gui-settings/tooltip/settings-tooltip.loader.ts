function extractKey(listItem: Element) {
  const input = listItem.querySelector("input")
  if (input) {
    return input.getAttribute("key")
  }
  return null
}
export const loadTooltip = async () => {
  resources.applyStyle("settingsTooltipStyle")
  const { toolTips } = await import(`settings-tooltip.${getI18nKey()}`)
  const tooltip = await SpinQuery.select(".gui-settings-tooltip")
  if (!tooltip) {
    return
  }
  document.querySelectorAll(".gui-settings-content>ul>li").forEach(element => {
    let timeout: number
    element.addEventListener("mouseover", () => {
      const key = extractKey(element)
      if (key === null || toolTips === null) {
        return
      }
      const tipText = toolTips.get(key)
      const title = Resource.displayNames[key]
      const tip = title ? /* html */`
        <div class="tooltip-title">${title}</div><div class="tooltip-content">${tipText}</div>
      `.trim() : tipText
      timeout = window.setTimeout(() => tooltip.innerHTML = tipText ? tip : '', 300)
      // if (tipText !== undefined) {
        // tooltip.classList.add("show")
      // }
    })
    element.addEventListener("mouseout", () => {
      clearTimeout(timeout)
      // tooltip.classList.remove("show")
    })
  })
}
export default {
  export: {
    loadTooltip
  }
}
