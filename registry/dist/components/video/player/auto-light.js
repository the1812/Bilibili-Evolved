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
		exports["video/player/auto-light"] = factory();
	else
		root["video/player/auto-light"] = factory();
})(globalThis, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./registry/lib/components/video/player/auto-light/index.ts":
/*!******************************************************************!*\
  !*** ./registry/lib/components/video/player/auto-light/index.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"component\": () => (/* binding */ component)\n/* harmony export */ });\n/* harmony import */ var _components_define__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/components/define */ \"@/components/define\");\n/* harmony import */ var _components_define__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_components_define__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _components_video_player_agent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/video/player-agent */ \"@/components/video/player-agent\");\n/* harmony import */ var _components_video_player_agent__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_components_video_player_agent__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _components_video_player_light__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/components/video/player-light */ \"@/components/video/player-light\");\n/* harmony import */ var _components_video_player_light__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_components_video_player_light__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _core_observer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/core/observer */ \"@/core/observer\");\n/* harmony import */ var _core_observer__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_core_observer__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _core_utils_urls__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/core/utils/urls */ \"@/core/utils/urls\");\n/* harmony import */ var _core_utils_urls__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_core_utils_urls__WEBPACK_IMPORTED_MODULE_4__);\n\n\n\n\n\nlet playerAgentInstance;\nconst CreateAnim = () => {\n  let biliMainHeader = document.getElementById(\"biliMainHeader\");\n  if (!biliMainHeader) return;\n  let mstars1 = document.createElement(\"div\");\n  mstars1.id = \"mstars1\";\n  let mstars2 = document.createElement(\"div\");\n  mstars2.id = \"mstars2\";\n  biliMainHeader.appendChild(mstars1);\n  biliMainHeader.appendChild(mstars2);\n\n  // 添加一段css 样式到document最后\n  let style = document.createElement(\"style\");\n  // generate random stars\n  function generate(numCtrl) {\n    let star = '';\n    let max = window.innerWidth * window.innerHeight;\n    for (let i = 0; i < max / numCtrl; i++) {\n      star += `${Math.floor(Math.random() * window.innerWidth * 1.5)}px ${Math.floor(Math.random() * (window.innerHeight + 2000))}px #FFF,`;\n    }\n    star += `${Math.floor(Math.random() * window.innerWidth * 1.5)}px ${Math.floor(Math.random() * (window.innerHeight + 2000))}px #FFF;`;\n    return star;\n  }\n  let starNumCtl = 400;\n  style.innerHTML = `\n  #mstars1{z-index: 1009;position: fixed;left:0px; width:1px;height:1px;background:transparent;box-shadow:${generate(starNumCtl)};animation:animStar 50s linear infinite}\n  #mstars1:after{content:\" \";position:fixed;left:0px;top:0px;width:1px;height:1px;background:transparent;box-shadow:${generate(starNumCtl * 2)}}\n  #mstars2{z-index: 1009;position: fixed;left:0px;width:2px;height:2px;background:transparent;box-shadow:${generate(starNumCtl * 4)};animation:animStar 100s linear infinite}\n  #mstars2:after{content:\" \";position:fixed;left:0px;top:0px;width:2px;height:2px;background:transparent;box-shadow:${generate(starNumCtl * 8)}}\n  @keyframes animStar{from{transform:translateY(${-200}px)}to{transform:translateY(${-2200}px)}}\n  `;\n  document.body.appendChild(style);\n};\nconst StarAnim = on => {\n  //查找id mstars1 的div\n  let mstars1 = document.getElementById(\"mstars1\");\n  let mstars2 = document.getElementById(\"mstars2\");\n  //如果没有找到id biliMainHeader 的div创建2个id为 mstars1 mstars2 的div\n  if (on) {\n    if (mstars1 == null) {\n      CreateAnim();\n      mstars1 = document.getElementById(\"mstars1\");\n      mstars2 = document.getElementById(\"mstars2\");\n    }\n    //设置mstars1 mstars2 visible 为true\n    mstars1.style.visibility = \"visible\";\n    mstars2.style.visibility = \"visible\";\n  } else {\n    if (mstars1 != null) {\n      mstars1.style.visibility = \"hidden\";\n      mstars2.style.visibility = \"hidden\";\n    }\n  }\n};\nlet lightOn2 = () => {\n  (0,_components_video_player_light__WEBPACK_IMPORTED_MODULE_2__.lightOn)();\n  StarAnim(false);\n};\nlet lightOff2 = () => {\n  (0,_components_video_player_light__WEBPACK_IMPORTED_MODULE_2__.lightOff)();\n  StarAnim(true);\n};\nconst component = (0,_components_define__WEBPACK_IMPORTED_MODULE_0__.defineComponentMetadata)({\n  name: 'playerAutoLight',\n  displayName: '播放时自动关灯',\n  urlInclude: _core_utils_urls__WEBPACK_IMPORTED_MODULE_4__.allVideoUrls,\n  tags: [componentsTags.video],\n  description: {\n    'zh-CN': '在视频播放时自动关灯, 暂停或结束时再自动打开.'\n  },\n  entry: async () => {\n    const {\n      isEmbeddedPlayer\n    } = await Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! @/core/utils */ \"@/core/utils\", 23));\n    const {\n      lightOn,\n      lightOff\n    } = await Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! @/components/video/player-light */ \"@/components/video/player-light\", 23));\n    if (isEmbeddedPlayer()) {\n      return;\n    }\n    (0,_core_observer__WEBPACK_IMPORTED_MODULE_3__.videoChange)(async () => {\n      if (playerAgentInstance != null) {\n        const oldVideo = await playerAgentInstance.query.video.element();\n        oldVideo.removeEventListener('ended', lightOn2);\n        oldVideo.removeEventListener('pause', lightOn2);\n        oldVideo.removeEventListener('play', lightOff2);\n      }\n      playerAgentInstance = _components_video_player_agent__WEBPACK_IMPORTED_MODULE_1__.playerAgent;\n      const video = await playerAgentInstance.query.video.element();\n      if (playerAgentInstance.isAutoPlay()) {\n        lightOff2();\n      }\n      video.addEventListener('ended', lightOn2);\n      video.addEventListener('pause', lightOn2);\n      video.addEventListener('play', lightOff2);\n    });\n  },\n  commitHash: \"7991ac4fab1d03b125b3404b7d959c16e56d6917\",\n  coreVersion: \"2.6.3\"\n});\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/video/player/auto-light/index.ts?");

