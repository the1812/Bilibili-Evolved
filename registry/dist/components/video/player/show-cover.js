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
		exports["video/player/show-cover"] = factory();
	else
		root["video/player/show-cover"] = factory();
})(self, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./registry/lib/components/video/player/show-cover/index.ts":
/*!******************************************************************!*\
  !*** ./registry/lib/components/video/player/show-cover/index.ts ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"component\": function() { return /* binding */ component; }\n/* harmony export */ });\n/* harmony import */ var _core_observer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/core/observer */ \"@/core/observer\");\n/* harmony import */ var _core_observer__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_core_observer__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _core_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/core/utils */ \"@/core/utils\");\n/* harmony import */ var _core_utils__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_core_utils__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _core_utils_urls__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/core/utils/urls */ \"@/core/utils/urls\");\n/* harmony import */ var _core_utils_urls__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_core_utils_urls__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\n\nconst entry = async () => {\n  let lastAid;\n\n  const removeCover = () => document.body.style.removeProperty('--cover-url');\n\n  const videoPrototype = (await (0,_core_utils__WEBPACK_IMPORTED_MODULE_1__.isBwpVideo)()) ? BwpElement.prototype : HTMLVideoElement.prototype; // bpx player 改了 video.play(), hook 直接挂 HTMLVideoElement.prototype 上没效果 (#3698)\n\n  const bpxPlayer = dq('.bpx-player-video-wrap');\n  const isBpxPlayer = Boolean(bpxPlayer);\n  (0,_core_utils__WEBPACK_IMPORTED_MODULE_1__.createHook)(videoPrototype, 'play', () => {\n    removeCover();\n    return true;\n  });\n\n  if (isBpxPlayer) {\n    (0,_core_observer__WEBPACK_IMPORTED_MODULE_0__.videoChange)(() => {\n      console.debug('isBpxPlayer');\n      const currentBpxVideo = dq('.bpx-player-video-wrap video');\n\n      if (!currentBpxVideo) {\n        console.warn('bpx player not found');\n        return;\n      }\n\n      (0,_core_utils__WEBPACK_IMPORTED_MODULE_1__.createHook)(currentBpxVideo, 'play', () => {\n        removeCover();\n        return true;\n      });\n    });\n  }\n\n  const showCover = async _ref => {\n    let {\n      aid\n    } = _ref;\n\n    if (!aid) {\n      console.warn('[播放前显示封面] 未找到av号');\n      return;\n    }\n\n    if (aid === lastAid) {\n      return;\n    }\n\n    lastAid = aid;\n    const {\n      VideoInfo\n    } = await Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! @/components/video/video-info */ \"@/components/video/video-info\", 23));\n    const info = new VideoInfo(aid);\n    await info.fetchInfo();\n    document.body.style.setProperty('--cover-url', `url('${info.coverUrl}')`);\n  };\n\n  (0,_core_observer__WEBPACK_IMPORTED_MODULE_0__.videoChange)(showCover);\n};\n\nconst component = {\n  name: 'showCoverBeforePlay',\n  displayName: '播放前显示封面',\n  urlInclude: _core_utils_urls__WEBPACK_IMPORTED_MODULE_2__.playerUrls,\n  entry,\n  instantStyles: [{\n    name: 'showCoverBeforePlay',\n    style: () => Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./cover.scss */ \"./registry/lib/components/video/player/show-cover/cover.scss\", 23))\n  }],\n  description: {\n    'zh-CN': '在视频开始播放前, 在播放器中显示封面.'\n  },\n  tags: [componentsTags.video],\n  commitHash: \"beb2320fbfb62651a93f01cdb04422164cd7c55d\",\n  coreVersion: \"2.4.1\"\n};\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/video/player/show-cover/index.ts?");

/***/ }),

/***/ "./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_g4najheu5gwop3kphiif6aqpde/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0+webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./registry/lib/components/video/player/show-cover/cover.scss":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_g4najheu5gwop3kphiif6aqpde/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0+webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./registry/lib/components/video/player/show-cover/cover.scss ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../../../../node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js\");\nvar ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, \".bpx-player-video-wrap::after,\\n.bilibili-player-video::after {\\n  position: absolute;\\n  content: \\\"\\\";\\n  top: 0;\\n  left: 0;\\n  width: 100%;\\n  height: 100%;\\n  display: none;\\n  background: black var(--cover-url) center no-repeat;\\n  background-size: contain;\\n  pointer-events: none;\\n  z-index: 10;\\n}\\n\\n.bpx-player-container.bpx-state-paused .bpx-player-video-wrap::after {\\n  display: block;\\n}\\n\\n.bilibili-player-area.video-state-pause .bilibili-player-video::after {\\n  display: block;\\n}\", \"\"]);\n// Exports\nmodule.exports = ___CSS_LOADER_EXPORT___;\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/video/player/show-cover/cover.scss?./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19%5B0%5D.rules%5B0%5D.use%5B1%5D!./node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_g4najheu5gwop3kphiif6aqpde/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19%5B0%5D.rules%5B0%5D.use%5B2%5D!./node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0+webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19%5B0%5D.rules%5B0%5D.use%5B3%5D");

