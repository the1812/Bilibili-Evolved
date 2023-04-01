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
		exports["live/gift-box"] = factory();
	else
		root["live/gift-box"] = factory();
})(globalThis, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./registry/lib/components/live/gift-box/index.ts":
/*!********************************************************!*\
  !*** ./registry/lib/components/live/gift-box/index.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"component\": () => (/* binding */ component)\n/* harmony export */ });\n/* harmony import */ var _components_live_live_control_bar__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/components/live/live-control-bar */ \"@/components/live/live-control-bar\");\n/* harmony import */ var _components_live_live_control_bar__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_components_live_live_control_bar__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _components_define__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/define */ \"@/components/define\");\n/* harmony import */ var _components_define__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_components_define__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _core_spin_query__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/core/spin-query */ \"@/core/spin-query\");\n/* harmony import */ var _core_spin_query__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_core_spin_query__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _core_style__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/core/style */ \"@/core/style\");\n/* harmony import */ var _core_style__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_core_style__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _core_utils_urls__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/core/utils/urls */ \"@/core/utils/urls\");\n/* harmony import */ var _core_utils_urls__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_core_utils_urls__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _gift_box_scss__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./gift-box.scss */ \"./registry/lib/components/live/gift-box/gift-box.scss\");\n/* harmony import */ var _gift_box_scss__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_gift_box_scss__WEBPACK_IMPORTED_MODULE_5__);\n\n\n\n\n\n\n\n/**\r\n * # 原理\r\n *\r\n * 在网页全屏模式、播放器控制条出现时将包裹按钮从原始位置直接移动到控制条上。退出全屏时再将包裹按钮移回原来的位置。\r\n *\r\n * 主要逻辑在各监听器中完成。监听器在 `entry` 和 `reload` 方法中启动，并在 `unload` 方法中停止监听。\r\n */\n\n// 指示是否为全屏模式的 class，出现于 body 元素上\nconst fullWinClass = 'player-full-win';\nconst fullScreenClass = 'fullscreen-fix';\n\n// 直播播放器的 id\nconst livePlayerId = 'live-player';\n\n// 控制条类名\nconst controlBarClass = 'control-area';\n\n// 包裹按钮元素的父元素 class\nconst giftBtnParentClass = 'z-gift-package';\n\n// 包裹外层元素的 class\nconst giftPackageClass = 'wrap';\n\n// 全屏模式下用于存放被移入的包裹按钮的容器元素\nconst fullWinGiftBtnWrapperClass = 'full-win-gift-btn-wrapper';\n\n// 组件名\nconst componentName = 'liveGiftBox';\n\n// 包裹按钮元素，仅当组件开启且能被寻找到时，才不为 null\nlet giftBtn = null;\n\n// 全屏模式切换监听器\nlet stopObservingFullWinToggle = null;\n\n// 鼠标离开播放器的监听器\nlet stopObservingMouseLeavePlayer = null;\nasync function queryGiftBtnParent() {\n  const res = await (0,_core_spin_query__WEBPACK_IMPORTED_MODULE_2__.select)(`.${giftBtnParentClass}`, {\n    maxRetry: 15,\n    queryInterval: 200\n  });\n  if (!res) {\n    console.warn(`[${componentName}] the parent element of gift button not found`);\n  }\n  return res;\n}\n\n// 当前是否为全屏模式\nfunction isFullWin() {\n  return document.body.classList.contains(fullWinClass) || document.body.classList.contains(fullScreenClass);\n}\n\n/**\r\n * 监听全屏模式的开启与关闭，当模式发生变化时触发回调\r\n * @param callback 回调函数\r\n * @returns 停止监听的函数\r\n */\nfunction observeFullWinToggle(onToggle) {\n  /**\r\n   * 检查是否发生了全屏模式的变化\r\n   * @param {MutationRecord} mutation body 元素的属性变化（不检查变化类型）\r\n   * @returns {(boolean|null)} null 表示未切换模式，true 表示切换到全屏模式，false 表示切换到非全屏模式\r\n   */\n  function analyzeMutation(mutation) {\n    const curContainsFullWinClass = isFullWin();\n    const prevClassList = mutation.oldValue.split(' ');\n    const prevContainsFullWinClass = prevClassList.includes(fullWinClass) || prevClassList.includes(fullScreenClass);\n    // console.debug(`[${componentName}]`, { curContainsFullWinClass, prevContainsFullWinClass })\n    if (curContainsFullWinClass === prevContainsFullWinClass) {\n      return null;\n    }\n    return curContainsFullWinClass;\n  }\n  const observer = new MutationObserver(mutations => {\n    for (const mutation of mutations) {\n      // console.debug(`[${componentName}] Class list of body element mutated. `\n      //   + 'Analyzing to see if the full window mode has changed...')\n      const toggleState = analyzeMutation(mutation);\n      if (toggleState !== null) {\n        onToggle(toggleState);\n      }\n    }\n  });\n  observer?.observe(document.body, {\n    attributes: true,\n    attributeFilter: ['class'],\n    attributeOldValue: true\n  });\n  return () => observer.disconnect();\n}\n\n// 将包裹按钮移动到控制条上\nfunction moveGiftPackageToControlBar(controlBar, giftBtn0) {\n  // console.debug(`[${componentName}] moving gift button to control bar...`)\n  const rightArea = dq(controlBar, '.right-area');\n  if (rightArea) {\n    const wrapper = document.createElement('div');\n    wrapper.className = fullWinGiftBtnWrapperClass;\n    wrapper.appendChild(giftBtn0);\n    rightArea.appendChild(wrapper);\n  } else {\n    console.warn(`[${componentName}] .right-area could not be found in control bar`);\n  }\n}\n\n// 每当控制条出现时，将包裹按钮移动到其上（条件：组件开启、包裹按钮存在、全屏模式开启）\nfunction doOnControlBarAppear() {\n  function onControlBarAppear(controlBar) {\n    const isFullWin0 = isFullWin();\n    // console.debug(`[${componentName}] control bar appeared`, {\n    //   '!!giftBtn': !!giftBtn,\n    //   isFullWin: isFullWin0,\n    // })\n    if (giftBtn && isFullWin0) {\n      moveGiftPackageToControlBar(controlBar, giftBtn);\n    }\n  }\n  (0,_components_live_live_control_bar__WEBPACK_IMPORTED_MODULE_0__.waitForControlBar)({\n    callback: onControlBarAppear\n  });\n}\n\n// 当全屏模式启动时，如果控制条正处于打开状态，则将包裹按钮移动到控制条上\nfunction onFullWinStart(giftBtn0) {\n  const controlBar = dq(`.${controlBarClass}`);\n  if (controlBar) {\n    moveGiftPackageToControlBar(controlBar, giftBtn0);\n  }\n}\n\n// 当全屏模式退出时，将包裹按钮移动回原位置，返回其监听器\nfunction onFullWinClose(giftBtn0, originGiftBtnParent) {\n  // console.debug(`[${componentName}] moving gift button back to origin position...`)\n  originGiftBtnParent.appendChild(giftBtn0);\n}\n\n// 每当全屏模式切换时执行操作\nfunction doOnFullWinToggle(giftBtn0, originGiftBtnParent) {\n  return observeFullWinToggle(isStarted => {\n    isStarted ? onFullWinStart(giftBtn0) : onFullWinClose(giftBtn0, originGiftBtnParent);\n  });\n}\n\n// 监听鼠标离开播放器事件。当处于全屏模式且包裹处于打开状态时，关闭包裹\nfunction doOnMouseLeavePlayer(giftBtn0) {\n  const livePlayer = dq(`#${livePlayerId}`);\n  if (!livePlayer) {\n    console.warn(`[${componentName}] live player not found`);\n    return null;\n  }\n  function onMouseLeavePlayer() {\n    if (dq(`.${fullWinGiftBtnWrapperClass} .${giftPackageClass}`)) {\n      // console.debug(`[${componentName}] Mouse left the full window player `\n      //   + 'when the gift button is opening. Closing the gift package...')\n      giftBtn0.click();\n    }\n  }\n  livePlayer.addEventListener('mouseleave', onMouseLeavePlayer);\n  return () => livePlayer.removeEventListener('mouseleave', onMouseLeavePlayer);\n}\nasync function reload() {\n  // console.debug(`[${componentName}] reloading...`)\n  (0,_core_style__WEBPACK_IMPORTED_MODULE_3__.addStyle)((_gift_box_scss__WEBPACK_IMPORTED_MODULE_5___default()), componentName);\n  const giftBtnParent = await queryGiftBtnParent();\n  giftBtn = giftBtnParent?.children[0];\n  if (giftBtnParent && giftBtn) {\n    stopObservingFullWinToggle = doOnFullWinToggle(giftBtn, giftBtnParent);\n    stopObservingMouseLeavePlayer = doOnMouseLeavePlayer(giftBtn);\n  }\n}\nfunction entry() {\n  // console.debug(`[${componentName}] launching...`)\n  doOnControlBarAppear();\n  reload();\n}\nfunction unload() {\n  // 不再使用全局变量设为 null，取消对对象的引用，便于垃圾回收\n  // console.debug(`[${componentName}] unloading...`)\n  stopObservingMouseLeavePlayer?.call(null);\n  stopObservingMouseLeavePlayer = null;\n  stopObservingFullWinToggle?.call(null);\n  stopObservingFullWinToggle = null;\n  giftBtn = null;\n  (0,_core_style__WEBPACK_IMPORTED_MODULE_3__.removeStyle)(componentName);\n}\nconst component = (0,_components_define__WEBPACK_IMPORTED_MODULE_1__.defineComponentMetadata)({\n  name: componentName,\n  displayName: '直播全屏包裹',\n  description: {\n    'zh-CN': '在直播的网页全屏(不能是全屏)模式下往控制栏添加包裹按钮.'\n  },\n  urlInclude: _core_utils_urls__WEBPACK_IMPORTED_MODULE_4__.liveUrls,\n  tags: [componentsTags.live],\n  entry,\n  reload,\n  unload,\n  commitHash: \"0fe2450af02c3ded87903aae6faea7a185d5ab6d\",\n  coreVersion: \"2.7.0\"\n});\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/live/gift-box/index.ts?");

