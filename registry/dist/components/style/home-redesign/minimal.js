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
		exports["style/home-redesign/minimal"] = factory();
	else
		root["style/home-redesign/minimal"] = factory();
})(self, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=script&lang=ts&":
/*!********************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=script&lang=ts& ***!
  \********************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (Vue.extend({}));\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?./node_modules/babel-loader/lib/index.js??clonedRuleSet-20%5B0%5D.rules%5B0%5D.use%5B0%5D!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=script&lang=ts&":
/*!***********************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=script&lang=ts& ***!
  \***********************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _core_settings__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/core/settings */ \"@/core/settings\");\n/* harmony import */ var _core_settings__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_core_settings__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/ui */ \"@/ui\");\n/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_ui__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _HomeRedesignBase_vue__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../HomeRedesignBase.vue */ \"./registry/lib/components/style/home-redesign/HomeRedesignBase.vue\");\n/* harmony import */ var _options__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./options */ \"./registry/lib/components/style/home-redesign/minimal/options.ts\");\n/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./types */ \"./registry/lib/components/style/home-redesign/minimal/types.ts\");\n\n\n\n\n\nconst tabs = [{\n  name: _types__WEBPACK_IMPORTED_MODULE_4__.MinimalHomeTabOption.Feeds,\n  displayName: '动态',\n  component: () => Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./tabs/MinimalHomeFeeds.vue */ \"./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue\")).then(m => m.default),\n  activeLink: 'https://t.bilibili.com/?tab=video'\n}, {\n  name: _types__WEBPACK_IMPORTED_MODULE_4__.MinimalHomeTabOption.Trending,\n  displayName: _options__WEBPACK_IMPORTED_MODULE_3__.minimalHomeOptions.personalized ? '推荐' : '热门',\n  component: () => Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./tabs/MinimalHomeTrending.vue */ \"./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue\")).then(m => m.default),\n  activeLink: 'https://www.bilibili.com/v/popular/all'\n}];\n/* harmony default export */ __webpack_exports__[\"default\"] = (Vue.extend({\n  components: {\n    HomeRedesignBase: _HomeRedesignBase_vue__WEBPACK_IMPORTED_MODULE_2__[\"default\"],\n    TabControl: _ui__WEBPACK_IMPORTED_MODULE_1__.TabControl\n  },\n\n  data() {\n    return {\n      tabs\n    };\n  },\n\n  mounted() {\n    const columnCountKey = '--minimal-home-column-count-override';\n    (0,_core_settings__WEBPACK_IMPORTED_MODULE_0__.addComponentListener)('minimalHome.columnCount', count => {\n      if (count > 0) {\n        this.$el.style.setProperty(columnCountKey, count.toString());\n      } else {\n        this.$el.style.removeProperty(columnCountKey);\n      }\n    }, true);\n  }\n\n}));\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?./node_modules/babel-loader/lib/index.js??clonedRuleSet-20%5B0%5D.rules%5B0%5D.use%5B0%5D!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=script&lang=ts&":
/*!*********************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=script&lang=ts& ***!
  \*********************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/ui */ \"@/ui\");\n/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_ui__WEBPACK_IMPORTED_MODULE_0__);\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Vue.extend({\n  components: {\n    VButton: _ui__WEBPACK_IMPORTED_MODULE_0__.VButton,\n    VIcon: _ui__WEBPACK_IMPORTED_MODULE_0__.VIcon\n  },\n\n  data() {\n    return {\n      size: 28\n    };\n  },\n\n  methods: {\n    backToTop() {\n      window.scrollTo(0, 0);\n    }\n\n  }\n}));\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?./node_modules/babel-loader/lib/index.js??clonedRuleSet-20%5B0%5D.rules%5B0%5D.use%5B0%5D!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=script&lang=ts&":
/*!*********************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=script&lang=ts& ***!
  \*********************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _components_feeds_api__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/components/feeds/api */ \"@/components/feeds/api\");\n/* harmony import */ var _components_feeds_api__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_components_feeds_api__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _components_feeds_VideoCard_vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/feeds/VideoCard.vue */ \"@/components/feeds/VideoCard.vue\");\n/* harmony import */ var _components_feeds_VideoCard_vue__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_components_feeds_VideoCard_vue__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _core_utils_log__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/core/utils/log */ \"@/core/utils/log\");\n/* harmony import */ var _core_utils_log__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_core_utils_log__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _core_utils_sort__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/core/utils/sort */ \"@/core/utils/sort\");\n/* harmony import */ var _core_utils_sort__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_core_utils_sort__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/ui */ \"@/ui\");\n/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_ui__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _MinimalHomeOperations_vue__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../MinimalHomeOperations.vue */ \"./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue\");\n\n\n\n\n\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Vue.extend({\n  components: {\n    ScrollTrigger: _ui__WEBPACK_IMPORTED_MODULE_4__.ScrollTrigger,\n    VEmpty: _ui__WEBPACK_IMPORTED_MODULE_4__.VEmpty,\n    VideoCard: (_components_feeds_VideoCard_vue__WEBPACK_IMPORTED_MODULE_1___default()),\n    MinimalHomeOperations: _MinimalHomeOperations_vue__WEBPACK_IMPORTED_MODULE_5__[\"default\"]\n  },\n\n  data() {\n    return {\n      loading: true,\n      cards: [],\n      error: false\n    };\n  },\n\n  computed: {\n    loaded() {\n      return !this.loading && !this.error;\n    },\n\n    lastID() {\n      if (!this.cards.length) {\n        return null;\n      }\n\n      const cards = [...this.cards];\n      return cards.sort((0,_core_utils_sort__WEBPACK_IMPORTED_MODULE_3__.ascendingStringSort)(c => c.id))[0].id;\n    }\n\n  },\n  methods: {\n    async loadCards() {\n      try {\n        this.error = false;\n        this.loading = true;\n        this.cards = lodash.uniqBy([...this.cards, ...(await (0,_components_feeds_api__WEBPACK_IMPORTED_MODULE_0__.getVideoFeeds)('video', this.lastID))], it => it.id);\n      } catch (error) {\n        (0,_core_utils_log__WEBPACK_IMPORTED_MODULE_2__.logError)(error);\n        this.error = true;\n      } finally {\n        this.loading = false;\n      }\n    },\n\n    async refresh() {\n      this.cards = [];\n    }\n\n  }\n}));\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?./node_modules/babel-loader/lib/index.js??clonedRuleSet-20%5B0%5D.rules%5B0%5D.use%5B0%5D!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?vue&type=script&lang=ts&":
/*!************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?vue&type=script&lang=ts& ***!
  \************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (Vue.extend({\n  computed: {},\n  methods: {}\n}));\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?./node_modules/babel-loader/lib/index.js??clonedRuleSet-20%5B0%5D.rules%5B0%5D.use%5B0%5D!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/index.ts":
/*!**********************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/index.ts ***!
  \**********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"component\": function() { return /* binding */ component; }\n/* harmony export */ });\n/* harmony import */ var _components_define__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/components/define */ \"@/components/define\");\n/* harmony import */ var _components_define__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_components_define__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _core_life_cycle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/core/life-cycle */ \"@/core/life-cycle\");\n/* harmony import */ var _core_life_cycle__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_core_life_cycle__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _core_settings__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/core/settings */ \"@/core/settings\");\n/* harmony import */ var _core_settings__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_core_settings__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _core_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/core/utils */ \"@/core/utils\");\n/* harmony import */ var _core_utils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_core_utils__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _urls__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../urls */ \"./registry/lib/components/style/home-redesign/urls.ts\");\n/* harmony import */ var _options__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./options */ \"./registry/lib/components/style/home-redesign/minimal/options.ts\");\n\n\n\n\n\n\nconst component = (0,_components_define__WEBPACK_IMPORTED_MODULE_0__.defineComponentMetadata)({\n  name: 'minimalHome',\n  displayName: '极简首页',\n  urlInclude: _urls__WEBPACK_IMPORTED_MODULE_4__.homeUrls,\n  tags: [componentsTags.style],\n  entry: () => {\n    (0,_core_settings__WEBPACK_IMPORTED_MODULE_2__.addComponentListener)('minimalHome.columnCount', count => {\n      document.documentElement.style.setProperty('--home-column-count-override', count.toString());\n    }, true);\n    (0,_core_life_cycle__WEBPACK_IMPORTED_MODULE_1__.contentLoaded)(async () => {\n      const MinimalHome = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./MinimalHome.vue */ \"./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue\"));\n      const minimalHome = (0,_core_utils__WEBPACK_IMPORTED_MODULE_3__.mountVueComponent)(MinimalHome);\n      document.body.appendChild(minimalHome.$el);\n    });\n  },\n  options: _options__WEBPACK_IMPORTED_MODULE_5__.minimalHomeOptionsMetadata,\n  unload: () => document.body.classList.add('home-redesign-off'),\n  reload: () => document.body.classList.remove('home-redesign-off'),\n  instantStyles: [{\n    name: 'minimal-home-hide-original',\n    style: () => Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! ../hide-original.scss */ \"./registry/lib/components/style/home-redesign/hide-original.scss\", 23))\n  }],\n  commitHash: \"4bcb6d6a39e5112657dfbac771479044494e3513\",\n  coreVersion: \"2.2.1\",\n  description: (() => {\n    const context = __webpack_require__(\"./registry/lib/components/style/home-redesign/minimal sync index\\\\.(.+)\\\\.md$\");\n\n    return { ...Object.fromEntries(context.keys().map(path => {\n        const key = path.match(/index\\.(.+)\\.md$/)[1];\n        const value = context(path);\n        return [key, value];\n      })),\n      'zh-CN': () => Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./index.md */ \"./registry/lib/components/style/home-redesign/minimal/index.md\", 17)).then(m => m.default)\n    };\n  })()\n});\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/index.ts?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/options.ts":
