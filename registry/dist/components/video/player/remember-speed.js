/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["video/player/remember-speed"] = factory();
	else
		root["video/player/remember-speed"] = factory();
})(self, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./registry/lib/components/video/player/remember-speed/controller.ts":
/*!***************************************************************************!*\
  !*** ./registry/lib/components/video/player/remember-speed/controller.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"createController\": function() { return /* binding */ createController; }\n/* harmony export */ });\n/* harmony import */ var _components_video_player_agent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/components/video/player-agent */ \"@/components/video/player-agent\");\n/* harmony import */ var _components_video_player_agent__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_components_video_player_agent__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _core_observer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/core/observer */ \"@/core/observer\");\n/* harmony import */ var _core_observer__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_core_observer__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ \"./registry/lib/components/video/player/remember-speed/utils.ts\");\n\n\n\nconst activeClassName = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.trimLeadingDot)(_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.active.selector);\nconst showClassName = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.trimLeadingDot)(_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.show.selector); // 原生倍速，应该与官方播放器内部维护的值保持一致\n\nlet nativeSpeed; // 分 P 切换时共享前一个倍速，这里指定初始倍速可以是 undefined，不需要是 1\n\nlet sharedPreviousSpeed; // 分 P 切换时共享同一个倍速，这里指定初始倍速可以是 undefined，不需要是 1\n\nlet sharedSpeed; // 分 P 切换时共享同一个原生倍速值，初始值设置为 1\n\nlet sharedNativeSpeed = 1;\nlet containerElement;\nlet menuListElement;\nlet videoElement;\nlet nameBtn;\n\nconst getRememberSpeed = aid => {\n  for (const [level, aids] of Object.entries(_utils__WEBPACK_IMPORTED_MODULE_2__.options.individualRememberList)) {\n    if (aids.some(aid_ => aid_.toString() === (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getAid)(aid).toString())) {\n      return parseFloat(level);\n    }\n  }\n\n  return null;\n};\n\nconst getFallbackVideoSpeed = () => {\n  // 如果组件被启用才使用存储的后备值\n  if (_utils__WEBPACK_IMPORTED_MODULE_2__.options.remember) {\n    return parseFloat(_utils__WEBPACK_IMPORTED_MODULE_2__.options.speed);\n  }\n\n  return null;\n};\n/**\r\n * 忘记对指定 aid 记忆的倍速，返回值表示指定的 aid 之前是否被记忆\r\n *\r\n * @param aid 要忘记的 aid，若不指定则从页面中自动获取\r\n */\n\n\nconst forgetSpeed = aid => {\n  aid = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getAid)(aid);\n  let aidOldIndex = -1;\n\n  for (const aids of Object.values(_utils__WEBPACK_IMPORTED_MODULE_2__.options.individualRememberList)) {\n    aidOldIndex = aids.indexOf(aid);\n\n    if (aidOldIndex !== -1) {\n      aids.splice(aidOldIndex, 1);\n      break;\n    }\n  }\n\n  return aidOldIndex !== -1;\n};\n/**\r\n * 为指定 aid 记忆指定倍速\r\n *\r\n * @param speed 要记忆的倍速\r\n * @param force 对于之前没有被记忆的 aid，**如果不将此参数设置为 `true`，调用完成也不会将相应的倍速记忆到设置中的**\r\n * @param aid 要记忆的 aid，若不指定则从页面中自动获取\r\n */\n\n\nconst rememberSpeed = (speed, force = false, aid) => {\n  aid = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getAid)(aid);\n  const remembered = forgetSpeed(aid); // 对于没有被记忆的 aid，并且 force 参数为假就直接返回\n\n  if (!remembered && !force) {\n    return;\n  } // 为新的速度值初始化相应的 aid 数组\n\n\n  if (!_utils__WEBPACK_IMPORTED_MODULE_2__.options.individualRememberList[speed]) {\n    _utils__WEBPACK_IMPORTED_MODULE_2__.options.individualRememberList[speed] = [];\n  } // 追加记忆值\n\n\n  _utils__WEBPACK_IMPORTED_MODULE_2__.options.individualRememberList[speed].push(aid);\n};\n\nconst getSpeedMenuItem = speed => menuListElement.querySelector(`${_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedMenuItem.selector}[data-value=\"${speed}\"]`);\n/**\r\n * 设置视频倍速值，将返回当前的倍速\r\n *\r\n * @param speed 欲设置的倍速值\r\n */\n\n\nconst videoSpeed = speed => {\n  if (speed) {\n    getSpeedMenuItem(speed)?.click();\n    return speed;\n  }\n\n  return videoElement.playbackRate;\n};\n\nconst setVideoSpeed = videoSpeed;\n/**\r\n * 重置视频倍速\r\n *\r\n * @param withForget 是否为附带清除视频记忆的重置倍速操作\r\n */\n\nconst resetVideoSpeed = (withForget = false) => {\n  if (withForget) {\n    const fallbackVideoSpeed = getFallbackVideoSpeed(); // 如果 fallbackVideoSpeed 是 undefined，那么意味着没有开启记忆倍速功能\n    // 考虑到与清除视频级别的倍速记忆功能的相关性，这里会忽略设定\n    // 简单地说，如果没有开启记忆倍速的功能，就无法清除视频级别的倍速记忆\n\n    if (!fallbackVideoSpeed) {\n      return;\n    }\n\n    forgetSpeed();\n    setVideoSpeed(fallbackVideoSpeed);\n  } else {\n    setVideoSpeed(1);\n  }\n};\n/**\r\n * 切换当前倍速\r\n *\r\n * 根据`mode`参数的不同有着不同的行为：\r\n *\r\n * - `mode === \"smart\"`（默认）：当前倍速等于 1.0x 时，切换到上次不同的视频倍速，否则重置倍速为 1.0x\r\n * - `mode === \"classic\"`：无论当前倍速如何，均切换到上次不同的视频倍速\r\n *\r\n * 重置倍速的行为可由 `reset()` 方法同款参数 `forget` 来控制\r\n *\r\n * @param forget 指示是否为清除视频记忆的重置倍速操作\r\n */\n\n\nconst toggleVideoSpeed = (mode = 'smart', forget = false) => {\n  switch (mode) {\n    case 'smart':\n      videoSpeed() === 1 ? videoSpeed(sharedPreviousSpeed) : resetVideoSpeed(forget);\n      break;\n\n    case 'classic':\n      setVideoSpeed(sharedPreviousSpeed);\n      break;\n\n    default:\n      break;\n  }\n};\n\nconst forceUpdate = value => {\n  menuListElement.querySelector(`${_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedMenuItem.selector}[data-value=\"${videoSpeed()}\"]`)?.classList.remove(activeClassName);\n  videoElement.playbackRate = value;\n  menuListElement.querySelector(`${_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedMenuItem.selector}[data-value=\"${value}\"]`)?.classList.add(activeClassName);\n  containerElement.classList.remove(showClassName);\n  nameBtn.innerText = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.formatSpeedText)(value);\n};\n\nconst setExtendedVideoSpeed = speed => {\n  if (_utils__WEBPACK_IMPORTED_MODULE_2__.nativeSupportedRates.includes(speed)) {\n    getSpeedMenuItem(speed)?.click();\n  } else {\n    forceUpdate(speed);\n  }\n};\n\nconst extendList = async () => {\n  const {\n    getExtraSpeedMenuItemElements\n  } = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./extend */ \"./registry/lib/components/video/player/remember-speed/extend.ts\"));\n  menuListElement.prepend(...(await getExtraSpeedMenuItemElements())); // 为所有原生倍速菜单项设置 Order\n\n  menuListElement.querySelectorAll(`${_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedMenuItem.selector}[data-value]:not(.extended)`).forEach(it => {\n    it.style.order = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.calcOrder)(parseFloat(it.getAttribute('data-value') ?? '1'));\n  }); // 如果开启了扩展倍速，存在一种场景使倍速设置会失效：\n  //   1. 用户从原生支持的倍速切换到扩展倍速\n  //   2. 用户从扩展倍速切换到之前选中的原生倍速\n  // 这是因为播放器内部实现维护了一个速度值，但是在切换到扩展倍速时没法更新，因此切换回来的时候被判定没有发生变化\n  // 为了解决这个问题，需要通过 forceUpdate 方法替官方更新元素，并为视频设置正确的倍速，最后关闭菜单\n\n  (0,_utils__WEBPACK_IMPORTED_MODULE_2__.addListener)(menuListElement, ['click', ev => {\n    const option = ev.target;\n    const value = parseFloat(option.dataset.value);\n\n    if (ev.target.classList.contains('extended')) {\n      setExtendedVideoSpeed(value);\n    } // 从扩展倍速切换到之前选中的原生倍速：强制更新！\n\n\n    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.getExtendedSupportedRates)().includes(videoSpeed()) && nativeSpeed === value) {\n      forceUpdate(value);\n    }\n  }]);\n};\n\nconst extendListIfAllow = async () => {\n  // 1. 根据 options 判断是否允许扩展倍速列表\n  // 2. 如果已经打过标志 classname 的话，就不能再塞更多元素了\n  if (!_utils__WEBPACK_IMPORTED_MODULE_2__.options.extend || containerElement.classList.contains('extended')) {\n    return;\n  }\n\n  await extendList();\n  containerElement.classList.add('extended');\n};\n\nconst addSpeedChangeEventListener = cb => {\n  (0,_utils__WEBPACK_IMPORTED_MODULE_2__.addListener)(menuListElement, ['click', ev => {\n    cb(sharedSpeed, parseFloat(ev.target.dataset.value ?? '1'));\n  }]);\n};\n\nconst dispatchChangedEvent = (previousSpeed, currentSpeed) => {\n  const isNativeSpeed = _utils__WEBPACK_IMPORTED_MODULE_2__.nativeSupportedRates.includes(currentSpeed);\n  containerElement.dispatchEvent(new CustomEvent('changed', {\n    detail: {\n      speed: currentSpeed,\n      isNativeSpeed,\n      previousSpeed\n    }\n  }));\n};\n\nconst createController = _.once(() => {\n  (0,_core_observer__WEBPACK_IMPORTED_MODULE_1__.videoChange)(async () => {\n    // 移除所有监听器\n    (0,_utils__WEBPACK_IMPORTED_MODULE_2__.removeListeners)(); // 重新获取页面元素\n\n    const tmpContainerElement = await _utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedContainer();\n    const tmpVideoElement = await _components_video_player_agent__WEBPACK_IMPORTED_MODULE_0__.playerAgent.query.video.element();\n\n    if (!tmpContainerElement) {\n      throw new Error('speed container element not found!');\n    }\n\n    if (!tmpVideoElement) {\n      throw new Error('video element not found!');\n    }\n\n    containerElement = tmpContainerElement;\n    videoElement = tmpVideoElement;\n    nameBtn = containerElement.querySelector(_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedNameBtn.selector);\n    menuListElement = containerElement.querySelector(_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedMenuList.selector); // 试图插入扩展的倍速菜单项\n\n    await extendListIfAllow(); // 为每一个倍速菜单项附加 dataset\n\n    menuListElement.querySelectorAll(_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedMenuItem.selector).forEach(it => {\n      if (!it.hasAttribute('data-value')) {\n        const speed = parseFloat(it.textContent).toString();\n        it.setAttribute('data-value', speed);\n      }\n    }); // 还原共享值\n\n    nativeSpeed = sharedNativeSpeed; // 添加视频倍数变化监听\n\n    addSpeedChangeEventListener(dispatchChangedEvent); // 视频倍数变化监听处理\n\n    (0,_utils__WEBPACK_IMPORTED_MODULE_2__.addListener)(containerElement, ['changed', ({\n      detail: {\n        speed,\n        isNativeSpeed,\n        previousSpeed\n      }\n    }) => {\n      // 记录（共享）倍速值\n      sharedSpeed = speed;\n\n      if (isNativeSpeed) {\n        sharedNativeSpeed = speed;\n        nativeSpeed = speed;\n      } // 原生支持倍速的应用后，需要清除扩展倍速选项上的样式\n\n\n      if (_utils__WEBPACK_IMPORTED_MODULE_2__.options.extend && _utils__WEBPACK_IMPORTED_MODULE_2__.nativeSupportedRates.includes(speed)) {\n        menuListElement.querySelector(`${_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedMenuItem.selector}.extended${_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.active.selector}`)?.classList.remove(activeClassName);\n      } // 记忆\n      // - `options.remember` 表示是否启用记忆\n      // - `options.individualRemember` 表示是否启用细化到视频级别的记忆\n\n\n      if (_utils__WEBPACK_IMPORTED_MODULE_2__.options.remember) {\n        if (_utils__WEBPACK_IMPORTED_MODULE_2__.options.individualRemember) {\n          rememberSpeed(speed, speed !== getFallbackVideoSpeed());\n        } else {\n          _utils__WEBPACK_IMPORTED_MODULE_2__.options.speed = speed.toString();\n        }\n      } // 刷新 sharedPreviousSpeed\n      // - 用户可以通过倍速菜单或者倍速快捷键造成类似 1.5x 2.0x 2.0x... 这样的倍速设定序列\n      //   我们不希望在第二个 2.0x 的时候刷新 this._previousSpeedVal，这样会比较死板\n      //   判定依据在于 previousSpeed !== speed\n\n\n      if (previousSpeed && previousSpeed !== speed) {\n        sharedPreviousSpeed = previousSpeed;\n      }\n    }]); // 恢复记忆的倍速值\n    // - 首次加载可能会遇到意外情况，导致内部强制更新失效，因此延时 100 ms 再触发速度设置\n\n    setTimeout(() => {\n      setVideoSpeed(_utils__WEBPACK_IMPORTED_MODULE_2__.options.remember && _utils__WEBPACK_IMPORTED_MODULE_2__.options.individualRemember && getRememberSpeed() || getFallbackVideoSpeed() || sharedSpeed);\n    }, 100);\n  });\n  return {\n    getSupportedRates: _utils__WEBPACK_IMPORTED_MODULE_2__.getSupportedRates,\n    getExtendedSupportedRates: _utils__WEBPACK_IMPORTED_MODULE_2__.getExtendedSupportedRates,\n    setVideoSpeed,\n    videoSpeed,\n    getRememberSpeed,\n    rememberSpeed,\n    forgetSpeed,\n    resetVideoSpeed,\n    toggleVideoSpeed\n  };\n});\n\n//# sourceURL=webpack://%5Bname%5D/./registry/lib/components/video/player/remember-speed/controller.ts?");

