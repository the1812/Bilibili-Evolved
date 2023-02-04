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
		exports["utils/comments/disable-search-link"] = factory();
	else
		root["utils/comments/disable-search-link"] = factory();
})(globalThis, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./registry/lib/components/utils/comments/disable-search-link/index.ts":
/*!*****************************************************************************!*\
  !*** ./registry/lib/components/utils/comments/disable-search-link/index.ts ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"component\": () => (/* binding */ component)\n/* harmony export */ });\n/* harmony import */ var _components_define__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/components/define */ \"@/components/define\");\n/* harmony import */ var _components_define__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_components_define__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _components_utils_comment_apis__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/utils/comment-apis */ \"@/components/utils/comment-apis\");\n/* harmony import */ var _components_utils_comment_apis__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_components_utils_comment_apis__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _core_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/core/utils */ \"@/core/utils\");\n/* harmony import */ var _core_utils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_core_utils__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nconst name = 'disableCommentsSearchLink';\nlet prevent = false;\nconst component = (0,_components_define__WEBPACK_IMPORTED_MODULE_0__.defineComponentMetadata)({\n  name,\n  displayName: '禁用评论区搜索词',\n  instantStyles: [{\n    name,\n    style: () => Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./disable-search-link.scss */ \"./registry/lib/components/utils/comments/disable-search-link/disable-search-link.scss\", 23))\n  }],\n  tags: [componentsTags.utils, componentsTags.style],\n  entry: async () => {\n    prevent = true;\n    (0,_components_utils_comment_apis__WEBPACK_IMPORTED_MODULE_1__.forEachCommentArea)(area => {\n      (0,_core_utils__WEBPACK_IMPORTED_MODULE_2__.preventEvent)(area.element, 'click', e => {\n        if (!(e.target instanceof HTMLElement) || !prevent) {\n          return false;\n        }\n\n        const element = e.target;\n\n        if (['.jump-link.search-word', '.icon.search-word'].some(selector => element.matches(selector))) {\n          return true;\n        }\n\n        return false;\n      });\n    });\n  },\n  reload: () => {\n    prevent = true;\n  },\n  unload: () => {\n    prevent = false;\n  },\n  commitHash: \"58512315d6552d8b4713ddb8bb44dcd2fb175703\",\n  coreVersion: \"2.6.0\",\n  description: (() => {\n    const context = __webpack_require__(\"./registry/lib/components/utils/comments/disable-search-link sync index\\\\.(.+)\\\\.md$\");\n\n    return { ...Object.fromEntries(context.keys().map(path => {\n        const key = path.match(/index\\.(.+)\\.md$/)[1];\n        const value = context(path);\n        return [key, value];\n      })),\n      'zh-CN': () => Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./index.md */ \"./registry/lib/components/utils/comments/disable-search-link/index.md\", 17)).then(m => m.default)\n    };\n  })()\n});\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/utils/comments/disable-search-link/index.ts?");

/***/ }),

/***/ "./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_g4najheu5gwop3kphiif6aqpde/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0+webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./registry/lib/components/utils/comments/disable-search-link/disable-search-link.scss":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_g4najheu5gwop3kphiif6aqpde/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0+webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./registry/lib/components/utils/comments/disable-search-link/disable-search-link.scss ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../../../../node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js\");\nvar ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, \".search-word.icon {\\n  display: none !important;\\n}\\n.search-word.jump-link {\\n  color: inherit !important;\\n  cursor: text !important;\\n}\", \"\"]);\n// Exports\nmodule.exports = ___CSS_LOADER_EXPORT___;\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/utils/comments/disable-search-link/disable-search-link.scss?./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19%5B0%5D.rules%5B0%5D.use%5B1%5D!./node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_g4najheu5gwop3kphiif6aqpde/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19%5B0%5D.rules%5B0%5D.use%5B2%5D!./node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0+webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19%5B0%5D.rules%5B0%5D.use%5B3%5D");

/***/ }),