/*!************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/options.ts ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"minimalHomeOptions\": function() { return /* binding */ minimalHomeOptions; },\n/* harmony export */   \"minimalHomeOptionsMetadata\": function() { return /* binding */ minimalHomeOptionsMetadata; }\n/* harmony export */ });\n/* harmony import */ var _components_define__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/components/define */ \"@/components/define\");\n/* harmony import */ var _components_define__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_components_define__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _core_settings__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/core/settings */ \"@/core/settings\");\n/* harmony import */ var _core_settings__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_core_settings__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _core_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/core/utils */ \"@/core/utils\");\n/* harmony import */ var _core_utils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_core_utils__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./types */ \"./registry/lib/components/style/home-redesign/minimal/types.ts\");\n\n\n\n\nconst minimalHomeOptionsMetadata = (0,_components_define__WEBPACK_IMPORTED_MODULE_0__.defineOptionsMetadata)({\n  personalized: {\n    displayName: '个性化推荐',\n    defaultValue: false\n  },\n  columnCount: {\n    displayName: '自定义列数',\n    defaultValue: 0,\n    validator: (0,_core_utils__WEBPACK_IMPORTED_MODULE_2__.getNumberValidator)(0, 10)\n  },\n  defaultTab: {\n    displayName: '默认标签页',\n    defaultValue: _types__WEBPACK_IMPORTED_MODULE_3__.MinimalHomeTabOption.Feeds,\n    dropdownEnum: _types__WEBPACK_IMPORTED_MODULE_3__.MinimalHomeTabOption\n  }\n});\nconst minimalHomeOptions = (0,_core_settings__WEBPACK_IMPORTED_MODULE_1__.getComponentSettings)('minimalHome').options;\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/options.ts?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/types.ts":
/*!**********************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/types.ts ***!
  \**********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"MinimalHomeTabOption\": function() { return /* binding */ MinimalHomeTabOption; }\n/* harmony export */ });\nlet MinimalHomeTabOption;\n\n(function (MinimalHomeTabOption) {\n  MinimalHomeTabOption[\"Feeds\"] = \"\\u52A8\\u6001\";\n  MinimalHomeTabOption[\"Trending\"] = \"\\u70ED\\u95E8 / \\u63A8\\u8350\";\n})(MinimalHomeTabOption || (MinimalHomeTabOption = {}));\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/types.ts?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/urls.ts":
/*!*************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/urls.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"homeUrls\": function() { return /* binding */ homeUrls; }\n/* harmony export */ });\nconst homeUrls = [/^https:\\/\\/www\\.bilibili\\.com\\/$/, /^https:\\/\\/www\\.bilibili\\.com\\/index\\.html$/];\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/urls.ts?");

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=style&index=0&lang=scss&":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=style&index=0&lang=scss& ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../../../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\nvar ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, \"body {\\n  display: flex;\\n  align-items: stretch;\\n  flex-direction: column;\\n  gap: 0;\\n  min-height: 100vh;\\n}\\n#i_cecream {\\n  width: 100%;\\n}\\n.home-redesign-base {\\n  --home-base-color: #fff;\\n  --home-background-color: #fff;\\n  --home-color: #000;\\n  --home-max-width: var(--home-max-width-override, 1440px);\\n  --home-content-height: 250px;\\n  --home-card-radius: 12px;\\n  --home-card-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);\\n  --home-card-border: 1px solid #8882;\\n  background-color: var(--home-base-color);\\n  color: var(--home-color);\\n  font-size: 12px;\\n  flex-grow: 1;\\n  line-height: normal;\\n  display: flex;\\n  align-items: center;\\n  flex-direction: column;\\n  gap: 0;\\n}\\nbody.dark .home-redesign-base {\\n  --home-base-color: #181818;\\n  --home-background-color: #282828;\\n  --home-color: #eee;\\n  --home-card-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.2);\\n}\\nbody.home-redesign-off .home-redesign-base {\\n  display: none;\\n}\\nhtml {\\n  scroll-behavior: smooth;\\n}\", \"\"]);\n// Exports\nmodule.exports = ___CSS_LOADER_EXPORT___;\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B1%5D!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B2%5D!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B3%5D!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=style&index=0&lang=scss&":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=style&index=0&lang=scss& ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../../../../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\nvar ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, \".minimal-home {\\n  --minimal-home-auto-card-columns: 1;\\n  --card-width: 600px;\\n  --card-height: 122px;\\n  --minimal-home-card-column: var(\\n    --minimal-home-column-count-override,\\n    var(--minimal-home-auto-card-column)\\n  );\\n  padding: 24px 32px;\\n}\\n@media screen and (min-width: 1080px) {\\n.minimal-home {\\n    --minimal-home-auto-card-column: 2;\\n}\\n}\\n@media screen and (min-width: 2520px) {\\n.minimal-home {\\n    --minimal-home-auto-card-column: 3;\\n}\\n}\", \"\"]);\n// Exports\nmodule.exports = ___CSS_LOADER_EXPORT___;\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B1%5D!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B2%5D!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B3%5D!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=style&index=0&lang=scss&":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=style&index=0&lang=scss& ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../../../../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\nvar ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, \".minimal-home-operations {\\n  display: flex;\\n  align-items: center;\\n  flex-direction: column;\\n  gap: 12px;\\n  position: fixed;\\n  bottom: 48px;\\n  right: 48px;\\n}\\n.minimal-home-operations .be-button {\\n  padding: 8px !important;\\n  opacity: 0.5;\\n}\\n.minimal-home-operations .be-button:hover {\\n  opacity: 1;\\n}\\n.minimal-home-operations-refresh .mdi {\\n  transition-duration: 0.5s;\\n}\\n.minimal-home-operations-refresh .mdi:hover {\\n  transform: rotate(1turn);\\n}\\n.minimal-home-operations-top .mdi:hover {\\n  animation: bounce-y--2 0.4s ease-out;\\n}\\n@keyframes bounce-y--2 {\\n0%, 100% {\\n    transform: translateY(0);\\n}\\n50% {\\n    transform: translateY(-2px);\\n}\\n}\", \"\"]);\n// Exports\nmodule.exports = ___CSS_LOADER_EXPORT___;\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B1%5D!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B2%5D!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B3%5D!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=style&index=0&lang=scss&":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=style&index=0&lang=scss& ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../../../../../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\nvar ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, \".minimal-home-feeds-cards {\\n  display: grid;\\n  grid-template-columns: repeat(var(--minimal-home-card-column), var(--card-width));\\n  gap: 12px;\\n  padding: 0 8px;\\n  margin-bottom: 16px;\\n}\\n.minimal-home-feeds-cards .video-card * {\\n  transition: 0.2s ease-out;\\n}\", \"\"]);\n// Exports\nmodule.exports = ___CSS_LOADER_EXPORT___;\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B1%5D!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B2%5D!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B3%5D!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./registry/lib/components/style/home-redesign/hide-original.scss":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./registry/lib/components/style/home-redesign/hide-original.scss ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../../../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\nvar ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, \".international-home > :not(.international-header),\\n.international-header .b-wrap,\\n.international-footer,\\n#app > .bili-wrapper,\\n#app > .elevator-module,\\n#app > .bili-header-m.stardust-common > .bili-wrapper,\\n.bili-header-m .head-banner .head-content .head-logo,\\n#i_cecream .bili-header__channel,\\n#i_cecream > :not(.bili-header) {\\n  position: fixed;\\n  visibility: hidden;\\n  top: 200vh;\\n  left: 0;\\n  height: 0 !important;\\n  padding: 0 !important;\\n  margin: 0 !important;\\n  overflow: hidden !important;\\n}\", \"\"]);\n// Exports\nmodule.exports = ___CSS_LOADER_EXPORT___;\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/hide-original.scss?./node_modules/css-loader/dist/cjs.js??clonedRuleSet-19%5B0%5D.rules%5B0%5D.use%5B1%5D!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19%5B0%5D.rules%5B0%5D.use%5B2%5D!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19%5B0%5D.rules%5B0%5D.use%5B3%5D");

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ (function(module) {

"use strict";
eval("\n\n/*\n  MIT License http://www.opensource.org/licenses/mit-license.php\n  Author Tobias Koppers @sokra\n*/\n// css base code, injected by the css-loader\n// eslint-disable-next-line func-names\nmodule.exports = function (cssWithMappingToString) {\n  var list = []; // return the list of modules as css string\n\n  list.toString = function toString() {\n    return this.map(function (item) {\n      var content = cssWithMappingToString(item);\n\n      if (item[2]) {\n        return \"@media \".concat(item[2], \" {\").concat(content, \"}\");\n      }\n\n      return content;\n    }).join(\"\");\n  }; // import a list of modules into the list\n  // eslint-disable-next-line func-names\n\n\n  list.i = function (modules, mediaQuery, dedupe) {\n    if (typeof modules === \"string\") {\n      // eslint-disable-next-line no-param-reassign\n      modules = [[null, modules, \"\"]];\n    }\n\n    var alreadyImportedModules = {};\n\n    if (dedupe) {\n      for (var i = 0; i < this.length; i++) {\n        // eslint-disable-next-line prefer-destructuring\n        var id = this[i][0];\n\n        if (id != null) {\n          alreadyImportedModules[id] = true;\n        }\n      }\n    }\n\n    for (var _i = 0; _i < modules.length; _i++) {\n      var item = [].concat(modules[_i]);\n\n      if (dedupe && alreadyImportedModules[item[0]]) {\n        // eslint-disable-next-line no-continue\n        continue;\n      }\n\n      if (mediaQuery) {\n        if (!item[2]) {\n          item[2] = mediaQuery;\n        } else {\n          item[2] = \"\".concat(mediaQuery, \" and \").concat(item[2]);\n        }\n      }\n\n      list.push(item);\n    }\n  };\n\n  return list;\n};\n\n//# sourceURL=webpack://@bevo/core/./node_modules/css-loader/dist/runtime/api.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=style&index=0&lang=scss&":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=style&index=0&lang=scss& ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ \"./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_HomeRedesignBase_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../../../node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!../../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../../node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!../../../../../node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./HomeRedesignBase.vue?vue&type=style&index=0&lang=scss& */ \"./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=style&index=0&lang=scss&\");\n/* harmony import */ var _node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_HomeRedesignBase_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_HomeRedesignBase_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1__);\n\n            \n\nvar options = {};\n\noptions.insert = \"head\";\noptions.singleton = false;\n\nvar update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()((_node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_HomeRedesignBase_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1___default()), options);\n\n\n\n/* harmony default export */ __webpack_exports__[\"default\"] = ((_node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_HomeRedesignBase_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1___default().locals) || {});\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B1%5D!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B2%5D!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B3%5D!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=style&index=0&lang=scss&":
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=style&index=0&lang=scss& ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ \"./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHome_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../../../../node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!../../../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../../../node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!../../../../../../node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!../../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MinimalHome.vue?vue&type=style&index=0&lang=scss& */ \"./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=style&index=0&lang=scss&\");\n/* harmony import */ var _node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHome_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHome_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1__);\n\n            \n\nvar options = {};\n\noptions.insert = \"head\";\noptions.singleton = false;\n\nvar update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()((_node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHome_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1___default()), options);\n\n\n\n/* harmony default export */ __webpack_exports__[\"default\"] = ((_node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHome_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1___default().locals) || {});\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B1%5D!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B2%5D!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B3%5D!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=style&index=0&lang=scss&":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=style&index=0&lang=scss& ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ \"./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeOperations_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../../../../node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!../../../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../../../node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!../../../../../../node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!../../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MinimalHomeOperations.vue?vue&type=style&index=0&lang=scss& */ \"./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=style&index=0&lang=scss&\");\n/* harmony import */ var _node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeOperations_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeOperations_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1__);\n\n            \n\nvar options = {};\n\noptions.insert = \"head\";\noptions.singleton = false;\n\nvar update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()((_node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeOperations_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1___default()), options);\n\n\n\n/* harmony default export */ __webpack_exports__[\"default\"] = ((_node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeOperations_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1___default().locals) || {});\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B1%5D!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B2%5D!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B3%5D!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=style&index=0&lang=scss&":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=style&index=0&lang=scss& ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../../../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ \"./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeFeeds_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../../../../../node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!../../../../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../../../../node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!../../../../../../../node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!../../../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MinimalHomeFeeds.vue?vue&type=style&index=0&lang=scss& */ \"./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=style&index=0&lang=scss&\");\n/* harmony import */ var _node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeFeeds_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeFeeds_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1__);\n\n            \n\nvar options = {};\n\noptions.insert = \"head\";\noptions.singleton = false;\n\nvar update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()((_node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeFeeds_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1___default()), options);\n\n\n\n/* harmony default export */ __webpack_exports__[\"default\"] = ((_node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeFeeds_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_1___default().locals) || {});\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B1%5D!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B2%5D!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18%5B0%5D.rules%5B0%5D.use%5B3%5D!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
eval("\n\nvar isOldIE = function isOldIE() {\n  var memo;\n  return function memorize() {\n    if (typeof memo === 'undefined') {\n      // Test for IE <= 9 as proposed by Browserhacks\n      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805\n      // Tests for existence of standard globals is to allow style-loader\n      // to operate correctly into non-standard environments\n      // @see https://github.com/webpack-contrib/style-loader/issues/177\n      memo = Boolean(window && document && document.all && !window.atob);\n    }\n\n    return memo;\n  };\n}();\n\nvar getTarget = function getTarget() {\n  var memo = {};\n  return function memorize(target) {\n    if (typeof memo[target] === 'undefined') {\n      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself\n\n      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {\n        try {\n          // This will throw an exception if access to iframe is blocked\n          // due to cross-origin restrictions\n          styleTarget = styleTarget.contentDocument.head;\n        } catch (e) {\n          // istanbul ignore next\n          styleTarget = null;\n        }\n      }\n\n      memo[target] = styleTarget;\n    }\n\n    return memo[target];\n  };\n}();\n\nvar stylesInDom = [];\n\nfunction getIndexByIdentifier(identifier) {\n  var result = -1;\n\n  for (var i = 0; i < stylesInDom.length; i++) {\n    if (stylesInDom[i].identifier === identifier) {\n      result = i;\n      break;\n    }\n  }\n\n  return result;\n}\n\nfunction modulesToDom(list, options) {\n  var idCountMap = {};\n  var identifiers = [];\n\n  for (var i = 0; i < list.length; i++) {\n    var item = list[i];\n    var id = options.base ? item[0] + options.base : item[0];\n    var count = idCountMap[id] || 0;\n    var identifier = \"\".concat(id, \" \").concat(count);\n    idCountMap[id] = count + 1;\n    var index = getIndexByIdentifier(identifier);\n    var obj = {\n      css: item[1],\n      media: item[2],\n      sourceMap: item[3]\n    };\n\n    if (index !== -1) {\n      stylesInDom[index].references++;\n      stylesInDom[index].updater(obj);\n    } else {\n      stylesInDom.push({\n        identifier: identifier,\n        updater: addStyle(obj, options),\n        references: 1\n      });\n    }\n\n    identifiers.push(identifier);\n  }\n\n  return identifiers;\n}\n\nfunction insertStyleElement(options) {\n  var style = document.createElement('style');\n  var attributes = options.attributes || {};\n\n  if (typeof attributes.nonce === 'undefined') {\n    var nonce =  true ? __webpack_require__.nc : 0;\n\n    if (nonce) {\n      attributes.nonce = nonce;\n    }\n  }\n\n  Object.keys(attributes).forEach(function (key) {\n    style.setAttribute(key, attributes[key]);\n  });\n\n  if (typeof options.insert === 'function') {\n    options.insert(style);\n  } else {\n    var target = getTarget(options.insert || 'head');\n\n    if (!target) {\n      throw new Error(\"Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.\");\n    }\n\n    target.appendChild(style);\n  }\n\n  return style;\n}\n\nfunction removeStyleElement(style) {\n  // istanbul ignore if\n  if (style.parentNode === null) {\n    return false;\n  }\n\n  style.parentNode.removeChild(style);\n}\n/* istanbul ignore next  */\n\n\nvar replaceText = function replaceText() {\n  var textStore = [];\n  return function replace(index, replacement) {\n    textStore[index] = replacement;\n    return textStore.filter(Boolean).join('\\n');\n  };\n}();\n\nfunction applyToSingletonTag(style, index, remove, obj) {\n  var css = remove ? '' : obj.media ? \"@media \".concat(obj.media, \" {\").concat(obj.css, \"}\") : obj.css; // For old IE\n\n  /* istanbul ignore if  */\n\n  if (style.styleSheet) {\n    style.styleSheet.cssText = replaceText(index, css);\n  } else {\n    var cssNode = document.createTextNode(css);\n    var childNodes = style.childNodes;\n\n    if (childNodes[index]) {\n      style.removeChild(childNodes[index]);\n    }\n\n    if (childNodes.length) {\n      style.insertBefore(cssNode, childNodes[index]);\n    } else {\n      style.appendChild(cssNode);\n    }\n  }\n}\n\nfunction applyToTag(style, options, obj) {\n  var css = obj.css;\n  var media = obj.media;\n  var sourceMap = obj.sourceMap;\n\n  if (media) {\n    style.setAttribute('media', media);\n  } else {\n    style.removeAttribute('media');\n  }\n\n  if (sourceMap && typeof btoa !== 'undefined') {\n    css += \"\\n/*# sourceMappingURL=data:application/json;base64,\".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), \" */\");\n  } // For old IE\n\n  /* istanbul ignore if  */\n\n\n  if (style.styleSheet) {\n    style.styleSheet.cssText = css;\n  } else {\n    while (style.firstChild) {\n      style.removeChild(style.firstChild);\n    }\n\n    style.appendChild(document.createTextNode(css));\n  }\n}\n\nvar singleton = null;\nvar singletonCounter = 0;\n\nfunction addStyle(obj, options) {\n  var style;\n  var update;\n  var remove;\n\n  if (options.singleton) {\n    var styleIndex = singletonCounter++;\n    style = singleton || (singleton = insertStyleElement(options));\n    update = applyToSingletonTag.bind(null, style, styleIndex, false);\n    remove = applyToSingletonTag.bind(null, style, styleIndex, true);\n  } else {\n    style = insertStyleElement(options);\n    update = applyToTag.bind(null, style, options);\n\n    remove = function remove() {\n      removeStyleElement(style);\n    };\n  }\n\n  update(obj);\n  return function updateStyle(newObj) {\n    if (newObj) {\n      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {\n        return;\n      }\n\n      update(obj = newObj);\n    } else {\n      remove();\n    }\n  };\n}\n\nmodule.exports = function (list, options) {\n  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>\n  // tags it will allow on a page\n\n  if (!options.singleton && typeof options.singleton !== 'boolean') {\n    options.singleton = isOldIE();\n  }\n\n  list = list || [];\n  var lastIdentifiers = modulesToDom(list, options);\n  return function update(newList) {\n    newList = newList || [];\n\n    if (Object.prototype.toString.call(newList) !== '[object Array]') {\n      return;\n    }\n\n    for (var i = 0; i < lastIdentifiers.length; i++) {\n      var identifier = lastIdentifiers[i];\n      var index = getIndexByIdentifier(identifier);\n      stylesInDom[index].references--;\n    }\n\n    var newLastIdentifiers = modulesToDom(newList, options);\n\n    for (var _i = 0; _i < lastIdentifiers.length; _i++) {\n      var _identifier = lastIdentifiers[_i];\n\n      var _index = getIndexByIdentifier(_identifier);\n\n      if (stylesInDom[_index].references === 0) {\n        stylesInDom[_index].updater();\n\n        stylesInDom.splice(_index, 1);\n      }\n    }\n\n    lastIdentifiers = newLastIdentifiers;\n  };\n};\n\n//# sourceURL=webpack://@bevo/core/./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/hide-original.scss":
/*!************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/hide-original.scss ***!
  \************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval("\n        var result = __webpack_require__(/*! !!../../../../../node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!../../../../../node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!../../../../../node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./hide-original.scss */ \"./node_modules/css-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[1]!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-19[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-19[0].rules[0].use[3]!./registry/lib/components/style/home-redesign/hide-original.scss\");\n\n        if (result && result.__esModule) {\n            result = result.default;\n        }\n\n        if (typeof result === \"string\") {\n            module.exports = result;\n        } else {\n            module.exports = result.toString();\n        }\n    \n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/hide-original.scss?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/HomeRedesignBase.vue":
/*!**************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/HomeRedesignBase.vue ***!
  \**************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _HomeRedesignBase_vue_vue_type_template_id_00f6839a___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./HomeRedesignBase.vue?vue&type=template&id=00f6839a& */ \"./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=template&id=00f6839a&\");\n/* harmony import */ var _HomeRedesignBase_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./HomeRedesignBase.vue?vue&type=script&lang=ts& */ \"./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=script&lang=ts&\");\n/* harmony import */ var _HomeRedesignBase_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./HomeRedesignBase.vue?vue&type=style&index=0&lang=scss& */ \"./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=style&index=0&lang=scss&\");\n/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ \"./node_modules/vue-loader/lib/runtime/componentNormalizer.js\");\n\n\n\n;\n\n\n/* normalize component */\n\nvar component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(\n  _HomeRedesignBase_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__[\"default\"],\n  _HomeRedesignBase_vue_vue_type_template_id_00f6839a___WEBPACK_IMPORTED_MODULE_0__.render,\n  _HomeRedesignBase_vue_vue_type_template_id_00f6839a___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,\n  false,\n  null,\n  null,\n  null\n  \n)\n\ncomponent.options.__file = \"registry/lib/components/style/home-redesign/HomeRedesignBase.vue\"\n/* harmony default export */ __webpack_exports__[\"default\"] = (component.exports);\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue":
/*!*****************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue ***!
  \*****************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _MinimalHome_vue_vue_type_template_id_723571c9___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MinimalHome.vue?vue&type=template&id=723571c9& */ \"./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=template&id=723571c9&\");\n/* harmony import */ var _MinimalHome_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./MinimalHome.vue?vue&type=script&lang=ts& */ \"./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=script&lang=ts&\");\n/* harmony import */ var _MinimalHome_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./MinimalHome.vue?vue&type=style&index=0&lang=scss& */ \"./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=style&index=0&lang=scss&\");\n/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ \"./node_modules/vue-loader/lib/runtime/componentNormalizer.js\");\n\n\n\n;\n\n\n/* normalize component */\n\nvar component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(\n  _MinimalHome_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__[\"default\"],\n  _MinimalHome_vue_vue_type_template_id_723571c9___WEBPACK_IMPORTED_MODULE_0__.render,\n  _MinimalHome_vue_vue_type_template_id_723571c9___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,\n  false,\n  null,\n  null,\n  null\n  \n)\n\ncomponent.options.__file = \"registry/lib/components/style/home-redesign/minimal/MinimalHome.vue\"\n/* harmony default export */ __webpack_exports__[\"default\"] = (component.exports);\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue":
/*!***************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue ***!
  \***************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _MinimalHomeOperations_vue_vue_type_template_id_7599b695___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MinimalHomeOperations.vue?vue&type=template&id=7599b695& */ \"./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=template&id=7599b695&\");\n/* harmony import */ var _MinimalHomeOperations_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./MinimalHomeOperations.vue?vue&type=script&lang=ts& */ \"./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=script&lang=ts&\");\n/* harmony import */ var _MinimalHomeOperations_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./MinimalHomeOperations.vue?vue&type=style&index=0&lang=scss& */ \"./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=style&index=0&lang=scss&\");\n/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ \"./node_modules/vue-loader/lib/runtime/componentNormalizer.js\");\n\n\n\n;\n\n\n/* normalize component */\n\nvar component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(\n  _MinimalHomeOperations_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__[\"default\"],\n  _MinimalHomeOperations_vue_vue_type_template_id_7599b695___WEBPACK_IMPORTED_MODULE_0__.render,\n  _MinimalHomeOperations_vue_vue_type_template_id_7599b695___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,\n  false,\n  null,\n  null,\n  null\n  \n)\n\ncomponent.options.__file = \"registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue\"\n/* harmony default export */ __webpack_exports__[\"default\"] = (component.exports);\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue":
/*!***************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue ***!
  \***************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _MinimalHomeFeeds_vue_vue_type_template_id_1676db22___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MinimalHomeFeeds.vue?vue&type=template&id=1676db22& */ \"./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=template&id=1676db22&\");\n/* harmony import */ var _MinimalHomeFeeds_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./MinimalHomeFeeds.vue?vue&type=script&lang=ts& */ \"./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=script&lang=ts&\");\n/* harmony import */ var _MinimalHomeFeeds_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./MinimalHomeFeeds.vue?vue&type=style&index=0&lang=scss& */ \"./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=style&index=0&lang=scss&\");\n/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ \"./node_modules/vue-loader/lib/runtime/componentNormalizer.js\");\n\n\n\n;\n\n\n/* normalize component */\n\nvar component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(\n  _MinimalHomeFeeds_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__[\"default\"],\n  _MinimalHomeFeeds_vue_vue_type_template_id_1676db22___WEBPACK_IMPORTED_MODULE_0__.render,\n  _MinimalHomeFeeds_vue_vue_type_template_id_1676db22___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,\n  false,\n  null,\n  null,\n  null\n  \n)\n\ncomponent.options.__file = \"registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue\"\n/* harmony default export */ __webpack_exports__[\"default\"] = (component.exports);\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue":
/*!******************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue ***!
  \******************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _MinimalHomeTrending_vue_vue_type_template_id_8cb04b8a___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MinimalHomeTrending.vue?vue&type=template&id=8cb04b8a& */ \"./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?vue&type=template&id=8cb04b8a&\");\n/* harmony import */ var _MinimalHomeTrending_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./MinimalHomeTrending.vue?vue&type=script&lang=ts& */ \"./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?vue&type=script&lang=ts&\");\n/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ \"./node_modules/vue-loader/lib/runtime/componentNormalizer.js\");\n\n\n\n\n\n/* normalize component */\n;\nvar component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(\n  _MinimalHomeTrending_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_1__[\"default\"],\n  _MinimalHomeTrending_vue_vue_type_template_id_8cb04b8a___WEBPACK_IMPORTED_MODULE_0__.render,\n  _MinimalHomeTrending_vue_vue_type_template_id_8cb04b8a___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,\n  false,\n  null,\n  null,\n  null\n  \n)\n\ncomponent.options.__file = \"registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue\"\n/* harmony default export */ __webpack_exports__[\"default\"] = (component.exports);\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=script&lang=ts&":
/*!***************************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=script&lang=ts& ***!
  \***************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_babel_loader_lib_index_js_clonedRuleSet_20_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_HomeRedesignBase_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./HomeRedesignBase.vue?vue&type=script&lang=ts& */ \"./node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=script&lang=ts&\");\n /* harmony default export */ __webpack_exports__[\"default\"] = (_node_modules_babel_loader_lib_index_js_clonedRuleSet_20_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_HomeRedesignBase_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__[\"default\"]); \n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=script&lang=ts&":
/*!******************************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=script&lang=ts& ***!
  \******************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_babel_loader_lib_index_js_clonedRuleSet_20_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHome_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!../../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MinimalHome.vue?vue&type=script&lang=ts& */ \"./node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=script&lang=ts&\");\n /* harmony default export */ __webpack_exports__[\"default\"] = (_node_modules_babel_loader_lib_index_js_clonedRuleSet_20_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHome_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__[\"default\"]); \n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=script&lang=ts&":
/*!****************************************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=script&lang=ts& ***!
  \****************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_babel_loader_lib_index_js_clonedRuleSet_20_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeOperations_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!../../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MinimalHomeOperations.vue?vue&type=script&lang=ts& */ \"./node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=script&lang=ts&\");\n /* harmony default export */ __webpack_exports__[\"default\"] = (_node_modules_babel_loader_lib_index_js_clonedRuleSet_20_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeOperations_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__[\"default\"]); \n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=script&lang=ts&":
/*!****************************************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=script&lang=ts& ***!
  \****************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_babel_loader_lib_index_js_clonedRuleSet_20_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeFeeds_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!../../../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MinimalHomeFeeds.vue?vue&type=script&lang=ts& */ \"./node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=script&lang=ts&\");\n /* harmony default export */ __webpack_exports__[\"default\"] = (_node_modules_babel_loader_lib_index_js_clonedRuleSet_20_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeFeeds_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__[\"default\"]); \n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?vue&type=script&lang=ts&":
/*!*******************************************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?vue&type=script&lang=ts& ***!
  \*******************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_babel_loader_lib_index_js_clonedRuleSet_20_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeTrending_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!../../../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MinimalHomeTrending.vue?vue&type=script&lang=ts& */ \"./node_modules/babel-loader/lib/index.js??clonedRuleSet-20[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?vue&type=script&lang=ts&\");\n /* harmony default export */ __webpack_exports__[\"default\"] = (_node_modules_babel_loader_lib_index_js_clonedRuleSet_20_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeTrending_vue_vue_type_script_lang_ts___WEBPACK_IMPORTED_MODULE_0__[\"default\"]); \n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=style&index=0&lang=scss&":
/*!************************************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=style&index=0&lang=scss& ***!
  \************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_style_loader_dist_cjs_js_node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_HomeRedesignBase_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../node_modules/style-loader/dist/cjs.js!../../../../../node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!../../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../../node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!../../../../../node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./HomeRedesignBase.vue?vue&type=style&index=0&lang=scss& */ \"./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=style&index=0&lang=scss&\");\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=style&index=0&lang=scss&":
/*!***************************************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=style&index=0&lang=scss& ***!
  \***************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_style_loader_dist_cjs_js_node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHome_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../node_modules/style-loader/dist/cjs.js!../../../../../../node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!../../../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../../../node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!../../../../../../node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!../../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MinimalHome.vue?vue&type=style&index=0&lang=scss& */ \"./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=style&index=0&lang=scss&\");\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=style&index=0&lang=scss&":
/*!*************************************************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=style&index=0&lang=scss& ***!
  \*************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_style_loader_dist_cjs_js_node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeOperations_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../node_modules/style-loader/dist/cjs.js!../../../../../../node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!../../../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../../../node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!../../../../../../node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!../../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MinimalHomeOperations.vue?vue&type=style&index=0&lang=scss& */ \"./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=style&index=0&lang=scss&\");\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=style&index=0&lang=scss&":
/*!*************************************************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=style&index=0&lang=scss& ***!
  \*************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_style_loader_dist_cjs_js_node_modules_css_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_18_0_rules_0_use_2_node_modules_fast_sass_loader_lib_index_js_clonedRuleSet_18_0_rules_0_use_3_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeFeeds_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../node_modules/style-loader/dist/cjs.js!../../../../../../../node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!../../../../../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../../../../../node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!../../../../../../../node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!../../../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MinimalHomeFeeds.vue?vue&type=style&index=0&lang=scss& */ \"./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[1]!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-18[0].rules[0].use[2]!./node_modules/fast-sass-loader/lib/index.js??clonedRuleSet-18[0].rules[0].use[3]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=style&index=0&lang=scss&\");\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=template&id=00f6839a&":
/*!*********************************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=template&id=00f6839a& ***!
  \*********************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"render\": function() { return /* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_HomeRedesignBase_vue_vue_type_template_id_00f6839a___WEBPACK_IMPORTED_MODULE_0__.render; },\n/* harmony export */   \"staticRenderFns\": function() { return /* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_HomeRedesignBase_vue_vue_type_template_id_00f6839a___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns; }\n/* harmony export */ });\n/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_HomeRedesignBase_vue_vue_type_template_id_00f6839a___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./HomeRedesignBase.vue?vue&type=template&id=00f6839a& */ \"./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=template&id=00f6839a&\");\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=template&id=723571c9&":
/*!************************************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=template&id=723571c9& ***!
  \************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"render\": function() { return /* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHome_vue_vue_type_template_id_723571c9___WEBPACK_IMPORTED_MODULE_0__.render; },\n/* harmony export */   \"staticRenderFns\": function() { return /* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHome_vue_vue_type_template_id_723571c9___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns; }\n/* harmony export */ });\n/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHome_vue_vue_type_template_id_723571c9___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MinimalHome.vue?vue&type=template&id=723571c9& */ \"./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=template&id=723571c9&\");\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=template&id=7599b695&":
/*!**********************************************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=template&id=7599b695& ***!
  \**********************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"render\": function() { return /* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeOperations_vue_vue_type_template_id_7599b695___WEBPACK_IMPORTED_MODULE_0__.render; },\n/* harmony export */   \"staticRenderFns\": function() { return /* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeOperations_vue_vue_type_template_id_7599b695___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns; }\n/* harmony export */ });\n/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeOperations_vue_vue_type_template_id_7599b695___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MinimalHomeOperations.vue?vue&type=template&id=7599b695& */ \"./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=template&id=7599b695&\");\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=template&id=1676db22&":
/*!**********************************************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=template&id=1676db22& ***!
  \**********************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"render\": function() { return /* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeFeeds_vue_vue_type_template_id_1676db22___WEBPACK_IMPORTED_MODULE_0__.render; },\n/* harmony export */   \"staticRenderFns\": function() { return /* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeFeeds_vue_vue_type_template_id_1676db22___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns; }\n/* harmony export */ });\n/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeFeeds_vue_vue_type_template_id_1676db22___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MinimalHomeFeeds.vue?vue&type=template&id=1676db22& */ \"./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=template&id=1676db22&\");\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?vue&type=template&id=8cb04b8a&":
/*!*************************************************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?vue&type=template&id=8cb04b8a& ***!
  \*************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"render\": function() { return /* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeTrending_vue_vue_type_template_id_8cb04b8a___WEBPACK_IMPORTED_MODULE_0__.render; },\n/* harmony export */   \"staticRenderFns\": function() { return /* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeTrending_vue_vue_type_template_id_8cb04b8a___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns; }\n/* harmony export */ });\n/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_MinimalHomeTrending_vue_vue_type_template_id_8cb04b8a___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MinimalHomeTrending.vue?vue&type=template&id=8cb04b8a& */ \"./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?vue&type=template&id=8cb04b8a&\");\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?");

/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=template&id=00f6839a&":
/*!************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?vue&type=template&id=00f6839a& ***!
  \************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"render\": function() { return /* binding */ render; },\n/* harmony export */   \"staticRenderFns\": function() { return /* binding */ staticRenderFns; }\n/* harmony export */ });\nvar render = function () {\n  var _vm = this\n  var _h = _vm.$createElement\n  var _c = _vm._self._c || _h\n  return _c(\n    \"div\",\n    { staticClass: \"home-redesign-base\" },\n    [_vm._t(\"default\")],\n    2\n  )\n}\nvar staticRenderFns = []\nrender._withStripped = true\n\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/HomeRedesignBase.vue?./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=template&id=723571c9&":
/*!***************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?vue&type=template&id=723571c9& ***!
  \***************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"render\": function() { return /* binding */ render; },\n/* harmony export */   \"staticRenderFns\": function() { return /* binding */ staticRenderFns; }\n/* harmony export */ });\nvar render = function () {\n  var _vm = this\n  var _h = _vm.$createElement\n  var _c = _vm._self._c || _h\n  return _c(\"HomeRedesignBase\", [\n    _c(\n      \"div\",\n      { staticClass: \"minimal-home\" },\n      [\n        _c(\"TabControl\", {\n          staticClass: \"minimal-home-tabs\",\n          attrs: { tabs: _vm.tabs },\n        }),\n      ],\n      1\n    ),\n  ])\n}\nvar staticRenderFns = []\nrender._withStripped = true\n\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/MinimalHome.vue?./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=template&id=7599b695&":
/*!*************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?vue&type=template&id=7599b695& ***!
  \*************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"render\": function() { return /* binding */ render; },\n/* harmony export */   \"staticRenderFns\": function() { return /* binding */ staticRenderFns; }\n/* harmony export */ });\nvar render = function () {\n  var _vm = this\n  var _h = _vm.$createElement\n  var _c = _vm._self._c || _h\n  return _c(\n    \"div\",\n    { staticClass: \"minimal-home-operations\" },\n    [\n      _c(\n        \"VButton\",\n        {\n          staticClass: \"minimal-home-operations-refresh\",\n          attrs: { round: \"\", icon: \"\", title: \"刷新\" },\n          on: {\n            click: function ($event) {\n              _vm.backToTop()\n              _vm.$emit(\"refresh\")\n            },\n          },\n        },\n        [_c(\"VIcon\", { attrs: { icon: \"mdi-refresh\", size: _vm.size } })],\n        1\n      ),\n      _vm._v(\" \"),\n      _c(\n        \"VButton\",\n        {\n          staticClass: \"minimal-home-operations-top\",\n          attrs: { round: \"\", icon: \"\", title: \"返回顶部\" },\n          on: { click: _vm.backToTop },\n        },\n        [_c(\"VIcon\", { attrs: { icon: \"mdi-arrow-up\", size: _vm.size } })],\n        1\n      ),\n    ],\n    1\n  )\n}\nvar staticRenderFns = []\nrender._withStripped = true\n\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/MinimalHomeOperations.vue?./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=template&id=1676db22&":