/***/ }),

/***/ "./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_postcss@8.4.13_webpack@5.72.0/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0_webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./registry/lib/components/live/gift-box/gift-box.scss":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_postcss@8.4.13_webpack@5.72.0/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0_webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./registry/lib/components/live/gift-box/gift-box.scss ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../../../node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js\");\nvar ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, \".full-win-gift-btn-wrapper.full-win-gift-btn-wrapper {\\n  position: relative;\\n}\\n.full-win-gift-btn-wrapper.full-win-gift-btn-wrapper .wrap {\\n  right: -28px;\\n  bottom: calc(100% + 3px);\\n  color: #666;\\n  font-size: 12px;\\n  line-height: 1.4;\\n}\\n.full-win-gift-btn-wrapper.full-win-gift-btn-wrapper .wrap .text {\\n  margin: auto;\\n  padding: auto;\\n  color: inherit;\\n  cursor: inherit;\\n  line-height: inherit;\\n}\\n.full-win-gift-btn-wrapper.full-win-gift-btn-wrapper .wrap .popup::before, .full-win-gift-btn-wrapper.full-win-gift-btn-wrapper .wrap .popup::after {\\n  left: auto;\\n  right: calc(1em + 33px);\\n  transform: translateX(50%);\\n}\\n.full-win-gift-btn-wrapper.full-win-gift-btn-wrapper .gift-package {\\n  margin: auto;\\n  width: auto;\\n  height: 100%;\\n  color: inherit;\\n  fill: inherit;\\n  background: inherit !important;\\n}\\n.full-win-gift-btn-wrapper.full-win-gift-btn-wrapper .gift-package .bag-icon {\\n  display: none;\\n}\\n.full-win-gift-btn-wrapper.full-win-gift-btn-wrapper .gift-package span {\\n  font-size: inherit;\\n  line-height: 36px;\\n  padding: 0 6px;\\n  color: rgba(255, 255, 255, 0.9);\\n  cursor: pointer;\\n}\\n.full-win-gift-btn-wrapper.full-win-gift-btn-wrapper .gift-package span:hover {\\n  color: #fff;\\n}\", \"\"]);\n// Exports\nmodule.exports = ___CSS_LOADER_EXPORT___;\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/live/gift-box/gift-box.scss?./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19%5B0%5D.rules%5B0%5D.use%5B1%5D!./node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_postcss@8.4.13_webpack@5.72.0/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19%5B0%5D.rules%5B0%5D.use%5B2%5D!./node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0_webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19%5B0%5D.rules%5B0%5D.use%5B3%5D");

