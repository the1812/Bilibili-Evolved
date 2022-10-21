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
		exports["video/full-episode-title"] = factory();
	else
		root["video/full-episode-title"] = factory();
})(self, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./registry/lib/components/video/full-episode-title/index.ts":
/*!*******************************************************************!*\
  !*** ./registry/lib/components/video/full-episode-title/index.ts ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"component\": function() { return /* binding */ component; }\n/* harmony export */ });\n/* harmony import */ var _components_define__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/components/define */ \"@/components/define\");\n/* harmony import */ var _components_define__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_components_define__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _core_utils_urls__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/core/utils/urls */ \"@/core/utils/urls\");\n/* harmony import */ var _core_utils_urls__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_core_utils_urls__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _core_settings__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/core/settings */ \"@/core/settings\");\n/* harmony import */ var _core_settings__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_core_settings__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _core_spin_query__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/core/spin-query */ \"@/core/spin-query\");\n/* harmony import */ var _core_spin_query__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_core_spin_query__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nconst name = 'fullEpisodeTitle';\nconst component = (0,_components_define__WEBPACK_IMPORTED_MODULE_0__.defineComponentMetadata)({\n  name,\n  instantStyles: [{\n    name,\n    style: () => Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./full-episode-title.scss */ \"./registry/lib/components/video/full-episode-title/full-episode-title.scss\", 23))\n  }],\n  options: {\n    fullEpisodeTitle: {\n      defaultValue: true,\n      displayName: '展开选集标题'\n    },\n    fullEpisodeList: {\n      defaultValue: true,\n      displayName: '展开选集列表'\n    }\n  },\n  entry: _ref => {\n    let {\n      metadata: {\n        options\n      }\n    } = _ref;\n    Object.keys(options).forEach(key => {\n      (0,_core_settings__WEBPACK_IMPORTED_MODULE_2__.addComponentListener)(`${name}.${key}`, value => {\n        document.body.classList.toggle(lodash.kebabCase(key), value);\n      }, true);\n    });\n\n    if (!options.fullEpisodeList) {\n      return;\n    }\n\n    Promise.race([(0,_core_spin_query__WEBPACK_IMPORTED_MODULE_3__.select)('.multi-page-v1 .head-left h3'), (0,_core_spin_query__WEBPACK_IMPORTED_MODULE_3__.select)('.base-video-sections-v1 .first-line-title')]).then(titleElement => {\n      titleElement.addEventListener('click', e => {\n        // Alt + 左键点击才能触发\n        if (!e.altKey || e.button !== 0) {\n          return;\n        }\n\n        document.body.classList.toggle('disable-full-episode-list');\n        e.preventDefault();\n        e.stopImmediatePropagation();\n      }, {\n        capture: true\n      });\n    });\n  },\n  displayName: '选集区域优化',\n  tags: [componentsTags.video],\n  urlInclude: _core_utils_urls__WEBPACK_IMPORTED_MODULE_1__.videoUrls,\n  commitHash: \"35a6e861fe9ab2cecc91b81f803163f8e57988ce\",\n  coreVersion: \"2.5.0\",\n  description: (() => {\n    const context = __webpack_require__(\"./registry/lib/components/video/full-episode-title sync index\\\\.(.+)\\\\.md$\");\n\n    return { ...Object.fromEntries(context.keys().map(path => {\n        const key = path.match(/index\\.(.+)\\.md$/)[1];\n        const value = context(path);\n        return [key, value];\n      })),\n      'zh-CN': () => Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./index.md */ \"./registry/lib/components/video/full-episode-title/index.md\", 17)).then(m => m.default)\n    };\n  })()\n});\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/video/full-episode-title/index.ts?");

/***/ }),