/***/ "./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js":
/*!*******************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js ***!
  \*******************************************************************************************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n/*\n  MIT License http://www.opensource.org/licenses/mit-license.php\n  Author Tobias Koppers @sokra\n*/\n// css base code, injected by the css-loader\n// eslint-disable-next-line func-names\nmodule.exports = function (cssWithMappingToString) {\n  var list = []; // return the list of modules as css string\n\n  list.toString = function toString() {\n    return this.map(function (item) {\n      var content = cssWithMappingToString(item);\n\n      if (item[2]) {\n        return \"@media \".concat(item[2], \" {\").concat(content, \"}\");\n      }\n\n      return content;\n    }).join(\"\");\n  }; // import a list of modules into the list\n  // eslint-disable-next-line func-names\n\n\n  list.i = function (modules, mediaQuery, dedupe) {\n    if (typeof modules === \"string\") {\n      // eslint-disable-next-line no-param-reassign\n      modules = [[null, modules, \"\"]];\n    }\n\n    var alreadyImportedModules = {};\n\n    if (dedupe) {\n      for (var i = 0; i < this.length; i++) {\n        // eslint-disable-next-line prefer-destructuring\n        var id = this[i][0];\n\n        if (id != null) {\n          alreadyImportedModules[id] = true;\n        }\n      }\n    }\n\n    for (var _i = 0; _i < modules.length; _i++) {\n      var item = [].concat(modules[_i]);\n\n      if (dedupe && alreadyImportedModules[item[0]]) {\n        // eslint-disable-next-line no-continue\n        continue;\n      }\n\n      if (mediaQuery) {\n        if (!item[2]) {\n          item[2] = mediaQuery;\n        } else {\n          item[2] = \"\".concat(mediaQuery, \" and \").concat(item[2]);\n        }\n      }\n\n      list.push(item);\n    }\n  };\n\n  return list;\n};\n\n//# sourceURL=webpack://@bevo/core/./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/runtime/api.js?");

/***/ }),

/***/ "./registry/lib/components/utils/comments/disable-search-link/disable-search-link.scss":
/*!*********************************************************************************************!*\
  !*** ./registry/lib/components/utils/comments/disable-search-link/disable-search-link.scss ***!
  \*********************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n        var result = __webpack_require__(/*! !!../../../../../../node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!../../../../../../node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_g4najheu5gwop3kphiif6aqpde/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!../../../../../../node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0+webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./disable-search-link.scss */ \"./node_modules/.pnpm/registry.npmmirror.com+css-loader@5.2.7_webpack@5.72.0/node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/.pnpm/registry.npmmirror.com+postcss-loader@4.3.0_g4najheu5gwop3kphiif6aqpde/node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/.pnpm/registry.npmmirror.com+fast-sass-loader@2.0.1_sass@1.51.0+webpack@5.72.0/node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./registry/lib/components/utils/comments/disable-search-link/disable-search-link.scss\");\n\n        if (result && result.__esModule) {\n            result = result.default;\n        }\n\n        if (typeof result === \"string\") {\n            module.exports = result;\n        } else {\n            module.exports = result.toString();\n        }\n    \n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/utils/comments/disable-search-link/disable-search-link.scss?");

/***/ }),

/***/ "./registry/lib/components/utils/comments/disable-search-link sync index\\.(.+)\\.md$":
/*!********************************************************************************************************!*\
  !*** ./registry/lib/components/utils/comments/disable-search-link/ sync nonrecursive index\.(.+)\.md$ ***!
  \********************************************************************************************************/
/***/ ((module) => {

eval("function webpackEmptyContext(req) {\n\tvar e = new Error(\"Cannot find module '\" + req + \"'\");\n\te.code = 'MODULE_NOT_FOUND';\n\tthrow e;\n}\nwebpackEmptyContext.keys = () => ([]);\nwebpackEmptyContext.resolve = webpackEmptyContext;\nwebpackEmptyContext.id = \"./registry/lib/components/utils/comments/disable-search-link sync index\\\\.(.+)\\\\.md$\";\nmodule.exports = webpackEmptyContext;\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/utils/comments/disable-search-link/_sync_nonrecursive_index\\.(.+)\\.md$?");

/***/ }),

/***/ "./registry/lib/components/utils/comments/disable-search-link/index.md":
/*!*****************************************************************************!*\
  !*** ./registry/lib/components/utils/comments/disable-search-link/index.md ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
eval("module.exports = \"禁用评论区的搜索词链接.\";\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/utils/comments/disable-search-link/index.md?");

/***/ }),

/***/ "@/components/define":
/*!******************************************************!*\
  !*** external ["coreApis","componentApis","define"] ***!
  \******************************************************/
/***/ ((module) => {

"use strict";
module.exports = coreApis.componentApis.define;

/***/ }),

/***/ "@/components/utils/comment-apis":
/*!*******************************************************************!*\
  !*** external ["coreApis","componentApis","utils","commentApis"] ***!
  \*******************************************************************/
/***/ ((module) => {

"use strict";
module.exports = coreApis.componentApis.utils.commentApis;

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
/******/ 	var __webpack_exports__ = __webpack_require__("./registry/lib/components/utils/comments/disable-search-link/index.ts");
/******/ 	__webpack_exports__ = __webpack_exports__.component;
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});