/***/ }),

/***/ "./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js":
/*!*******************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js ***!
  \*******************************************************************************************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n/*\n  MIT License http://www.opensource.org/licenses/mit-license.php\n  Author Tobias Koppers @sokra\n*/\n// css base code, injected by the css-loader\n// eslint-disable-next-line func-names\nmodule.exports = function (cssWithMappingToString) {\n  var list = []; // return the list of modules as css string\n\n  list.toString = function toString() {\n    return this.map(function (item) {\n      var content = cssWithMappingToString(item);\n\n      if (item[2]) {\n        return \"@media \".concat(item[2], \" {\").concat(content, \"}\");\n      }\n\n      return content;\n    }).join(\"\");\n  }; // import a list of modules into the list\n  // eslint-disable-next-line func-names\n\n\n  list.i = function (modules, mediaQuery, dedupe) {\n    if (typeof modules === \"string\") {\n      // eslint-disable-next-line no-param-reassign\n      modules = [[null, modules, \"\"]];\n    }\n\n    var alreadyImportedModules = {};\n\n    if (dedupe) {\n      for (var i = 0; i < this.length; i++) {\n        // eslint-disable-next-line prefer-destructuring\n        var id = this[i][0];\n\n        if (id != null) {\n          alreadyImportedModules[id] = true;\n        }\n      }\n    }\n\n    for (var _i = 0; _i < modules.length; _i++) {\n      var item = [].concat(modules[_i]);\n\n      if (dedupe && alreadyImportedModules[item[0]]) {\n        // eslint-disable-next-line no-continue\n        continue;\n      }\n\n      if (mediaQuery) {\n        if (!item[2]) {\n          item[2] = mediaQuery;\n        } else {\n          item[2] = \"\".concat(mediaQuery, \" and \").concat(item[2]);\n        }\n      }\n\n      list.push(item);\n    }\n  };\n\n  return list;\n};\n\n//# sourceURL=webpack://@bevo/core/./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js?");