/***/ "./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_g4najheu5gwop3kphiif6aqpde/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0+webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./registry/lib/components/video/full-episode-title/full-episode-title.scss":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_g4najheu5gwop3kphiif6aqpde/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0+webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./registry/lib/components/video/full-episode-title/full-episode-title.scss ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../../../node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js\");\nvar ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, \"body.full-episode-title .base-video-sections-v1 .video-episode-card {\\n  height: auto !important;\\n}\\nbody.full-episode-title .base-video-sections-v1 .video-episode-card .cur-play-icon {\\n  margin-right: 6px;\\n}\\nbody.full-episode-title .base-video-sections-v1 .video-episode-card__info {\\n  height: auto !important;\\n}\\nbody.full-episode-title .base-video-sections-v1 .video-episode-card__info-title {\\n  padding: 4px 0 !important;\\n  width: auto !important;\\n  max-height: unset !important;\\n  height: auto !important;\\n  white-space: normal !important;\\n  line-height: 1.5 !important;\\n}\\nbody.full-episode-title .multi-page-v1 .cur-list li,\\nbody.full-episode-title .multi-page .cur-list li {\\n  height: auto !important;\\n}\\nbody.full-episode-title .multi-page-v1 .cur-list li a,\\nbody.full-episode-title .multi-page .cur-list li a {\\n  overflow: visible !important;\\n  white-space: normal !important;\\n}\\nbody.full-episode-title .multi-page-v1 .cur-list li .part,\\nbody.full-episode-title .multi-page .cur-list li .part {\\n  padding: 4px 0 !important;\\n  line-height: 1.75 !important;\\n}\\nbody.full-episode-title .multi-page-v1 .cur-list li .duration,\\nbody.full-episode-title .multi-page .cur-list li .duration {\\n  align-self: center !important;\\n}\\nbody.full-episode-list:not(.disable-full-episode-list) .video-sections-content-list {\\n  max-height: unset !important;\\n  height: auto !important;\\n}\\nbody.full-episode-list:not(.disable-full-episode-list) .video-sections-content-list .video-section-list {\\n  height: auto !important;\\n}\\nbody.full-episode-list:not(.disable-full-episode-list) .multi-page-v1 .head-left h3,\\nbody.full-episode-list:not(.disable-full-episode-list) .multi-page .head-left h3 {\\n  cursor: pointer;\\n}\\nbody.full-episode-list:not(.disable-full-episode-list) .multi-page-v1 .cur-list,\\nbody.full-episode-list:not(.disable-full-episode-list) .multi-page .cur-list {\\n  max-height: unset !important;\\n}\\nbody.full-episode-list:not(.disable-full-episode-list) .multi-page-v1 .cur-list ul,\\nbody.full-episode-list:not(.disable-full-episode-list) .multi-page .cur-list ul {\\n  max-height: unset !important;\\n}\", \"\"]);\n// Exports\nmodule.exports = ___CSS_LOADER_EXPORT___;\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/video/full-episode-title/full-episode-title.scss?./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19%5B0%5D.rules%5B0%5D.use%5B1%5D!./node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_g4najheu5gwop3kphiif6aqpde/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19%5B0%5D.rules%5B0%5D.use%5B2%5D!./node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0+webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19%5B0%5D.rules%5B0%5D.use%5B3%5D");

/***/ }),

/***/ "./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js":
/*!*******************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js ***!
  \*******************************************************************************************************************************/
/***/ (function(module) {

"use strict";
eval("\n\n/*\n  MIT License http://www.opensource.org/licenses/mit-license.php\n  Author Tobias Koppers @sokra\n*/\n// css base code, injected by the css-loader\n// eslint-disable-next-line func-names\nmodule.exports = function (cssWithMappingToString) {\n  var list = []; // return the list of modules as css string\n\n  list.toString = function toString() {\n    return this.map(function (item) {\n      var content = cssWithMappingToString(item);\n\n      if (item[2]) {\n        return \"@media \".concat(item[2], \" {\").concat(content, \"}\");\n      }\n\n      return content;\n    }).join(\"\");\n  }; // import a list of modules into the list\n  // eslint-disable-next-line func-names\n\n\n  list.i = function (modules, mediaQuery, dedupe) {\n    if (typeof modules === \"string\") {\n      // eslint-disable-next-line no-param-reassign\n      modules = [[null, modules, \"\"]];\n    }\n\n    var alreadyImportedModules = {};\n\n    if (dedupe) {\n      for (var i = 0; i < this.length; i++) {\n        // eslint-disable-next-line prefer-destructuring\n        var id = this[i][0];\n\n        if (id != null) {\n          alreadyImportedModules[id] = true;\n        }\n      }\n    }\n\n    for (var _i = 0; _i < modules.length; _i++) {\n      var item = [].concat(modules[_i]);\n\n      if (dedupe && alreadyImportedModules[item[0]]) {\n        // eslint-disable-next-line no-continue\n        continue;\n      }\n\n      if (mediaQuery) {\n        if (!item[2]) {\n          item[2] = mediaQuery;\n        } else {\n          item[2] = \"\".concat(mediaQuery, \" and \").concat(item[2]);\n        }\n      }\n\n      list.push(item);\n    }\n  };\n\n  return list;\n};\n\n//# sourceURL=webpack://@bevo/core/./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js?");

/***/ }),