/***/ }),

/***/ "./registry/lib/components/video/player/remember-speed/extend.ts":
/*!***********************************************************************!*\
  !*** ./registry/lib/components/video/player/remember-speed/extend.ts ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"getExtraSpeedMenuItemElements\": function() { return /* binding */ getExtraSpeedMenuItemElements; }\n/* harmony export */ });\n/* harmony import */ var _core_style__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/core/style */ \"@/core/style\");\n/* harmony import */ var _core_style__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_core_style__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _core_utils_log__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/core/utils/log */ \"@/core/utils/log\");\n/* harmony import */ var _core_utils_log__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_core_utils_log__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ \"./registry/lib/components/video/player/remember-speed/utils.ts\");\n\n\n\n\nconst getRecommendedValue = () => {\n  const val = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getSupportedRates)().slice(-1)[0] + _utils__WEBPACK_IMPORTED_MODULE_2__.stepValue;\n  return val > _utils__WEBPACK_IMPORTED_MODULE_2__.maxValue ? null : val;\n};\n\nconst speedMenuItemClassName = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.trimLeadingDot)(_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedMenuItem.selector);\n\nconst createExtendedSpeedMenuItemElement = rate => {\n  const li = document.createElement('li');\n  li.innerText = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.formatSpeedText)(rate);\n  li.classList.add(speedMenuItemClassName, 'extended');\n  li.dataset.value = rate.toString();\n  li.style.order = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.calcOrder)(rate);\n  const i = document.createElement('i');\n  i.classList.add('mdi', 'mdi-close-circle');\n  i.addEventListener('click', () => {\n    lodash.pull(_utils__WEBPACK_IMPORTED_MODULE_2__.options.extendList, rate);\n    li.remove();\n  });\n  li.append(i);\n  return li;\n};\n\nconst updateInput = elem => {\n  const recommendedValue = getRecommendedValue();\n  elem.setAttribute('min', recommendedValue ? elem.value = recommendedValue.toString() : (elem.value = '', _utils__WEBPACK_IMPORTED_MODULE_2__.minValue.toString()));\n};\n\nconst createAddEntryElement = () => {\n  const li = document.createElement('li');\n  li.classList.add(speedMenuItemClassName);\n  const iconElement = document.createElement('i');\n  iconElement.classList.add('mdi', 'mdi-playlist-plus');\n  const input = document.createElement('input');\n  input.classList.add('add-speed-entry');\n  input.setAttribute('type', 'number');\n  input.setAttribute('max', _utils__WEBPACK_IMPORTED_MODULE_2__.maxValue.toString());\n  input.setAttribute('step', _utils__WEBPACK_IMPORTED_MODULE_2__.stepValue.toString());\n  input.setAttribute('title', '增加新的倍速值');\n  updateInput(input);\n  input.addEventListener('keydown', ev => {\n    if (ev.key === 'Enter') {\n      const value = parseFloat(input.value);\n\n      if (!isFinite(value)) {\n        (0,_core_utils_log__WEBPACK_IMPORTED_MODULE_1__.logError)('无效的倍速值', _utils__WEBPACK_IMPORTED_MODULE_2__.errorMessageDuration);\n        return false;\n      }\n\n      if (value < _utils__WEBPACK_IMPORTED_MODULE_2__.minValue) {\n        (0,_core_utils_log__WEBPACK_IMPORTED_MODULE_1__.logError)('倍速值太小了', _utils__WEBPACK_IMPORTED_MODULE_2__.errorMessageDuration);\n        return false;\n      }\n\n      if (value > _utils__WEBPACK_IMPORTED_MODULE_2__.maxValue) {\n        (0,_core_utils_log__WEBPACK_IMPORTED_MODULE_1__.logError)('倍速值太大了', _utils__WEBPACK_IMPORTED_MODULE_2__.errorMessageDuration);\n        return false;\n      }\n\n      if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.getSupportedRates)().includes(value)) {\n        (0,_core_utils_log__WEBPACK_IMPORTED_MODULE_1__.logError)('不能重复添加已有的倍速值', _utils__WEBPACK_IMPORTED_MODULE_2__.errorMessageDuration);\n        return false;\n      }\n\n      _utils__WEBPACK_IMPORTED_MODULE_2__.options.extendList.push(value);\n      _utils__WEBPACK_IMPORTED_MODULE_2__.options.extendList = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getUniqueAscendingSortList)(_utils__WEBPACK_IMPORTED_MODULE_2__.options.extendList);\n      let afterElement = li.nextElementSibling;\n\n      while (!afterElement.dataset.value || parseFloat(afterElement.dataset.value) > _utils__WEBPACK_IMPORTED_MODULE_2__.nativeSupportedRates.slice(-1)[0] && value < parseFloat(afterElement.dataset.value)) {\n        afterElement = afterElement.nextElementSibling;\n      }\n\n      afterElement.before(createExtendedSpeedMenuItemElement(value));\n      updateInput(input);\n    }\n\n    return true;\n  });\n  li.prepend(iconElement, input);\n  input.style.display = 'none';\n  li.addEventListener('mouseenter', () => {\n    updateInput(input);\n    input.style.display = 'inline';\n    iconElement.style.display = 'none';\n    input.focus();\n  });\n  li.addEventListener('mouseleave', () => {\n    iconElement.style.display = 'inline';\n    input.style.display = 'none';\n  });\n  return li;\n};\n\nconst getExtraSpeedMenuItemElements = async () => {\n  // 应用样式\n  (0,_core_style__WEBPACK_IMPORTED_MODULE_0__.addStyle)(`\n  ${_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedContainer.selector} ${_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedMenuItem.selector}:first-child .mdi-playlist-plus {\n    font-size: 1.5em;\n  }\n  ${_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedContainer.selector} ${_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedMenuItem.selector}:first-child input {\n    font-size: inherit;\n    color: inherit;\n    line-height: inherit;\n    background: transparent;\n    outline: none;\n    width: 100%;\n    border: none;\n    text-align: center;\n  }\n  ${_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedMenuItem.selector} .mdi-close-circle {\n    color: inherit;\n    opacity: 0.5;\n    display: none;\n    position: absolute;\n    right: 4px;\n  }\n  ${_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedMenuItem.selector}:not(${_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.active.selector}):hover .mdi-close-circle {\n    display: inline;\n  }\n  ${_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedMenuItem.selector} .mdi-close-circle:hover {\n    opacity: 1;\n    transition: all .3s;\n  }\n  /* https://stackoverflow.com/a/4298216 */\n  /* Chrome */\n  .add-speed-entry::-webkit-outer-spin-button,\n  .add-speed-entry::-webkit-inner-spin-button {\n    -webkit-appearance: none;\n    margin: 0;\n  }\n  /* Firefox */\n  .add-speed-entry[type=number] {\n    -moz-appearance:textfield;\n  }\n  ${_utils__WEBPACK_IMPORTED_MODULE_2__.extendedAgent.custom.speedMenuList.selector} {\n    display: flex;\n    flex-direction: column;\n    overflow-y: auto;\n    max-height: 360px;\n  }\n  `, 'extend-video-speed-style');\n  const elements = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getExtendedSupportedRates)().map(rate => createExtendedSpeedMenuItemElement(rate)).reverse();\n  elements.unshift(createAddEntryElement());\n  return elements;\n};\n\n//# sourceURL=webpack://%5Bname%5D/./registry/lib/components/video/player/remember-speed/extend.ts?");