/*!*************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?vue&type=template&id=1676db22& ***!
  \*************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"render\": function() { return /* binding */ render; },\n/* harmony export */   \"staticRenderFns\": function() { return /* binding */ staticRenderFns; }\n/* harmony export */ });\nvar render = function () {\n  var _vm = this\n  var _h = _vm.$createElement\n  var _c = _vm._self._c || _h\n  return _c(\n    \"div\",\n    {\n      staticClass: \"minimal-home-feeds\",\n      class: { loading: _vm.loading, loaded: _vm.loaded, error: _vm.error },\n    },\n    [\n      _c(\n        \"div\",\n        { staticClass: \"minimal-home-feeds-cards\" },\n        _vm._l(_vm.cards, function (c) {\n          return _c(\"VideoCard\", { key: c.id, attrs: { data: c } })\n        }),\n        1\n      ),\n      _vm._v(\" \"),\n      _vm.loaded && _vm.cards.length === 0 ? _c(\"VEmpty\") : _vm._e(),\n      _vm._v(\" \"),\n      _c(\"ScrollTrigger\", { on: { trigger: _vm.loadCards } }),\n      _vm._v(\" \"),\n      _c(\"MinimalHomeOperations\", { on: { refresh: _vm.refresh } }),\n    ],\n    1\n  )\n}\nvar staticRenderFns = []\nrender._withStripped = true\n\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeFeeds.vue?./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?vue&type=template&id=8cb04b8a&":