/***/ "./registry/lib/components/video/full-episode-title/full-episode-title.scss":
/*!**********************************************************************************!*\
  !*** ./registry/lib/components/video/full-episode-title/full-episode-title.scss ***!
  \**********************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval("\n        var result = __webpack_require__(/*! !!../../../../../node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!../../../../../node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_g4najheu5gwop3kphiif6aqpde/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!../../../../../node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0+webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./full-episode-title.scss */ \"./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_g4najheu5gwop3kphiif6aqpde/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0+webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./registry/lib/components/video/full-episode-title/full-episode-title.scss\");\n\n        if (result && result.__esModule) {\n            result = result.default;\n        }\n\n        if (typeof result === \"string\") {\n            module.exports = result;\n        } else {\n            module.exports = result.toString();\n        }\n    \n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/video/full-episode-title/full-episode-title.scss?");

/***/ }),

/***/ "./registry/lib/components/video/full-episode-title sync index\\.(.+)\\.md$":
/*!**********************************************************************************************!*\
  !*** ./registry/lib/components/video/full-episode-title/ sync nonrecursive index\.(.+)\.md$ ***!
  \**********************************************************************************************/
/***/ (function(module) {

eval("function webpackEmptyContext(req) {\n\tvar e = new Error(\"Cannot find module '\" + req + \"'\");\n\te.code = 'MODULE_NOT_FOUND';\n\tthrow e;\n}\nwebpackEmptyContext.keys = function() { return []; };\nwebpackEmptyContext.resolve = webpackEmptyContext;\nwebpackEmptyContext.id = \"./registry/lib/components/video/full-episode-title sync index\\\\.(.+)\\\\.md$\";\nmodule.exports = webpackEmptyContext;\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/video/full-episode-title/_sync_nonrecursive_index\\.(.+)\\.md$?");

/***/ }),

/***/ "./registry/lib/components/video/full-episode-title/index.md":
/*!*******************************************************************!*\
  !*** ./registry/lib/components/video/full-episode-title/index.md ***!
  \*******************************************************************/
/***/ (function(module) {

"use strict";
eval("module.exports = \"提供一些视频选集区域的优化, 对番剧无效.\\r\\n- `展开选集标题`: 总是完全展开视频选集列表项的标题\\r\\n- `展开选集列表`: 总是完全展开视频选集列表\\r\\n\\r\\n打开 `展开选集列表` 时, 在选集区域的标题上按住 <kbd>Alt</kbd> 键点击可以临时切换展开/收起选集列表.\\r\\n\";\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/video/full-episode-title/index.md?");

/***/ }),

/***/ "@/components/define":
/*!******************************************************!*\
  !*** external ["coreApis","componentApis","define"] ***!
  \******************************************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.componentApis.define;

/***/ }),

/***/ "@/core/settings":
/*!****************************************!*\
  !*** external ["coreApis","settings"] ***!
  \****************************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.settings;

/***/ }),

/***/ "@/core/spin-query":
/*!*****************************************!*\
  !*** external ["coreApis","spinQuery"] ***!
  \*****************************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.spinQuery;

/***/ }),

/***/ "@/core/utils/urls":
/*!********************************************!*\
  !*** external ["coreApis","utils","urls"] ***!
  \********************************************/
/***/ (function(module) {

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
/******/ 	var __webpack_exports__ = __webpack_require__("./registry/lib/components/video/full-episode-title/index.ts");
/******/ 	__webpack_exports__ = __webpack_exports__.component;
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});