/***/ }),

/***/ "./registry/lib/components/live/gift-box/gift-box.scss":
/*!*************************************************************!*\
  !*** ./registry/lib/components/live/gift-box/gift-box.scss ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n        var result = __webpack_require__(/*! !!../../../../../node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!../../../../../node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_postcss@8.4.13_webpack@5.72.0/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!../../../../../node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0_webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./gift-box.scss */ \"./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_postcss@8.4.13_webpack@5.72.0/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0_webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./registry/lib/components/live/gift-box/gift-box.scss\");\n\n        if (result && result.__esModule) {\n            result = result.default;\n        }\n\n        if (typeof result === \"string\") {\n            module.exports = result;\n        } else {\n            module.exports = result.toString();\n        }\n    \n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/live/gift-box/gift-box.scss?");

/***/ }),

/***/ "@/components/define":
/*!******************************************************!*\
  !*** external ["coreApis","componentApis","define"] ***!
  \******************************************************/
/***/ ((module) => {

"use strict";
module.exports = coreApis.componentApis.define;

/***/ }),

/***/ "@/components/live/live-control-bar":
/*!*********************************************************************!*\
  !*** external ["coreApis","componentApis","live","liveControlBar"] ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = coreApis.componentApis.live.liveControlBar;

/***/ }),

/***/ "@/core/spin-query":
/*!*****************************************!*\
  !*** external ["coreApis","spinQuery"] ***!
  \*****************************************/
/***/ ((module) => {

"use strict";
module.exports = coreApis.spinQuery;

/***/ }),

/***/ "@/core/style":
/*!*************************************!*\
  !*** external ["coreApis","style"] ***!
  \*************************************/
/***/ ((module) => {

"use strict";
module.exports = coreApis.style;

/***/ }),

/***/ "@/core/utils/urls":
/*!********************************************!*\
  !*** external ["coreApis","utils","urls"] ***!
  \********************************************/
/***/ ((module) => {

"use strict";
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
/******/ 			id: moduleId,
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
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./registry/lib/components/live/gift-box/index.ts");
/******/ 	__webpack_exports__ = __webpack_exports__.component;
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});