/*!****************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?vue&type=template&id=8cb04b8a& ***!
  \****************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"render\": function() { return /* binding */ render; },\n/* harmony export */   \"staticRenderFns\": function() { return /* binding */ staticRenderFns; }\n/* harmony export */ });\nvar render = function () {\n  var _vm = this\n  var _h = _vm.$createElement\n  var _c = _vm._self._c || _h\n  return _c(\"div\")\n}\nvar staticRenderFns = []\nrender._withStripped = true\n\n\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/tabs/MinimalHomeTrending.vue?./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options");

/***/ }),

/***/ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-loader/lib/runtime/componentNormalizer.js ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ normalizeComponent; }\n/* harmony export */ });\n/* globals __VUE_SSR_CONTEXT__ */\n\n// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).\n// This module is a runtime utility for cleaner component module output and will\n// be included in the final webpack user bundle.\n\nfunction normalizeComponent (\n  scriptExports,\n  render,\n  staticRenderFns,\n  functionalTemplate,\n  injectStyles,\n  scopeId,\n  moduleIdentifier, /* server only */\n  shadowMode /* vue-cli only */\n) {\n  // Vue.extend constructor export interop\n  var options = typeof scriptExports === 'function'\n    ? scriptExports.options\n    : scriptExports\n\n  // render functions\n  if (render) {\n    options.render = render\n    options.staticRenderFns = staticRenderFns\n    options._compiled = true\n  }\n\n  // functional template\n  if (functionalTemplate) {\n    options.functional = true\n  }\n\n  // scopedId\n  if (scopeId) {\n    options._scopeId = 'data-v-' + scopeId\n  }\n\n  var hook\n  if (moduleIdentifier) { // server build\n    hook = function (context) {\n      // 2.3 injection\n      context =\n        context || // cached call\n        (this.$vnode && this.$vnode.ssrContext) || // stateful\n        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional\n      // 2.2 with runInNewContext: true\n      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {\n        context = __VUE_SSR_CONTEXT__\n      }\n      // inject component styles\n      if (injectStyles) {\n        injectStyles.call(this, context)\n      }\n      // register component module identifier for async chunk inferrence\n      if (context && context._registeredComponents) {\n        context._registeredComponents.add(moduleIdentifier)\n      }\n    }\n    // used by ssr in case component is cached and beforeCreate\n    // never gets called\n    options._ssrRegister = hook\n  } else if (injectStyles) {\n    hook = shadowMode\n      ? function () {\n        injectStyles.call(\n          this,\n          (options.functional ? this.parent : this).$root.$options.shadowRoot\n        )\n      }\n      : injectStyles\n  }\n\n  if (hook) {\n    if (options.functional) {\n      // for template-only hot-reload because in that case the render fn doesn't\n      // go through the normalizer\n      options._injectStyles = hook\n      // register for functional component in vue file\n      var originalRender = options.render\n      options.render = function renderWithStyleInjection (h, context) {\n        hook.call(context)\n        return originalRender(h, context)\n      }\n    } else {\n      // inject component registration as beforeCreate hook\n      var existing = options.beforeCreate\n      options.beforeCreate = existing\n        ? [].concat(existing, hook)\n        : [hook]\n    }\n  }\n\n  return {\n    exports: scriptExports,\n    options: options\n  }\n}\n\n\n//# sourceURL=webpack://@bevo/core/./node_modules/vue-loader/lib/runtime/componentNormalizer.js?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal sync index\\.(.+)\\.md$":
/*!*************************************************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/ sync nonrecursive index\.(.+)\.md$ ***!
  \*************************************************************************************************/
