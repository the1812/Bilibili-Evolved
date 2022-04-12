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
		exports["feeds/fold-comments"] = factory();
	else
		root["feeds/fold-comments"] = factory();
})(self, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./registry/lib/components/feeds/fold-comments/index.ts":
/*!**************************************************************!*\
  !*** ./registry/lib/components/feeds/fold-comments/index.ts ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"component\": function() { return /* binding */ component; }\n/* harmony export */ });\n/* harmony import */ var _components_styled_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/components/styled-component */ \"@/components/styled-component\");\n/* harmony import */ var _components_styled_component__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_components_styled_component__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _core_utils_urls__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/core/utils/urls */ \"@/core/utils/urls\");\n/* harmony import */ var _core_utils_urls__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_core_utils_urls__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _components_feeds_api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/components/feeds/api */ \"@/components/feeds/api\");\n/* harmony import */ var _components_feeds_api__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_components_feeds_api__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _core_spin_query__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/core/spin-query */ \"@/core/spin-query\");\n/* harmony import */ var _core_spin_query__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_core_spin_query__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _core_observer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/core/observer */ \"@/core/observer\");\n/* harmony import */ var _core_observer__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_core_observer__WEBPACK_IMPORTED_MODULE_4__);\n\n\n\n\n\n\nconst entry = async () => {\n  const {\n    forEachFeedsCard\n  } = await Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! @/components/feeds/api */ \"@/components/feeds/api\", 23));\n  const {\n    childList\n  } = await Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! @/core/observer */ \"@/core/observer\", 23));\n  const commentSelector = '.bb-comment';\n\n  const injectButton = card => {\n    const injectToComment = async (panelArea, clickHandler) => {\n      const commentBox = await (0,_core_spin_query__WEBPACK_IMPORTED_MODULE_3__.select)(() => dq(panelArea, commentSelector));\n\n      if (commentBox.querySelector('.fold-comment') !== null) {\n        return;\n      }\n\n      if (commentBox === null) {\n        console.error('未找到评论区');\n        return;\n      }\n\n      const button = document.createElement('div');\n      button.classList.add('fold-comment');\n      button.innerHTML = '收起评论';\n      button.addEventListener('click', () => {\n        clickHandler();\n        card.scrollIntoView();\n      });\n      commentBox.insertAdjacentElement('beforeend', button);\n    };\n\n    if (_components_feeds_api__WEBPACK_IMPORTED_MODULE_2__.feedsCardsManager.managerType === 'v2') {\n      const existingComment = dq(card, commentSelector);\n\n      const handler = () => {\n        const button = dq(card, '.bili-dyn-action.comment');\n        button?.click();\n      };\n\n      if (!existingComment) {\n        const [observer] = (0,_core_observer__WEBPACK_IMPORTED_MODULE_4__.childListSubtree)(card, () => {\n          const panel = dq(card, commentSelector);\n\n          if (panel) {\n            injectToComment(card, handler);\n            observer.disconnect();\n          }\n        });\n      } else {\n        injectToComment(existingComment, handler);\n      }\n\n      return;\n    }\n\n    if (_components_feeds_api__WEBPACK_IMPORTED_MODULE_2__.feedsCardsManager.managerType === 'v1') {\n      const panelArea = card.querySelector('.panel-area');\n\n      if (panelArea === null) {\n        console.warn('panelArea not found', card);\n        return;\n      }\n\n      const handler = () => {\n        const buttonBar = card.querySelector('.button-bar');\n        const originalButton = buttonBar.children[1];\n        originalButton?.click();\n      };\n\n      if (panelArea.childElementCount === 0) {\n        const [observer] = childList(panelArea, records => {\n          if (records.length > 0) {\n            injectToComment(panelArea, handler);\n            observer.disconnect();\n          }\n        });\n      } else {\n        injectToComment(panelArea, handler);\n      }\n\n      return;\n    }\n\n    console.warn('unrecognized card type', card);\n  };\n\n  forEachFeedsCard({\n    added: c => injectButton(c.element)\n  });\n};\n\nconst component = {\n  name: 'foldComments',\n  displayName: '快速收起评论',\n  description: {\n    'zh-CN': '动态里查看评论区时, 在底部添加一个`收起评论`按钮, 这样就不用再回到上面收起了.'\n  },\n  urlInclude: _core_utils_urls__WEBPACK_IMPORTED_MODULE_1__.feedsUrlsWithoutDetail,\n  tags: [componentsTags.feeds],\n  entry: (0,_components_styled_component__WEBPACK_IMPORTED_MODULE_0__.styledComponentEntry)(() => Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./fold-comment.scss */ \"./registry/lib/components/feeds/fold-comments/fold-comment.scss\", 23)), entry),\n  commitHash: \"0e0d38ac40f392e59454e4ddde8572dd632370ee\",\n  coreVersion: \"2.1.6\"\n};\n\n//# sourceURL=webpack://%5Bname%5D/./registry/lib/components/feeds/fold-comments/index.ts?");

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-9[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-9[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-9[0].rules[0].use[3]!./registry/lib/components/feeds/fold-comments/fold-comment.scss":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??clonedRuleSet-9[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-9[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-9[0].rules[0].use[3]!./registry/lib/components/feeds/fold-comments/fold-comment.scss ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../../../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\nvar ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, \".bb-comment .fold-comment {\\n  position: sticky;\\n  bottom: 0;\\n  height: 40px;\\n  width: calc(100% + 48px);\\n  font-size: 14px;\\n  transform: translateX(-24px);\\n  display: flex;\\n  align-items: center;\\n  justify-content: center;\\n  background-color: white;\\n  color: #99a2aa;\\n  cursor: pointer;\\n  transition: all 0.2s ease-out;\\n  z-index: 110;\\n  border-radius: 4px;\\n}\\n.bb-comment .fold-comment:hover {\\n  color: black;\\n}\\nbody.dark .bb-comment .fold-comment {\\n  background-color: #444;\\n  color: #eee;\\n}\\nbody.dark .bb-comment .fold-comment:hover {\\n  color: var(--theme-color);\\n}\", \"\"]);\n// Exports\nmodule.exports = ___CSS_LOADER_EXPORT___;\n\n\n//# sourceURL=webpack://%5Bname%5D/./registry/lib/components/feeds/fold-comments/fold-comment.scss?./node_modules/css-loader/dist/cjs.js??clonedRuleSet-9%5B0%5D.rules%5B0%5D.use%5B1%5D!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-9%5B0%5D.rules%5B0%5D.use%5B2%5D!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-9%5B0%5D.rules%5B0%5D.use%5B3%5D");

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ (function(module) {

"use strict";
eval("\n\n/*\n  MIT License http://www.opensource.org/licenses/mit-license.php\n  Author Tobias Koppers @sokra\n*/\n// css base code, injected by the css-loader\n// eslint-disable-next-line func-names\nmodule.exports = function (cssWithMappingToString) {\n  var list = []; // return the list of modules as css string\n\n  list.toString = function toString() {\n    return this.map(function (item) {\n      var content = cssWithMappingToString(item);\n\n      if (item[2]) {\n        return \"@media \".concat(item[2], \" {\").concat(content, \"}\");\n      }\n\n      return content;\n    }).join(\"\");\n  }; // import a list of modules into the list\n  // eslint-disable-next-line func-names\n\n\n  list.i = function (modules, mediaQuery, dedupe) {\n    if (typeof modules === \"string\") {\n      // eslint-disable-next-line no-param-reassign\n      modules = [[null, modules, \"\"]];\n    }\n\n    var alreadyImportedModules = {};\n\n    if (dedupe) {\n      for (var i = 0; i < this.length; i++) {\n        // eslint-disable-next-line prefer-destructuring\n        var id = this[i][0];\n\n        if (id != null) {\n          alreadyImportedModules[id] = true;\n        }\n      }\n    }\n\n    for (var _i = 0; _i < modules.length; _i++) {\n      var item = [].concat(modules[_i]);\n\n      if (dedupe && alreadyImportedModules[item[0]]) {\n        // eslint-disable-next-line no-continue\n        continue;\n      }\n\n      if (mediaQuery) {\n        if (!item[2]) {\n          item[2] = mediaQuery;\n        } else {\n          item[2] = \"\".concat(mediaQuery, \" and \").concat(item[2]);\n        }\n      }\n\n      list.push(item);\n    }\n  };\n\n  return list;\n};\n\n//# sourceURL=webpack://%5Bname%5D/./node_modules/css-loader/dist/runtime/api.js?");

/***/ }),

/***/ "./registry/lib/components/feeds/fold-comments/fold-comment.scss":
/*!***********************************************************************!*\
  !*** ./registry/lib/components/feeds/fold-comments/fold-comment.scss ***!
  \***********************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval("\n        var result = __webpack_require__(/*! !!../../../../../node_modules/css-loader/dist/cjs.js??clonedRuleSet-9[0].rules[0].use[1]!../../../../../node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-9[0].rules[0].use[2]!../../../../../node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-9[0].rules[0].use[3]!./fold-comment.scss */ \"./node_modules/css-loader/dist/cjs.js??clonedRuleSet-9[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-9[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-9[0].rules[0].use[3]!./registry/lib/components/feeds/fold-comments/fold-comment.scss\");\n\n        if (result && result.__esModule) {\n            result = result.default;\n        }\n\n        if (typeof result === \"string\") {\n            module.exports = result;\n        } else {\n            module.exports = result.toString();\n        }\n    \n\n//# sourceURL=webpack://%5Bname%5D/./registry/lib/components/feeds/fold-comments/fold-comment.scss?");

/***/ }),

/***/ "@/components/feeds/api":
/*!***********************************************************!*\
  !*** external ["coreApis","componentApis","feeds","api"] ***!
  \***********************************************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.componentApis.feeds.api;

/***/ }),

/***/ "@/components/styled-component":
/*!***************************************************************!*\
  !*** external ["coreApis","componentApis","styledComponent"] ***!
  \***************************************************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.componentApis.styledComponent;

/***/ }),

/***/ "@/core/observer":
/*!****************************************!*\
  !*** external ["coreApis","observer"] ***!
  \****************************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.observer;

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
/******/ 	var __webpack_exports__ = __webpack_require__("./registry/lib/components/feeds/fold-comments/index.ts");
/******/ 	__webpack_exports__ = __webpack_exports__.component;
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});