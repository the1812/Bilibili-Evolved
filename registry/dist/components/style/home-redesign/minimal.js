!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["style/home-redesign/minimal"]=t():e["style/home-redesign/minimal"]=t()}(globalThis,(()=>(()=>{var e,t,n={172:(e,t,n)=>{var o=n(218)((function(e){return e[1]}));o.push([e.id,"html {\n  scroll-behavior: smooth;\n  min-height: 100vh;\n}\nbody {\n  display: flex;\n  align-items: stretch;\n  flex-direction: column;\n  min-height: 100vh;\n}\n#i_cecream {\n  width: 100%;\n}\n.home-redesign-base {\n  --home-base-color: #fff;\n  --home-background-color: #fff;\n  --home-color: #000;\n  --home-max-width: var(--home-max-width-override, 1440px);\n  --home-content-height: 250px;\n  --home-card-radius: 12px;\n  --home-card-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);\n  --home-card-border: 1px solid #8882;\n  background-color: var(--home-base-color);\n  color: var(--home-color);\n  font-size: 12px;\n  flex-grow: 1;\n  line-height: normal;\n  display: flex;\n  align-items: center;\n  flex-direction: column;\n}\nbody.dark .home-redesign-base {\n  --home-base-color: #181818;\n  --home-background-color: #282828;\n  --home-color: #eee;\n  --home-card-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.2);\n}\nbody.home-redesign-off .home-redesign-base {\n  display: none;\n}",""]),e.exports=o},408:(e,t,n)=>{var o=n(218)((function(e){return e[1]}));o.push([e.id,".minimal-home {\n  --minimal-home-auto-card-column: 1;\n  --card-width: 600px;\n  --card-height: 122px;\n  --minimal-home-grid-gap: 12px;\n  --minimal-home-grid-padding: 8px;\n  --minimal-home-card-column: var(\n    --minimal-home-column-count-override,\n    var(--minimal-home-auto-card-column)\n  );\n  padding: 24px 32px 0 32px;\n  flex-grow: 1;\n  display: flex;\n  flex-direction: column;\n}\n@media screen and (min-width: 1440px) {\n.minimal-home {\n    --minimal-home-auto-card-column: 2;\n}\n}\n@media screen and (min-width: 2160px) {\n.minimal-home {\n    --minimal-home-auto-card-column: 3;\n}\n}\n.minimal-home-tabs {\n  flex-grow: 1;\n  min-width: calc(var(--card-width) * var(--minimal-home-card-column) + var(--minimal-home-grid-gap) * (var(--minimal-home-card-column) - 1) + 2 * var(--minimal-home-grid-padding));\n}\n.minimal-home-tabs .minimal-home-tab-cards {\n  display: grid;\n  grid-template-columns: repeat(var(--minimal-home-card-column), var(--card-width));\n  gap: var(--minimal-home-grid-gap);\n  padding: 0 var(--minimal-home-grid-padding);\n  margin-bottom: 16px;\n}\n.minimal-home-tabs .minimal-home-tab-cards .video-card * {\n  transition: 0.2s ease-out;\n}",""]),e.exports=o},833:(e,t,n)=>{var o=n(218)((function(e){return e[1]}));o.push([e.id,".minimal-home-operations {\n  display: flex;\n  align-items: center;\n  flex-direction: column;\n  gap: 12px;\n  position: fixed;\n  bottom: 48px;\n  right: 48px;\n}\n.minimal-home-operations .be-button {\n  padding: 8px !important;\n  opacity: 0.5;\n}\n.minimal-home-operations .be-button:hover {\n  opacity: 1;\n}\n.minimal-home-operations-refresh .mdi {\n  transition-duration: 0.5s;\n}\n.minimal-home-operations-refresh .mdi:hover {\n  transform: rotate(1turn);\n}\n.minimal-home-operations-top .mdi:hover {\n  animation: bounce-y--2 0.4s ease-out;\n}\n@keyframes bounce-y--2 {\n0%, 100% {\n    transform: translateY(0);\n}\n50% {\n    transform: translateY(-2px);\n}\n}",""]),e.exports=o},652:(e,t,n)=>{var o=n(218)((function(e){return e[1]}));o.push([e.id,".bili-header-m .head-banner .head-content .head-logo,\n.international-home > :not(.international-header),\n.international-header .b-wrap,\n.international-footer,\n.palette-button-wrap {\n  position: fixed;\n  visibility: hidden;\n  top: 200vh;\n  left: 0;\n  height: 0 !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  overflow: hidden !important;\n}\n\n#app > .bili-wrapper,\n#app > .elevator-module,\n#app > .bili-header-m.stardust-common > .bili-wrapper {\n  position: fixed;\n  visibility: hidden;\n  top: 200vh;\n  left: 0;\n  height: 0 !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  overflow: hidden !important;\n}\n\n#i_cecream > main,\n#i_cecream .palette-button-outer,\n#i_cecream .bili-header__channel,\n#i_cecream > .bili-feed4 > :not(.bili-header),\n#i_cecream .bili-footer {\n  position: fixed;\n  visibility: hidden;\n  top: 200vh;\n  left: 0;\n  height: 0 !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  overflow: hidden !important;\n}",""]),e.exports=o},218:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n=e(t);return t[2]?"@media ".concat(t[2]," {").concat(n,"}"):n})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,n,o){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var i={};if(o)for(var r=0;r<this.length;r++){
// eslint-disable-next-line prefer-destructuring
var a=this[r][0];null!=a&&(i[a]=!0)}for(var s=0;s<e.length;s++){var d=[].concat(e[s]);o&&i[d[0]]||(n&&(d[2]?d[2]="".concat(n," and ").concat(d[2]):d[2]=n),t.push(d))}},t}},112:(e,t,n)=>{"use strict";n.d(t,{t:()=>i});var o=n(986);const i=(0,o.getComponentSettings)("minimalHome").options},678:(e,t,n)=>{"use strict";n.d(t,{F:()=>o});let o=function(e){return e.Feeds="动态",e.Trending="热门 / 推荐",e}({})},298:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>w});var o=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("HomeRedesignBase",[t("div",{staticClass:"minimal-home"},[t("TabControl",{staticClass:"minimal-home-tabs",attrs:{"default-tab":e.defaultTab,tabs:e.tabs}})],1)])};o._withStripped=!0;var i=n(986),r=n(648),a=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"home-redesign-base"},[e._t("default")],2)};a._withStripped=!0;const s=(0,globalThis.Vue.defineComponent)({__name:"HomeRedesignBase",setup(e){const t=new URLSearchParams(location.search);if(t.has("bvid")){const e=new URLSearchParams([...t.entries()].filter((e=>{let[t]=e;return"bvid"!==t})));location.replace(`/video/${t.get("bvid")}${e.size>0?`?${e.toString()}`:""}`)}return{__sfc:!0,params:t}}});var d=n(332),l=n.n(d),c=n(172),m=n.n(c),u={insert:"head",singleton:!1};l()(m(),u);m().locals;var p=n(499);const h=(0,p.Z)(s,a,[],!1,null,null,null).exports;var f=n(112),g=n(678);const v=[{name:g.F.Feeds,displayName:"动态",component:()=>Promise.resolve().then(n.bind(n,53)).then((e=>e.default)),activeLink:"https://t.bilibili.com/?tab=video"},{name:g.F.Trending,displayName:f.t.personalized?"推荐":"热门",component:()=>Promise.resolve().then(n.bind(n,527)).then((e=>e.default)),activeLink:"https://www.bilibili.com/v/popular/all"}],b=Vue.extend({components:{HomeRedesignBase:h,TabControl:r.TabControl},data:()=>({tabs:v,defaultTab:f.t.defaultTab}),mounted(){const e="--minimal-home-column-count-override";(0,i.addComponentListener)("minimalHome.columnCount",(t=>{t>0?this.$el.style.setProperty(e,t.toString()):this.$el.style.removeProperty(e)}),!0)}});var y=n(408),x=n.n(y),_={insert:"head",singleton:!1};l()(x(),_);x().locals;const w=(0,p.Z)(b,o,[],!1,null,null,null).exports},879:(e,t,n)=>{"use strict";n.d(t,{Z:()=>m});var o=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"minimal-home-operations"},[t("VButton",{staticClass:"minimal-home-operations-refresh",attrs:{round:"",icon:"",title:"刷新"},on:{click:function(t){e.backToTop(),e.$emit("refresh")}}},[t("VIcon",{attrs:{icon:"mdi-refresh",size:e.size}})],1),e._v(" "),t("VButton",{staticClass:"minimal-home-operations-top",attrs:{round:"",icon:"",title:"返回顶部"},on:{click:e.backToTop}},[t("VIcon",{attrs:{icon:"mdi-arrow-up",size:e.size}})],1)],1)};o._withStripped=!0;var i=n(648);const r=Vue.extend({components:{VButton:i.VButton,VIcon:i.VIcon},data:()=>({size:28}),methods:{backToTop(){window.scrollTo(0,0)}}});var a=n(332),s=n.n(a),d=n(833),l=n.n(d),c={insert:"head",singleton:!1};s()(l(),c);l().locals;const m=(0,n(499).Z)(r,o,[],!1,null,null,null).exports},53:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>u});var o=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"minimal-home-tab",class:{loading:e.loading,loaded:e.loaded,error:e.error}},[t("div",{staticClass:"minimal-home-tab-cards"},e._l(e.cards,(function(e){return t("VideoCard",{key:e.id,attrs:{data:e}})})),1),e._v(" "),e.loading||0!==e.cards.length?e._e():t("VEmpty"),e._v(" "),e.error?e._e():t("ScrollTrigger",{ref:"scrollTrigger",attrs:{"detect-viewport":""},on:{trigger:e.loadCards}}),e._v(" "),e.cards.length>0?t("MinimalHomeOperations",{on:{refresh:e.refresh}}):e._e()],1)};o._withStripped=!0;var i=n(799),r=n(783),a=n.n(r),s=n(414),d=n(577),l=n(648),c=n(879);const m=Vue.extend({components:{ScrollTrigger:l.ScrollTrigger,VEmpty:l.VEmpty,VideoCard:a(),MinimalHomeOperations:c.Z},data:()=>({loading:!0,cards:[],error:!1}),computed:{loaded(){return!this.loading&&!this.error},lastID(){if(!this.cards.length)return null;return[...this.cards].sort((0,d.ascendingStringSort)((e=>e.id)))[0].id}},methods:{async loadCards(){try{this.error=!1,this.loading=!0,this.$refs.scrollTrigger.setLoadState("loading"),this.cards=lodash.uniqBy([...this.cards,...await(0,i.getVideoFeeds)("video",this.lastID)],(e=>e.id))}catch(e){(0,s.logError)(e),this.error=!0,this.$refs.scrollTrigger.setLoadState("error")}finally{this.loading=!1,this.loaded&&this.$refs.scrollTrigger.setLoadState("loaded")}},async refresh(){this.cards=[],this.$refs.scrollTrigger.resetIsFirstLoad()}}});const u=(0,n(499).Z)(m,o,[],!1,null,null,null).exports},527:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>g});var o=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"minimal-home-tab",class:{loading:e.loading,loaded:e.loaded,error:e.error}},[t("div",{staticClass:"minimal-home-tab-cards"},e._l(e.cards,(function(e){return t("VideoCard",{key:e.id,attrs:{data:e}})})),1),e._v(" "),e.loading||0!==e.cards.length?e._e():t("VEmpty"),e._v(" "),e.loading&&0===e.cards.length?t("VLoading"):e._e(),e._v(" "),e.cards.length>0?t("MinimalHomeOperations",{on:{refresh:e.loadCards}}):e._e()],1)};o._withStripped=!0;var i=n(783),r=n.n(i),a=n(414),s=n(577),d=n(648),l=n(799);const c=coreApis.ajax;var m=n(605);const u=coreApis.utils.formatters;var p=n(879),h=n(112);const f=Vue.extend({components:{VLoading:d.VLoading,VEmpty:d.VEmpty,VideoCard:r(),MinimalHomeOperations:p.Z},data:()=>({loading:!0,cards:[],error:!1}),computed:{loaded(){return!this.loading&&!this.error},lastID(){if(!this.cards.length)return null;return[...this.cards].sort((0,s.ascendingStringSort)((e=>e.id)))[0].id}},async mounted(){this.loadCards()},methods:{async loadCards(){try{this.cards=[],this.error=!1,this.loading=!0,this.cards=await(async e=>{const t=Boolean((0,m.getUID)())&&e,n=t?c.getJsonWithCredentials:c.getJson,{code:o,message:i,data:r}=await n("https://api.bilibili.com/x/web-interface/index/top/feed/rcmd");if(0!==o)throw new Error(`获取${t?"推荐":"热门"}视频失败: ${i}`);const a=r.item.map((e=>({id:e.id,aid:e.id,bvid:e.bvid,coverUrl:e.pic.replace("http:","https:"),title:e.title,description:"",dynamic:"",duration:e.duration,durationText:(0,u.formatDuration)(e.duration),timestamp:1e3*e.pubdate,time:new Date(1e3*e.pubdate),upName:e.owner.name,upID:e.owner.mid,upFaceUrl:e.owner.face.replace("http:","https:"),like:(0,u.formatCount)(e.stat.like),playCount:(0,u.formatCount)(e.stat.view),danmakuCount:(0,u.formatCount)(e.stat.danmaku)})));return(0,l.applyContentFilter)(a)})(h.t.personalized)}catch(e){(0,a.logError)(e),this.error=!0}finally{this.loading=!1}}}});const g=(0,n(499).Z)(f,o,[],!1,null,null,null).exports},499:(e,t,n)=>{"use strict";function o(e,t,n,o,i,r,a,s){var d,l="function"==typeof e?e.options:e;if(t&&(l.render=t,l.staticRenderFns=n,l._compiled=!0),o&&(l.functional=!0),r&&(l._scopeId="data-v-"+r),a?(d=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),i&&i.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(a)},l._ssrRegister=d):i&&(d=s?function(){i.call(this,(l.functional?this.parent:this).$root.$options.shadowRoot)}:i),d)if(l.functional){l._injectStyles=d;var c=l.render;l.render=function(e,t){return d.call(t),c(e,t)}}else{var m=l.beforeCreate;l.beforeCreate=m?[].concat(m,d):[d]}return{exports:e,options:l}}n.d(t,{Z:()=>o})},332:(e,t,n)=>{"use strict";var o,i=function(){return void 0===o&&(
// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
// @see https://github.com/webpack-contrib/style-loader/issues/177
o=Boolean(window&&document&&document.all&&!window.atob)),o},r=function(){var e={};return function(t){if(void 0===e[t]){var n=document.querySelector(t);if(window.HTMLIFrameElement&&n instanceof window.HTMLIFrameElement)try{n=n.contentDocument.head}catch(e){n=null}e[t]=n}return e[t]}}(),a=[];function s(e){for(var t=-1,n=0;n<a.length;n++)if(a[n].identifier===e){t=n;break}return t}function d(e,t){for(var n={},o=[],i=0;i<e.length;i++){var r=e[i],d=t.base?r[0]+t.base:r[0],l=n[d]||0,c="".concat(d," ").concat(l);n[d]=l+1;var m=s(c),u={css:r[1],media:r[2],sourceMap:r[3]};-1!==m?(a[m].references++,a[m].updater(u)):a.push({identifier:c,updater:g(u,t),references:1}),o.push(c)}return o}function l(e){var t=document.createElement("style"),o=e.attributes||{};if(void 0===o.nonce){var i=n.nc;i&&(o.nonce=i)}if(Object.keys(o).forEach((function(e){t.setAttribute(e,o[e])})),"function"==typeof e.insert)e.insert(t);else{var a=r(e.insert||"head");if(!a)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");a.appendChild(t)}return t}var c,m=(c=[],function(e,t){return c[e]=t,c.filter(Boolean).join("\n")});function u(e,t,n,o){var i=n?"":o.media?"@media ".concat(o.media," {").concat(o.css,"}"):o.css;if(e.styleSheet)e.styleSheet.cssText=m(t,i);else{var r=document.createTextNode(i),a=e.childNodes;a[t]&&e.removeChild(a[t]),a.length?e.insertBefore(r,a[t]):e.appendChild(r)}}function p(e,t,n){var o=n.css,i=n.media,r=n.sourceMap;if(i?e.setAttribute("media",i):e.removeAttribute("media"),r&&"undefined"!=typeof btoa&&(o+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(r))))," */")),e.styleSheet)e.styleSheet.cssText=o;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(o))}}var h=null,f=0;function g(e,t){var n,o,i;if(t.singleton){var r=f++;n=h||(h=l(t)),o=u.bind(null,n,r,!1),i=u.bind(null,n,r,!0)}else n=l(t),o=p.bind(null,n,t),i=function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(n)};return o(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;o(e=t)}else i()}}e.exports=function(e,t){(t=t||{}).singleton||"boolean"==typeof t.singleton||(t.singleton=i());var n=d(e=e||[],t);return function(e){if(e=e||[],"[object Array]"===Object.prototype.toString.call(e)){for(var o=0;o<n.length;o++){var i=s(n[o]);a[i].references--}for(var r=d(e,t),l=0;l<n.length;l++){var c=s(n[l]);0===a[c].references&&(a[c].updater(),a.splice(c,1))}n=r}}}},369:(e,t,n)=>{var o=n(652);o&&o.__esModule&&(o=o.default),e.exports="string"==typeof o?o:o.toString()},96:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=96,e.exports=t},431:e=>{"use strict";e.exports="使用重新设计的极简首页替换原本的首页.\n\n请注意:\n- 此功能与 `清爽首页` 互斥, 请勿同时使用.\n- 此功能会禁用首页的[悬浮视频](https://github.com/the1812/Bilibili-Evolved/discussions/4404), 变为直接跳转到视频页面.\n\n选项说明:\n- 个性化推荐: 启用时展示推荐视频, 禁用时展示热门视频\n- 自定义列数: 为 `0` 时根据视图宽度推断, 大于 `0` 的值将作为固定的列数"},783:e=>{"use strict";e.exports=coreApis.componentApis.feeds.VideoCard},799:e=>{"use strict";e.exports=coreApis.componentApis.feeds.api},986:e=>{"use strict";e.exports=coreApis.settings},648:e=>{"use strict";e.exports=coreApis.ui},414:e=>{"use strict";e.exports=coreApis.utils.log},577:e=>{"use strict";e.exports=coreApis.utils.sort},605:e=>{"use strict";e.exports=coreApis.utils}},o={};function i(e){var t=o[e];if(void 0!==t)return t.exports;var r=o[e]={id:e,exports:{}};return n[e](r,r.exports,i),r.exports}i.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return i.d(t,{a:t}),t},t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,i.t=function(n,o){if(1&o&&(n=this(n)),8&o)return n;if("object"==typeof n&&n){if(4&o&&n.__esModule)return n;if(16&o&&"function"==typeof n.then)return n}var r=Object.create(null);i.r(r);var a={};e=e||[null,t({}),t([]),t(t)];for(var s=2&o&&n;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>a[e]=()=>n[e]));return a.default=()=>n,i.d(r,a),r},i.d=(e,t)=>{for(var n in t)i.o(t,n)&&!i.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),i.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var r={};return(()=>{"use strict";i.d(r,{component:()=>d});const e=coreApis.componentApis.define,t=coreApis.lifeCycle;var n=i(986),o=i(605);var a=i(678);const s=(0,e.defineOptionsMetadata)({personalized:{displayName:"个性化推荐",defaultValue:!1},columnCount:{displayName:"自定义列数",defaultValue:0,validator:(0,o.getNumberValidator)(0,10)},defaultTab:{displayName:"默认标签页",defaultValue:a.F.Feeds,dropdownEnum:a.F}}),d=(0,e.defineComponentMetadata)({name:"minimalHome",displayName:"极简首页",urlInclude:[/^https:\/\/www\.bilibili\.com\/$/,/^https:\/\/www\.bilibili\.com\/index\.html$/],tags:[componentsTags.style],entry:()=>{(0,n.addComponentListener)("minimalHome.columnCount",(e=>{document.documentElement.style.setProperty("--home-column-count-override",e.toString())}),!0),(0,t.contentLoaded)((async()=>{const e=await Promise.resolve().then(i.bind(i,298)),t=(0,o.mountVueComponent)(e);document.body.appendChild(t.$el)}))},options:s,unload:()=>document.body.classList.add("home-redesign-off"),reload:()=>document.body.classList.remove("home-redesign-off"),instantStyles:[{name:"minimal-home-hide-original",style:()=>Promise.resolve().then(i.t.bind(i,369,23))}],commitHash:"47832830d0525f24b377b77ad4e28b9e306c6c3a",coreVersion:"2.8.7",description:(()=>{const e=i(96);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(i.t.bind(i,431,17)).then((e=>e.default))}})()})})(),r=r.component})()));