/***/ (function(module) {

eval("function webpackEmptyContext(req) {\n\tvar e = new Error(\"Cannot find module '\" + req + \"'\");\n\te.code = 'MODULE_NOT_FOUND';\n\tthrow e;\n}\nwebpackEmptyContext.keys = function() { return []; };\nwebpackEmptyContext.resolve = webpackEmptyContext;\nwebpackEmptyContext.id = \"./registry/lib/components/style/home-redesign/minimal sync index\\\\.(.+)\\\\.md$\";\nmodule.exports = webpackEmptyContext;\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/_sync_nonrecursive_index\\.(.+)\\.md$?");

/***/ }),

/***/ "./registry/lib/components/style/home-redesign/minimal/index.md":
/*!**********************************************************************!*\
  !*** ./registry/lib/components/style/home-redesign/minimal/index.md ***!
  \**********************************************************************/
/***/ (function(module) {

"use strict";
eval("module.exports = \"使用重新设计的极简首页替换原本的首页.\\r\\n\\r\\n请注意, 此功能与 `清爽首页` 互斥, 请勿同时使用.\\r\\n\\r\\n- 个性化推荐: 启用时展示推荐视频, 禁用时展示热门视频\\r\\n- 自定义列数: 为 `0` 时根据视图宽度推断, 大于 `0` 的值将作为固定的列数\";\n\n//# sourceURL=webpack://@bevo/core/./registry/lib/components/style/home-redesign/minimal/index.md?");

/***/ }),