/***/ }),

/***/ "./registry/lib/components/video/player/remember-speed/index.ts":
/*!**********************************************************************!*\
  !*** ./registry/lib/components/video/player/remember-speed/index.ts ***!
  \**********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"component\": function() { return /* binding */ component; }\n/* harmony export */ });\n/* harmony import */ var _components_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/components/component */ \"@/components/component\");\n/* harmony import */ var _components_component__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_components_component__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _core_utils_urls__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/core/utils/urls */ \"@/core/utils/urls\");\n/* harmony import */ var _core_utils_urls__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_core_utils_urls__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst componentName = 'rememberVideoSpeed';\nconst component = {\n  name: componentName,\n  displayName: '倍速增强',\n  author: {\n    name: 'JLoeve',\n    link: 'https://github.com/LonelySteve'\n  },\n  description: {\n    'zh-CN': '可以记忆上次选择的视频播放速度, 还可以使用更多倍速来扩展原生倍速菜单.'\n  },\n  tags: [componentsTags.video],\n  urlInclude: _core_utils_urls__WEBPACK_IMPORTED_MODULE_1__.playerUrls,\n  entry: async () => (await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./controller */ \"./registry/lib/components/video/player/remember-speed/controller.ts\"))).createController(),\n  plugin: {\n    displayName: '倍速增强 - 快捷键支持',\n    setup: async ({\n      addData\n    }) => {\n      const {\n        getComponentSettings\n      } = await Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! @/core/settings */ \"@/core/settings\", 23));\n\n      const videoSpeed = async (context, controllerAction) => {\n        // 不要提前导入，插件在组件加载之前进行加载，因此如果提前加载会取不到 entry 调用后返回的对象\n        const controller = (0,_components_component__WEBPACK_IMPORTED_MODULE_0__.importComponent)(componentName);\n        controllerAction(controller, controller.getSupportedRates());\n        context.showTip(`${controller.videoSpeed()}x`, 'mdi-fast-forward');\n      };\n\n      addData('keymap.actions', actions => {\n        actions.videoSpeedIncrease = {\n          displayName: '提高倍速',\n          run: context => {\n            videoSpeed(context, (controller, rates) => {\n              controller.setVideoSpeed(rates.find(it => it > controller.videoSpeed()) || rates[rates.length - 1]);\n            });\n            return true;\n          }\n        };\n        actions.videoSpeedDecrease = {\n          displayName: '降低倍速',\n          run: context => {\n            videoSpeed(context, (controller, rates) => {\n              controller.setVideoSpeed([...rates].reverse().find(it => it < controller.videoSpeed()) || rates[0]);\n            });\n            return true;\n          }\n        };\n        actions.videoSpeedReset = {\n          displayName: '重置倍速',\n          run: context => {\n            videoSpeed(context, controller => {\n              controller.toggleVideoSpeed();\n            });\n            return true;\n          }\n        };\n\n        if (getComponentSettings('rememberVideoSpeed').options.individualRemember) {\n          actions.videoSpeedForget = {\n            displayName: '清除当前倍速记忆',\n            run: context => {\n              videoSpeed(context, controller => {\n                controller.resetVideoSpeed(true);\n              });\n              return true;\n            }\n          };\n        }\n      });\n      addData('keymap.presets', presetBase => {\n        presetBase.videoSpeedIncrease = 'shift > 》 arrowUp';\n        presetBase.videoSpeedDecrease = 'shift < 《 arrowDown';\n        presetBase.videoSpeedReset = 'shift ? ？';\n        presetBase.videoSpeedForget = 'shift : ：';\n      });\n    }\n  },\n  options: {\n    speed: {\n      displayName: '记忆的速度',\n      defaultValue: '1.0',\n      hidden: true\n    },\n    extend: {\n      displayName: '扩展倍速菜单',\n      defaultValue: true\n    },\n    extendList: {\n      displayName: '扩展倍速列表',\n      defaultValue: [2.5, 3],\n      hidden: true\n    },\n    remember: {\n      displayName: '启用倍速记忆',\n      defaultValue: true\n    },\n    individualRemember: {\n      displayName: '各视频分别记忆',\n      defaultValue: false,\n      hidden: true\n    },\n    individualRememberList: {\n      displayName: '分别记忆倍速列表',\n      defaultValue: {},\n      hidden: true\n    }\n  },\n  commitHash: \"48fcf5297ff6ca91ae292ef504f1f0da96f2a995\",\n  coreVersion: \"2.1.2\"\n};\n\n//# sourceURL=webpack://%5Bname%5D/./registry/lib/components/video/player/remember-speed/index.ts?");

