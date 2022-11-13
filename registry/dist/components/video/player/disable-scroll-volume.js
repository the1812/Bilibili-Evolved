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
		exports["video/player/disable-scroll-volume"] = factory();
	else
		root["video/player/disable-scroll-volume"] = factory();
})(globalThis, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./registry/lib/components/video/player/disable-scroll-volume/index.ts":
/*!*****************************************************************************!*\
  !*** ./registry/lib/components/video/player/disable-scroll-volume/index.ts ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"component\": () => (/* binding */ component)\n/* harmony export */ });\n/* harmony import */ var _components_define__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/components/define */ \"@/components/define\");\n/* harmony import */ var _components_define__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_components_define__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _core_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/core/utils */ \"@/core/utils\");\n/* harmony import */ var _core_utils__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_core_utils__WEBPACK_IMPORTED_MODULE_1__);\n\n\nlet cancel;\n\nconst prevent = () => {\n  cancel?.();\n  cancel = (0,_core_utils__WEBPACK_IMPORTED_MODULE_1__.preventEvent)(unsafeWindow, 'mousewheel', () => {\n    const isFullscreen = ['player-mode-webfullscreen', 'player-fullscreen-fix', 'player-full-win'].some(token => document.body.classList.contains(token));\n    console.log({\n      isFullscreen\n    });\n    return isFullscreen;\n  });\n};\n\nconst component = (0,_components_define__WEBPACK_IMPORTED_MODULE_0__.defineComponentMetadata)({\n  name: 'disableScrollVolume',\n  displayName: '禁止滚轮调音量',\n  tags: [componentsTags.video],\n  entry: prevent,\n  reload: prevent,\n  unload: () => {\n    cancel?.();\n  },\n  commitHash: \"9f55208cc1c33a269f75ec81842507260f8f1d1d\",\n  coreVersion: \"2.5.1\",\n  description: (() => {\n    const context = __webpack_require__(\"./registry/lib/components/video/player/disable-scroll-volume sync index\\\\.(.+)\\\\.md$\");\n\n    return { ...Object.fromEntries(context.keys().map(path => {\n        const key = path.match(/index\\.(.+)\\.md$/)[1];\n        const value = context(path);\n        return [key, value];\n      })),\n      'zh-CN': () => Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./index.md */ \"./registry/lib/components/video/player/disable-scroll-volume/index.md\", 17)).then(m => m.default)\n    };\n  })()\n});\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/video/player/disable-scroll-volume/index.ts?");

/***/ }),

/***/ "./registry/lib/components/video/player/disable-scroll-volume sync index\\.(.+)\\.md$":
/*!********************************************************************************************************!*\
  !*** ./registry/lib/components/video/player/disable-scroll-volume/ sync nonrecursive index\.(.+)\.md$ ***!
  \********************************************************************************************************/
/***/ ((module) => {

eval("function webpackEmptyContext(req) {\n\tvar e = new Error(\"Cannot find module '\" + req + \"'\");\n\te.code = 'MODULE_NOT_FOUND';\n\tthrow e;\n}\nwebpackEmptyContext.keys = () => ([]);\nwebpackEmptyContext.resolve = webpackEmptyContext;\nwebpackEmptyContext.id = \"./registry/lib/components/video/player/disable-scroll-volume sync index\\\\.(.+)\\\\.md$\";\nmodule.exports = webpackEmptyContext;\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/video/player/disable-scroll-volume/_sync_nonrecursive_index\\.(.+)\\.md$?");

/***/ }),

/***/ "./registry/lib/components/video/player/disable-scroll-volume/index.md":
/*!*****************************************************************************!*\
  !*** ./registry/lib/components/video/player/disable-scroll-volume/index.md ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
eval("module.exports = \"在网页全屏 / 全屏模式下, 禁止鼠标滚轮控制播放器的音量.\";\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/video/player/disable-scroll-volume/index.md?");

/***/ }),

/***/ "@/components/define":
/*!******************************************************!*\
  !*** external ["coreApis","componentApis","define"] ***!
  \******************************************************/
/***/ ((module) => {

"use strict";
module.exports = coreApis.componentApis.define;

/***/ }),

/***/ "@/core/utils":
/*!*************************************!*\
  !*** external ["coreApis","utils"] ***!
  \*************************************/
/***/ ((module) => {

"use strict";
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
/******/ 	var __webpack_exports__ = __webpack_require__("./registry/lib/components/video/player/disable-scroll-volume/index.ts");
/******/ 	__webpack_exports__ = __webpack_exports__.component;
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});