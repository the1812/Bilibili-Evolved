!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["live/chat-panel-fit"]=t():e["live/chat-panel-fit"]=t()}(globalThis,(()=>(()=>{var e,t,n={321:(e,t,n)=>{"use strict";n.d(t,{C:()=>i,u:()=>a});var r=n(253),o=n(847);const i=190,a=(0,r.defineOptionsMetadata)({customWidth:{hidden:!0,defaultValue:0},maxWidth:{defaultValue:1e3,displayName:"侧边栏最大宽度 (px)",validator:(0,o.getNumberValidator)(i)}})},39:(e,t,n)=>{var r=n(955)((function(e){return e[1]}));r.push([e.id,"html.custom-width-dragging .player-full-win:not(.hide-aside-area) .player-ctnr {\n  z-index: 1001 !important;\n}\nhtml.custom-width-dragging .player-full-win:not(.hide-aside-area) .player-ctnr .head-info-section {\n  display: none !important;\n}\n.aside-area-toggle-btn {\n  height: 90px;\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n}\n.chat-panel-fit-dragger {\n  pointer-events: none;\n  touch-action: none;\n  height: 100%;\n  width: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n  display: flex;\n  align-items: stretch;\n  flex-direction: column;\n}\n.player-full-win:not(.hide-aside-area) .chat-panel-fit-dragger {\n  pointer-events: initial;\n}\n.chat-panel-fit-dragger-bar {\n  opacity: 0;\n  cursor: ew-resize;\n  transition: opacity 0.2s ease-out;\n  flex-grow: 1;\n  width: 8px;\n  height: 100%;\n  background-color: var(--theme-color);\n  transform: translateX(-8px);\n  display: flex;\n  align-items: center;\n  flex-direction: column;\n}\nhtml.custom-width-dragging .chat-panel-fit-dragger-bar, .chat-panel-fit-dragger-bar:hover {\n  opacity: 1;\n}\n.chat-panel-fit-dragger-preview-area {\n  opacity: 0;\n  display: flex;\n  align-items: stretch;\n  flex-direction: column;\n  pointer-events: none;\n  position: absolute;\n  top: 0;\n  height: 100%;\n  font-size: 16px;\n  background-color: #fff;\n  color: #000;\n}\nbody.dark .chat-panel-fit-dragger-preview-area {\n  background-color: #222;\n  color: #eee;\n}\n.chat-panel-fit-dragger-preview-area-background {\n  flex-grow: 1;\n  background-color: var(--theme-color-10);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.chat-panel-fit-dragger.dragging .chat-panel-fit-dragger-preview-area {\n  opacity: 1;\n}",""]),e.exports=r},339:(e,t,n)=>{var r=n(955)((function(e){return e[1]}));r.push([e.id,".player-full-win:not(.hide-aside-area) .live-room-app .aside-area {\n  container-name: aside-area;\n  container-type: size;\n  width: var(--live-chat-panel-width, 302px) !important;\n}\n.player-full-win:not(.hide-aside-area) .live-room-app .player-section {\n  width: calc(100% - var(--live-chat-panel-width, 302px)) !important;\n}\n@container aside-area (max-width: 290px) {\n  .player-full-win:not(.hide-aside-area) .live-room-app .control-panel-icon-row-new .icon-left-part-new .super-chat,\n.player-full-win:not(.hide-aside-area) .live-room-app .control-panel-icon-row-new .icon-left-part-new .like-btn {\n    width: 32px;\n  }\n  .player-full-win:not(.hide-aside-area) .live-room-app .control-panel-icon-row-new .icon-left-part-new .super-chat-icon,\n.player-full-win:not(.hide-aside-area) .live-room-app .control-panel-icon-row-new .icon-left-part-new .like-btn-icon {\n    margin-right: 0 !important;\n  }\n  .player-full-win:not(.hide-aside-area) .live-room-app .control-panel-icon-row-new .icon-left-part-new .super-chat-text,\n.player-full-win:not(.hide-aside-area) .live-room-app .control-panel-icon-row-new .icon-left-part-new .like-btn-text {\n    display: none !important;\n  }\n  .player-full-win:not(.hide-aside-area) .live-room-app .chat-input-ctnr-new .medal-section {\n    display: none !important;\n  }\n  .player-full-win:not(.hide-aside-area) .live-room-app .chat-input-ctnr-new .chat-input-new:not(:has(textarea.focus)) {\n    padding-left: 12px !important;\n  }\n}",""]),e.exports=r},955:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n=e(t);return t[2]?"@media ".concat(t[2]," {").concat(n,"}"):n})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,n,r){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var o={};if(r)for(var i=0;i<this.length;i++){
// eslint-disable-next-line prefer-destructuring
var a=this[i][0];null!=a&&(o[a]=!0)}for(var s=0;s<e.length;s++){var l=[].concat(e[s]);r&&o[l[0]]||(n&&(l[2]?l[2]="".concat(n," and ").concat(l[2]):l[2]=n),t.push(l))}},t}},991:(e,t,n)=>{"use strict";var r,o=function(){return void 0===r&&(
// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
// @see https://github.com/webpack-contrib/style-loader/issues/177
r=Boolean(window&&document&&document.all&&!window.atob)),r},i=function(){var e={};return function(t){if(void 0===e[t]){var n=document.querySelector(t);if(window.HTMLIFrameElement&&n instanceof window.HTMLIFrameElement)try{n=n.contentDocument.head}catch(e){n=null}e[t]=n}return e[t]}}(),a=[];function s(e){for(var t=-1,n=0;n<a.length;n++)if(a[n].identifier===e){t=n;break}return t}function l(e,t){for(var n={},r=[],o=0;o<e.length;o++){var i=e[o],l=t.base?i[0]+t.base:i[0],c=n[l]||0,d="".concat(l," ").concat(c);n[l]=c+1;var p=s(d),u={css:i[1],media:i[2],sourceMap:i[3]};-1!==p?(a[p].references++,a[p].updater(u)):a.push({identifier:d,updater:v(u,t),references:1}),r.push(d)}return r}function c(e){var t=document.createElement("style"),r=e.attributes||{};if(void 0===r.nonce){var o=n.nc;o&&(r.nonce=o)}if(Object.keys(r).forEach((function(e){t.setAttribute(e,r[e])})),"function"==typeof e.insert)e.insert(t);else{var a=i(e.insert||"head");if(!a)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");a.appendChild(t)}return t}var d,p=(d=[],function(e,t){return d[e]=t,d.filter(Boolean).join("\n")});function u(e,t,n,r){var o=n?"":r.media?"@media ".concat(r.media," {").concat(r.css,"}"):r.css;if(e.styleSheet)e.styleSheet.cssText=p(t,o);else{var i=document.createTextNode(o),a=e.childNodes;a[t]&&e.removeChild(a[t]),a.length?e.insertBefore(i,a[t]):e.appendChild(i)}}function f(e,t,n){var r=n.css,o=n.media,i=n.sourceMap;if(o?e.setAttribute("media",o):e.removeAttribute("media"),i&&"undefined"!=typeof btoa&&(r+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(i))))," */")),e.styleSheet)e.styleSheet.cssText=r;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(r))}}var h=null,m=0;function v(e,t){var n,r,o;if(t.singleton){var i=m++;n=h||(h=c(t)),r=u.bind(null,n,i,!1),o=u.bind(null,n,i,!0)}else n=c(t),r=f.bind(null,n,t),o=function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(n)};return r(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;r(e=t)}else o()}}e.exports=function(e,t){(t=t||{}).singleton||"boolean"==typeof t.singleton||(t.singleton=o());var n=l(e=e||[],t);return function(e){if(e=e||[],"[object Array]"===Object.prototype.toString.call(e)){for(var r=0;r<n.length;r++){var o=s(n[r]);a[o].references--}for(var i=l(e,t),c=0;c<n.length;c++){var d=s(n[c]);0===a[d].references&&(a[d].updater(),a.splice(d,1))}n=i}}}},925:(e,t,n)=>{var r=n(339);r&&r.__esModule&&(r=r.default),e.exports="string"==typeof r?r:r.toString()},453:(e,t,n)=>{"use strict";n.d(t,{default:()=>m});var r=function(){var e=this,t=e._self._c,n=e._self._setupProxy;return t("div",{ref:"draggerElement",staticClass:"chat-panel-fit-dragger",class:{dragging:n.isDragging},style:{transform:`translateX(${-n.movement}px)`},on:{pointerdown:n.startDragging,pointermove:n.handlePointerMove,dblclick:n.resetCustomWidth}},[t("div",{staticClass:"chat-panel-fit-dragger-bar"}),e._v(" "),t("div",{staticClass:"chat-panel-fit-dragger-preview-area",style:{width:`${n.previewWidth}px`}},[t("div",{staticClass:"chat-panel-fit-dragger-preview-area-background"},[e._v("\n      "+e._s(n.previewWidth.toFixed(1))+"px\n    ")])])])};r._withStripped=!0;const o=globalThis.Vue;var i=n(905),a=n(321);const s=(0,o.defineComponent)({__name:"ChatPanelFitDragger",setup(e){const t=(0,o.reactive)((0,i.getComponentSettings)("liveChatPanelFit").options);(0,o.onBeforeMount)((()=>{0!==t.customWidth&&document.documentElement.style.setProperty("--live-chat-panel-width",`${t.customWidth}px`)}));const n=()=>parseFloat(document.documentElement.style.getPropertyValue("--live-chat-panel-width")),r=(0,o.ref)(),s=(0,o.ref)(0),l=(0,o.ref)(0),c=(0,o.computed)((()=>t.customWidth?t.customWidth+l.value:n())),d=(0,o.ref)(!1);return{__sfc:!0,options:t,getAutoWidth:n,draggerElement:r,startPoint:s,movement:l,previewWidth:c,isDragging:d,resetCustomWidth:()=>{t.customWidth=0,window.dispatchEvent(new CustomEvent("customWidthReset"))},handlePointerMove:e=>{if(!d.value)return;const n=s.value-e.screenX;l.value=lodash.clamp(t.customWidth+n,a.C,t.maxWidth)-t.customWidth},startDragging:e=>{d.value=!0,s.value=e.screenX,0===t.customWidth&&(t.customWidth=n()),r.value.setPointerCapture(e.pointerId),document.documentElement.style.cursor="ew-resize",document.documentElement.classList.add("custom-width-dragging"),document.documentElement.addEventListener("pointerup",(()=>{if(document.documentElement.style.cursor="",document.documentElement.classList.remove("custom-width-dragging"),d.value=!1,s.value=0,!l.value)return;const e=c.value;t.customWidth=e,l.value=0,document.documentElement.style.setProperty("--live-chat-panel-width",`${e}px`)}),{once:!0})}}}}),l=s;var c=n(991),d=n.n(c),p=n(39),u=n.n(p),f={insert:"head",singleton:!1};d()(u(),f);u().locals;var h=function(e,t,n,r,o,i,a,s){var l,c="function"==typeof e?e.options:e;if(t&&(c.render=t,c.staticRenderFns=n,c._compiled=!0),r&&(c.functional=!0),i&&(c._scopeId="data-v-"+i),a?(l=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),o&&o.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(a)},c._ssrRegister=l):o&&(l=s?function(){o.call(this,(c.functional?this.parent:this).$root.$options.shadowRoot)}:o),l)if(c.functional){c._injectStyles=l;var d=c.render;c.render=function(e,t){return l.call(t),d(e,t)}}else{var p=c.beforeCreate;c.beforeCreate=p?[].concat(p,l):[l]}return{exports:e,options:c}}(l,r,[],!1,null,null,null);const m=h.exports},910:e=>{function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=910,e.exports=t},833:e=>{"use strict";e.exports="在直播网页全屏时, 自动调整侧边栏的宽度, 使得视频区域的比例和视频源相匹配, 达到无黑边的效果.\n如果在侧边栏的边缘拖动, 可以自定义侧边栏的固定宽度, 双击边缘可以还原到自动宽度.\n\n- `侧边栏最大宽度 (px)`: 限制侧边栏可被拉伸到的最大宽度. (最小宽度固定为 190px, 再小的话布局就要出问题了)\n\n> 注意, 由于有最大宽度和最小宽度的限制, 部分窗口尺寸下仍然无法做到无黑边.\n"},253:e=>{"use strict";e.exports=coreApis.componentApis.define},905:e=>{"use strict";e.exports=coreApis.settings},847:e=>{"use strict";e.exports=coreApis.utils}},r={};function o(e){var t=r[e];if(void 0!==t)return t.exports;var i=r[e]={id:e,exports:{}};return n[e](i,i.exports,o),i.exports}o.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return o.d(t,{a:t}),t},t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,o.t=function(n,r){if(1&r&&(n=this(n)),8&r)return n;if("object"==typeof n&&n){if(4&r&&n.__esModule)return n;if(16&r&&"function"==typeof n.then)return n}var i=Object.create(null);o.r(i);var a={};e=e||[null,t({}),t([]),t(t)];for(var s=2&r&&n;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>a[e]=()=>n[e]));return a.default=()=>n,o.d(i,a),i},o.d=(e,t)=>{for(var n in t)o.o(t,n)&&!o.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),o.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.nc=void 0;var i={};return(()=>{"use strict";o.d(i,{component:()=>m});var e=o(253),t=o(905);const n=coreApis.spinQuery;var r=o(847);const a=coreApis.utils.log,s=coreApis.utils.urls;var l=o(321);const c="liveChatPanelFit",d=(0,a.useScopedConsole)(c),p=()=>{const{maxWidth:e,customWidth:n}=(0,t.getComponentSettings)(c).options;if(0!==n)return;const r=dq(".live-player-ctnr video");if(!r)return;const o=r.videoWidth,i=r.videoHeight;if(0===o||0===i)return;const{innerWidth:a,innerHeight:s}=window,p=a-o*s/i;d.log({liveChatPanelWidth:p}),document.documentElement.style.setProperty("--live-chat-panel-width",`${lodash.clamp(p,l.C,e)}px`)},u=lodash.debounce(p,200);let f;const h=async()=>{(0,t.addComponentListener)(`${c}.targetRatio`,p),(0,t.addComponentListener)(`${c}.maxWidth`,p),window.addEventListener("customWidthReset",p),window.addEventListener("resize",u);if(!await(0,n.sq)((()=>dq(".live-player-ctnr video")),(e=>null!==e&&e.readyState!==HTMLMediaElement.HAVE_NOTHING)))return void d.log("未找到 video 元素");p();const e=await(0,n.select)(".aside-area-toggle-btn");if(!e)return void d.log("未找到侧边栏按钮");const{default:i}=await Promise.resolve().then(o.bind(o,453));f=(0,r.mountVueComponent)(i),e.insertAdjacentElement("afterend",f.$el)},m=(0,e.defineComponentMetadata)({name:c,displayName:"直播间网页全屏自适应",tags:[componentsTags.live,componentsTags.style],urlInclude:[...s.liveUrls],entry:h,reload:h,unload:()=>{(0,t.removeComponentListener)(`${c}.targetRatio`,p),(0,t.removeComponentListener)(`${c}.maxWidth`,p),window.removeEventListener("customWidthReset",p),window.removeEventListener("resize",u),document.documentElement.style.removeProperty("--live-chat-panel-width"),f&&(f.$el.remove(),f.$destroy(),f=void 0)},instantStyles:[{name:c,style:()=>Promise.resolve().then(o.t.bind(o,925,23)),important:!0}],options:l.u,commitHash:"cc0f1cc2b4f41de30c71f526545bedb8f6371291",coreVersion:"2.10.0",description:(()=>{const e=o(910);return{...Object.fromEntries(e.keys().map((t=>[t.match(/index\.(.+)\.md$/)[1],e(t)]))),"zh-CN":()=>Promise.resolve().then(o.t.bind(o,833,17)).then((e=>e.default))}})()})})(),i=i.component})()));