/***/ }),

/***/ "@/components/define":
/*!******************************************************!*\
  !*** external ["coreApis","componentApis","define"] ***!
  \******************************************************/
/***/ ((module) => {

module.exports = coreApis.componentApis.define;

/***/ }),

/***/ "@/components/video/player-agent":
/*!*******************************************************************!*\
  !*** external ["coreApis","componentApis","video","playerAgent"] ***!
  \*******************************************************************/
/***/ ((module) => {

module.exports = coreApis.componentApis.video.playerAgent;

/***/ }),

/***/ "@/components/video/player-light":
/*!*******************************************************************!*\
  !*** external ["coreApis","componentApis","video","playerLight"] ***!
  \*******************************************************************/
/***/ ((module) => {

module.exports = coreApis.componentApis.video.playerLight;

/***/ }),

/***/ "@/core/observer":
/*!****************************************!*\
  !*** external ["coreApis","observer"] ***!
  \****************************************/
/***/ ((module) => {

module.exports = coreApis.observer;

/***/ }),

/***/ "@/core/utils/urls":
/*!********************************************!*\
  !*** external ["coreApis","utils","urls"] ***!
  \********************************************/
/***/ ((module) => {

module.exports = coreApis.utils.urls;

/***/ }),

/***/ "@/core/utils":
/*!*************************************!*\
  !*** external ["coreApis","utils"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = coreApis.utils;

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
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
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
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
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
/******/ 	var __webpack_exports__ = __webpack_require__("./registry/lib/components/video/player/auto-light/index.ts");
/******/ 	__webpack_exports__ = __webpack_exports__.component;
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});