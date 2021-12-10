import { addStyle } from '@/core/style'
import { logError } from '@/core/utils/log'
import {
  calcOrder,
  errorMessageDuration,
  extendedAgent,
  getExtendedSupportedRates,
  formatSpeedText,
  getUniqueAscendingSortList,
  maxValue,
  minValue,
  nativeSupportedRates,
  options,
  stepValue,
  getSupportedRates,
  trimLeadingDot,
} from './utils'

const getRecommendedValue = () => {
  const val = getSupportedRates().slice(-1)[0] + stepValue
  return val > maxValue ? null : val
}

const speedMenuItemClassName = trimLeadingDot(extendedAgent.custom.speedMenuItem.selector)

const createExtendedSpeedMenuItemElement = (rate: number) => {
  const li = document.createElement('li')
  li.innerText = formatSpeedText(rate)
  li.classList.add(speedMenuItemClassName, 'extended')
  li.dataset.value = rate.toString()
  li.style.order = calcOrder(rate)
  const i = document.createElement('i')
  i.classList.add('mdi', 'mdi-close-circle')
  i.addEventListener('click', () => {
    lodash.pull(options.extendList, rate)
    li.remove()
  })
  li.append(i)
  return li
}

const updateInput = (elem: HTMLInputElement) => {
  const recommendedValue = getRecommendedValue()
  elem.setAttribute('min', recommendedValue ? (elem.value = recommendedValue.toString()) : (elem.value = '', minValue.toString()))
}

const createAddEntryElement = () => {
  const li = document.createElement('li')
  li.classList.add(speedMenuItemClassName)
  const iconElement = document.createElement('i')
  iconElement.classList.add('mdi', 'mdi-playlist-plus')
  const input = document.createElement('input')
  input.classList.add('add-speed-entry')
  input.setAttribute('type', 'number')
  input.setAttribute('max', maxValue.toString())
  input.setAttribute('step', stepValue.toString())
  input.setAttribute('title', '增加新的倍速值')
  updateInput(input)
  input.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') {
      const value = parseFloat(input.value)
      if (!isFinite(value)) {
        logError('无效的倍速值', errorMessageDuration)
        return false
      }
      if (value < minValue) {
        logError('倍速值太小了', errorMessageDuration)
        return false
      }
      if (value > maxValue) {
        logError('倍速值太大了', errorMessageDuration)
        return false
      }
      if (getSupportedRates().includes(value)) {
        logError('不能重复添加已有的倍速值', errorMessageDuration)
        return false
      }
      options.extendList.push(value)
      options.extendList = getUniqueAscendingSortList(options.extendList)

      let afterElement = li.nextElementSibling as HTMLLIElement
      while (
        !afterElement.dataset.value
        || (parseFloat(afterElement.dataset.value)
          > nativeSupportedRates.slice(-1)[0]
          && value < parseFloat(afterElement.dataset.value))
      ) {
        afterElement = afterElement.nextElementSibling as HTMLLIElement
      }
      afterElement.before(createExtendedSpeedMenuItemElement(value))
      updateInput(input)
    }
    return true
  })

  li.prepend(iconElement, input)

  input.style.display = 'none'
  li.addEventListener('mouseenter', () => {
    updateInput(input)
    input.style.display = 'inline'
    iconElement.style.display = 'none'
    input.focus()
  })
  li.addEventListener('mouseleave', () => {
    iconElement.style.display = 'inline'
    input.style.display = 'none'
  })

  return li
}

export const getExtraSpeedMenuItemElements = async () => {
  // 应用样式
  addStyle(`
  ${extendedAgent.custom.speedContainer.selector} ${extendedAgent.custom.speedMenuItem.selector}:first-child .mdi-playlist-plus {
    font-size: 1.5em;
  }
  ${extendedAgent.custom.speedContainer.selector} ${extendedAgent.custom.speedMenuItem.selector}:first-child input {
    font-size: inherit;
    color: inherit;
    line-height: inherit;
    background: transparent;
    outline: none;
    width: 100%;
    border: none;
    text-align: center;
  }
  ${extendedAgent.custom.speedMenuItem.selector} .mdi-close-circle {
    color: inherit;
    opacity: 0.5;
    display: none;
    position: absolute;
    right: 4px;
  }
  ${extendedAgent.custom.speedMenuItem.selector}:not(${extendedAgent.custom.active.selector}):hover .mdi-close-circle {
    display: inline;
  }
  ${extendedAgent.custom.speedMenuItem.selector} .mdi-close-circle:hover {
    opacity: 1;
    transition: all .3s;
  }
  /* https://stackoverflow.com/a/4298216 */
  /* Chrome */
  .add-speed-entry::-webkit-outer-spin-button,
  .add-speed-entry::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  /* Firefox */
  .add-speed-entry[type=number] {
    -moz-appearance:textfield;
  }
  ${extendedAgent.custom.speedMenuList.selector} {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: 360px;
  }
  `, 'extend-video-speed-style')

  const elements = getExtendedSupportedRates()
    .map(rate => createExtendedSpeedMenuItemElement(rate))
    .reverse()

  elements.unshift(createAddEntryElement())

  return elements
}