/***/ "@/components/define":
/*!******************************************************!*\
  !*** external ["coreApis","componentApis","define"] ***!
  \******************************************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.componentApis.define;

/***/ }),

/***/ "@/components/feeds/VideoCard.vue":
/*!*****************************************************************!*\
  !*** external ["coreApis","componentApis","feeds","VideoCard"] ***!
  \*****************************************************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.componentApis.feeds.VideoCard;

/***/ }),

/***/ "@/components/feeds/api":
/*!***********************************************************!*\
  !*** external ["coreApis","componentApis","feeds","api"] ***!
  \***********************************************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.componentApis.feeds.api;

/***/ }),

/***/ "@/core/life-cycle":
/*!*****************************************!*\
  !*** external ["coreApis","lifeCycle"] ***!
  \*****************************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.lifeCycle;

/***/ }),

/***/ "@/core/settings":
/*!****************************************!*\
  !*** external ["coreApis","settings"] ***!
  \****************************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.settings;

/***/ }),

/***/ "@/ui":
/*!**********************************!*\
  !*** external ["coreApis","ui"] ***!
  \**********************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.ui;

/***/ }),

/***/ "@/core/utils/log":
/*!*******************************************!*\
  !*** external ["coreApis","utils","log"] ***!
  \*******************************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.utils.log;

/***/ }),

/***/ "@/core/utils/sort":
/*!********************************************!*\
  !*** external ["coreApis","utils","sort"] ***!
  \********************************************/
/***/ (function(module) {

"use strict";
module.exports = coreApis.utils.sort;

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
/******/ 	var __webpack_exports__ = __webpack_require__("./registry/lib/components/style/home-redesign/minimal/index.ts");
/******/ 	__webpack_exports__ = __webpack_exports__.component;
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});