/***/ }),

/***/ "./registry/lib/components/video/player/remember-speed/utils.ts":
/*!**********************************************************************!*\
  !*** ./registry/lib/components/video/player/remember-speed/utils.ts ***!
  \**********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"minValue\": function() { return /* binding */ minValue; },\n/* harmony export */   \"maxValue\": function() { return /* binding */ maxValue; },\n/* harmony export */   \"stepValue\": function() { return /* binding */ stepValue; },\n/* harmony export */   \"errorMessageDuration\": function() { return /* binding */ errorMessageDuration; },\n/* harmony export */   \"nativeSupportedRates\": function() { return /* binding */ nativeSupportedRates; },\n/* harmony export */   \"extendedAgent\": function() { return /* binding */ extendedAgent; },\n/* harmony export */   \"trimLeadingDot\": function() { return /* binding */ trimLeadingDot; },\n/* harmony export */   \"calcOrder\": function() { return /* binding */ calcOrder; },\n/* harmony export */   \"getAid\": function() { return /* binding */ getAid; },\n/* harmony export */   \"options\": function() { return /* binding */ options; },\n/* harmony export */   \"getUniqueAscendingSortList\": function() { return /* binding */ getUniqueAscendingSortList; },\n/* harmony export */   \"getExtendedSupportedRates\": function() { return /* binding */ getExtendedSupportedRates; },\n/* harmony export */   \"getSupportedRates\": function() { return /* binding */ getSupportedRates; },\n/* harmony export */   \"formatSpeedText\": function() { return /* binding */ formatSpeedText; },\n/* harmony export */   \"addListener\": function() { return /* binding */ addListener; },\n/* harmony export */   \"removeListeners\": function() { return /* binding */ removeListeners; }\n/* harmony export */ });\n/* harmony import */ var _components_video_player_agent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/components/video/player-agent */ \"@/components/video/player-agent\");\n/* harmony import */ var _components_video_player_agent__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_components_video_player_agent__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _core_settings__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/core/settings */ \"@/core/settings\");\n/* harmony import */ var _core_settings__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_core_settings__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _core_utils_sort__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/core/utils/sort */ \"@/core/utils/sort\");\n/* harmony import */ var _core_utils_sort__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_core_utils_sort__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nconst minValue = 0.0625;\nconst maxValue = 16;\nconst stepValue = 0.5;\nconst errorMessageDuration = 2000;\nconst nativeSupportedRates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];\nconst extendedAgent = _components_video_player_agent__WEBPACK_IMPORTED_MODULE_0__.playerAgent.provideCustomQuery({\n  video: {\n    speedMenuList: '.bilibili-player-video-btn-speed-menu',\n    speedMenuItem: '.bilibili-player-video-btn-speed-menu-list',\n    speedNameBtn: '.bilibili-player-video-btn-speed-name',\n    speedContainer: '.bilibili-player-video-btn-speed',\n    active: '.bilibili-player-active',\n    show: '.bilibili-player-speed-show'\n  },\n  bangumi: {\n    speedMenuList: '.squirtle-speed-select-list',\n    speedMenuItem: '.squirtle-select-item',\n    speedNameBtn: '.squirtle-speed-select-result',\n    speedContainer: '.squirtle-speed-wrap',\n    active: '.active',\n    // bangumi 那边没有这种 class, 随便填一个就行了\n    show: '.bilibili-player-speed-show'\n  }\n});\nconst trimLeadingDot = selector => selector.replace(/^\\./, '');\nconst calcOrder = value => ((maxValue - value) * 10000).toString();\nconst getAid = (aid = unsafeWindow.aid) => {\n  if (!aid) {\n    throw new Error('aid is unknown');\n  }\n\n  return aid;\n};\nconst {\n  options\n} = (0,_core_settings__WEBPACK_IMPORTED_MODULE_1__.getComponentSettings)('rememberVideoSpeed');\nconst getUniqueAscendingSortList = values => Array.from(new Set(values)).sort((0,_core_utils_sort__WEBPACK_IMPORTED_MODULE_2__.ascendingSort)());\nconst getExtendedSupportedRates = () => getUniqueAscendingSortList(options.extendList);\nconst getSupportedRates = () => options.extend ? [...nativeSupportedRates, ...getExtendedSupportedRates()].sort((0,_core_utils_sort__WEBPACK_IMPORTED_MODULE_2__.ascendingSort)()) : nativeSupportedRates;\nconst formatSpeedText = speed => {\n  if (speed === 1) {\n    return '倍速';\n  }\n\n  return Math.trunc(speed) === speed ? `${speed}.0x` : `${speed}x`;\n};\nconst listeners = new Map();\nconst addListener = (element, listener) => {\n  element.addEventListener(...listener);\n  listeners.set(element, listener);\n};\nconst removeListeners = () => listeners.forEach((listener, element) => element.removeEventListener(...listener));\n\n//# sourceURL=webpack://%5Bname%5D/./registry/lib/components/video/player/remember-speed/utils.ts?");