/***/ }),

/***/ "./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js":
/*!*******************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js ***!
  \*******************************************************************************************************************************/
/***/ (function(module) {

"use strict";
eval("\n\n/*\n  MIT License http://www.opensource.org/licenses/mit-license.php\n  Author Tobias Koppers @sokra\n*/\n// css base code, injected by the css-loader\n// eslint-disable-next-line func-names\nmodule.exports = function (cssWithMappingToString) {\n  var list = []; // return the list of modules as css string\n\n  list.toString = function toString() {\n    return this.map(function (item) {\n      var content = cssWithMappingToString(item);\n\n      if (item[2]) {\n        return \"@media \".concat(item[2], \" {\").concat(content, \"}\");\n      }\n\n      return content;\n    }).join(\"\");\n  }; // import a list of modules into the list\n  // eslint-disable-next-line func-names\n\n\n  list.i = function (modules, mediaQuery, dedupe) {\n    if (typeof modules === \"string\") {\n      // eslint-disable-next-line no-param-reassign\n      modules = [[null, modules, \"\"]];\n    }\n\n    var alreadyImportedModules = {};\n\n    if (dedupe) {\n      for (var i = 0; i < this.length; i++) {\n        // eslint-disable-next-line prefer-destructuring\n        var id = this[i][0];\n\n        if (id != null) {\n          alreadyImportedModules[id] = true;\n        }\n      }\n    }\n\n    for (var _i = 0; _i < modules.length; _i++) {\n      var item = [].concat(modules[_i]);\n\n      if (dedupe && alreadyImportedModules[item[0]]) {\n        // eslint-disable-next-line no-continue\n        continue;\n      }\n\n      if (mediaQuery) {\n        if (!item[2]) {\n          item[2] = mediaQuery;\n        } else {\n          item[2] = \"\".concat(mediaQuery, \" and \").concat(item[2]);\n        }\n      }\n\n      list.push(item);\n    }\n  };\n\n  return list;\n};\n\n//# sourceURL=webpack://@bevo/core/./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js?");

/***/ }),

/***/ "./registry/lib/components/video/player/show-cover/cover.scss":
/*!********************************************************************!*\
  !*** ./registry/lib/components/video/player/show-cover/cover.scss ***!
  \********************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval("\n        var result = __webpack_require__(/*! !!../../../../../../node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!../../../../../../node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_g4najheu5gwop3kphiif6aqpde/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!../../../../../../node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0+webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./cover.scss */ \"./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_g4najheu5gwop3kphiif6aqpde/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0+webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./registry/lib/components/video/player/show-cover/cover.scss\");\n\n        if (result && result.__esModule) {\n            result = result.default;\n        }\n\n        if (typeof result === \"string\") {\n            module.exports = result;\n        } else {\n            module.exports = result.toString();\n        }\n    \n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/video/player/show-cover/cover.scss?");

/***/ }),

/***/ "@/components/video/video-info":
/*!*****************************************************************!*\
  !*** external ["coreApis","componentApis","video","videoInfo"] ***!
  \*****************************************************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.componentApis.video.videoInfo;

/***/ }),

/***/ "@/core/observer":
/*!****************************************!*\
  !*** external ["coreApis","observer"] ***!
  \****************************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.observer;

/***/ }),

/***/ "@/core/utils/urls":
/*!********************************************!*\
  !*** external ["coreApis","utils","urls"] ***!
  \********************************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.utils.urls;

/***/ }),

/***/ "@/core/utils":
/*!*************************************!*\
  !*** external ["coreApis","utils"] ***!
  \*************************************/
/***/ (function(module) {

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
/******/ 	var __webpack_exports__ = __webpack_require__("./registry/lib/components/video/player/show-cover/index.ts");
/******/ 	__webpack_exports__ = __webpack_exports__.component;
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});