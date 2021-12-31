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
		exports["utils/comments/copy-link"] = factory();
	else
		root["utils/comments/copy-link"] = factory();
})(self, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./registry/lib/components/utils/comments/copy-link/index.ts":
/*!*******************************************************************!*\
  !*** ./registry/lib/components/utils/comments/copy-link/index.ts ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"component\": function() { return /* binding */ component; }\n/* harmony export */ });\n/* harmony import */ var _core_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/core/utils */ \"@/core/utils\");\n/* harmony import */ var _core_utils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_core_utils__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _core_utils_urls__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/core/utils/urls */ \"@/core/utils/urls\");\n/* harmony import */ var _core_utils_urls__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_core_utils_urls__WEBPACK_IMPORTED_MODULE_1__);\n\n\n\nconst entry = async () => {\n  const {\n    forEachCommentItem,\n    addMenuItem\n  } = await Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! @/components/utils/comment-apis */ \"@/components/utils/comment-apis\", 23));\n\n  const findParentFeedsUrl = commentElement => {\n    if (document.URL.match(/\\/\\/t\\.bilibili\\.com\\/(\\d+)/)) {\n      return '';\n    }\n\n    if (_core_utils_urls__WEBPACK_IMPORTED_MODULE_1__.feedsUrls.every(url => !(0,_core_utils__WEBPACK_IMPORTED_MODULE_0__.matchUrlPattern)(url))) {\n      return '';\n    }\n\n    let element = commentElement;\n\n    while (element !== null && element !== document.body) {\n      if (element.hasAttribute('data-did')) {\n        return `https://t.bilibili.com/${element.getAttribute('data-did')}`;\n      }\n\n      element = element.parentElement;\n    }\n\n    return '';\n  };\n\n  const addCopyLinkButton = comment => {\n    const processItems = items => {\n      items.forEach(item => {\n        addMenuItem(item, {\n          className: 'copy-link',\n          text: '复制链接',\n          action: async () => {\n            const url = findParentFeedsUrl(item.element) || document.URL.replace(location.hash, '');\n            await navigator.clipboard.writeText(`${url}#reply${item.id}`);\n            const operaList = dq(item.element, '.opera-list');\n\n            if (operaList) {\n              operaList.style.display = 'none';\n            }\n          }\n        });\n      });\n    };\n\n    processItems([comment, ...comment.replies]);\n\n    comment.onRepliesUpdate = replies => processItems(replies);\n  };\n\n  forEachCommentItem({\n    added: addCopyLinkButton\n  });\n};\n\nconst component = {\n  name: 'copyCommentsLink',\n  displayName: '复制评论链接',\n  description: {\n    'zh-CN': '开启后, 可在每条评论的菜单中选择复制链接.'\n  },\n  entry,\n  tags: [componentsTags.utils],\n  commitHash: \"9637948c303b59793929e67434b13afb995509d6\"\n};\n\n//# sourceURL=webpack://%5Bname%5D/./registry/lib/components/utils/comments/copy-link/index.ts?");

/***/ }),

/***/ "@/components/utils/comment-apis":
/*!*******************************************************************!*\
  !*** external ["coreApis","componentApis","utils","commentApis"] ***!
  \*******************************************************************/
/***/ (function(module) {

module.exports = coreApis.componentApis.utils.commentApis;

/***/ }),

/***/ "@/core/utils/urls":
/*!********************************************!*\
  !*** external ["coreApis","utils","urls"] ***!
  \********************************************/
/***/ (function(module) {

module.exports = coreApis.utils.urls;

/***/ }),

/***/ "@/core/utils":
/*!*************************************!*\
  !*** external ["coreApis","utils"] ***!
  \*************************************/
/***/ (function(module) {

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
/******/ 	var __webpack_exports__ = __webpack_require__("./registry/lib/components/utils/comments/copy-link/index.ts");
/******/ 	__webpack_exports__ = __webpack_exports__.component;
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});