/***/ }),

/***/ "@/components/component":
/*!*********************************************************!*\
  !*** external ["coreApis","componentApis","component"] ***!
  \*********************************************************/
/***/ (function(module) {

module.exports = coreApis.componentApis.component;

/***/ }),

/***/ "@/components/video/player-agent":
/*!*******************************************************************!*\
  !*** external ["coreApis","componentApis","video","playerAgent"] ***!
  \*******************************************************************/
/***/ (function(module) {

module.exports = coreApis.componentApis.video.playerAgent;

/***/ }),

/***/ "@/core/observer":
/*!****************************************!*\
  !*** external ["coreApis","observer"] ***!
  \****************************************/
/***/ (function(module) {

module.exports = coreApis.observer;

/***/ }),

/***/ "@/core/settings":
/*!****************************************!*\
  !*** external ["coreApis","settings"] ***!
  \****************************************/
/***/ (function(module) {

module.exports = coreApis.settings;

/***/ }),

/***/ "@/core/style":
/*!*************************************!*\
  !*** external ["coreApis","style"] ***!
  \*************************************/
/***/ (function(module) {

module.exports = coreApis.style;

/***/ }),

/***/ "@/core/utils/log":
/*!*******************************************!*\
  !*** external ["coreApis","utils","log"] ***!
  \*******************************************/
/***/ (function(module) {

module.exports = coreApis.utils.log;

/***/ }),

/***/ "@/core/utils/sort":
/*!********************************************!*\
  !*** external ["coreApis","utils","sort"] ***!
  \********************************************/
/***/ (function(module) {

module.exports = coreApis.utils.sort;

/***/ }),

/***/ "@/core/utils/urls":
/*!********************************************!*\
  !*** external ["coreApis","utils","urls"] ***!
  \********************************************/
/***/ (function(module) {

module.exports = coreApis.utils.urls;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	!function() {
/******/ 		var getProto = Object.getPrototypeOf ? function(obj) { return Object.getPrototypeOf(obj); } : function(obj) { return obj.__proto__; };
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach(function(key) { def[key] = function() { return value[key]; }; });
/******/ 			}
/******/ 			def['default'] = function() { return value; };
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./registry/lib/components/video/player/remember-speed/index.ts");
/******/ 	__webpack_exports__ = __webpack_exports__.component;
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});