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
		exports["utils/keymap-toggle-danmaku-list"] = factory();
	else
		root["utils/keymap-toggle-danmaku-list"] = factory();
})(globalThis, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./registry/lib/plugins/utils/keymap-toggle-danmaku-list/index.ts":
/*!************************************************************************!*\
  !*** ./registry/lib/plugins/utils/keymap-toggle-danmaku-list/index.ts ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"plugin\": () => (/* binding */ plugin)\n/* harmony export */ });\n/* harmony import */ var _core_spin_query__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/core/spin-query */ \"@/core/spin-query\");\n/* harmony import */ var _core_spin_query__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_core_spin_query__WEBPACK_IMPORTED_MODULE_0__);\n\nconst plugin = {\n  name: 'keymap.actions.toggleDanmakuList',\n  displayName: '快捷键扩展 - 开关弹幕列表',\n  description: '在快捷键的动作列表里添加一个 \"开关弹幕列表\".',\n  setup: _ref => {\n    let {\n      addData\n    } = _ref;\n    addData('keymap.actions', actions => {\n      actions.toggleDanmakuList = {\n        displayName: '开关弹幕列表',\n        prevent: true,\n        run: async () => {\n          const button = await (0,_core_spin_query__WEBPACK_IMPORTED_MODULE_0__.select)('.bui-collapse-header');\n          button?.click();\n        }\n      };\n    });\n    addData('keymap.presets', presetBase => {\n      presetBase.toggleDanmakuList = 'shift d';\n    });\n  },\n  commitHash: \"9f55208cc1c33a269f75ec81842507260f8f1d1d\",\n  coreVersion: \"2.5.1\"\n};\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/plugins/utils/keymap-toggle-danmaku-list/index.ts?");

/***/ }),

/***/ "@/core/spin-query":
/*!*****************************************!*\
  !*** external ["coreApis","spinQuery"] ***!
  \*****************************************/
/***/ ((module) => {

module.exports = coreApis.spinQuery;

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
/******/ 	var __webpack_exports__ = __webpack_require__("./registry/lib/plugins/utils/keymap-toggle-danmaku-list/index.ts");
/******/ 	__webpack_exports__ = __webpack_exports__.plugin;
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});