!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["touch/mini-player"]=t():e["touch/mini-player"]=t()}(globalThis,(()=>(()=>{var e={304:(e,t,n)=>{"use strict";n.r(t),n.d(t,{touchLiveMiniPlayer:()=>i});var o=n(200);const i=async e=>{const t=await(0,o.select)(".live-player-ctnr");if(!t)return void console.warn("mini player touch move: player not found");const{enableTouchMove:i,disableTouchMove:r}=await Promise.resolve().then(n.bind(n,857));e?i(t,{minMoveDistance:10}):r(t)}},857:(e,t,n)=>{"use strict";n.r(t),n.d(t,{disableTouchMove:()=>s,enableTouchMove:()=>c});const o=coreApis.settings,i=(e,t)=>new MouseEvent(e,{screenX:t.screenX,screenY:t.screenY,clientX:t.clientX,clientY:t.clientY,bubbles:!0,cancelable:!0,view:unsafeWindow,detail:1}),r=[],a={passive:!1,capture:!0},c=(e,t)=>{if(r.some((t=>t.element===e)))return;let n,c,s;const l=lodash.get(t,"minMoveDistance",(0,o.getComponentSettings)("touchMiniPlayer").options.touchMoveDistance),u=e=>{if(e.touches.length<1)return;const t=e.touches[0];n={x:t.clientX,y:t.clientY},e.target.dispatchEvent(i("mousedown",t))};e.addEventListener("touchstart",u,a);const d=e=>{if(1!==e.touches.length)return;const t=e.touches[0],o={x:t.clientX,y:t.clientY};((e,t,n)=>Math.abs(e.x-t.x)**2+Math.abs(e.y-t.y)**2>=n*n)(n,o,l)?(e.target.dispatchEvent(i("mousemove",t)),s=!0,e.cancelable&&e.preventDefault()):s=!1,c=t};e.addEventListener("touchmove",d,a);const p=e=>{s&&(e.target.dispatchEvent(i("mouseup",c)),e.cancelable&&e.preventDefault(),s=!1)};e.addEventListener("touchend",p,a),e.addEventListener("touchcancel",p,a),r.push({element:e,touchstart:u,touchmove:d,touchend:p})},s=e=>{const t=r.findIndex((t=>t.element===e));if(-1===t)return;const n=r[t];["touchstart","touchmove","touchend"].forEach((t=>{e.removeEventListener(t,n[t],a)})),e.removeEventListener("touchcancel",n.touchend,a),r.splice(t,1)}},36:(e,t,n)=>{"use strict";n.r(t),n.d(t,{touchVideoMiniPlayer:()=>c});var o=n(200);const i=coreApis.style;var r=n(819),a=n.n(r);const c=async e=>{const t=await(0,o.select)("#bilibili-player");if(!t)return void console.warn("mini player touch move: player not found");const{enableTouchMove:r,disableTouchMove:c}=await Promise.resolve().then(n.bind(n,857)),s="touch-mini-player";e?((0,i.addStyle)(a(),s),r(t)):((0,i.removeStyle)(s),c(t))}},254:(e,t,n)=>{var o=n(218)((function(e){return e[1]}));o.push([e.id,"#bilibili-player.mini-player .drag-bar {\n  touch-action: none !important;\n  height: 40px !important;\n  line-height: 40px !important;\n  top: -40px !important;\n}\n#bilibili-player.mini-player .drag-bar i:last-child {\n  margin: 10px !important;\n}",""]),e.exports=o},218:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n=e(t);return t[2]?"@media ".concat(t[2]," {").concat(n,"}"):n})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,n,o){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var i={};if(o)for(var r=0;r<this.length;r++){
// eslint-disable-next-line prefer-destructuring
var a=this[r][0];null!=a&&(i[a]=!0)}for(var c=0;c<e.length;c++){var s=[].concat(e[c]);o&&i[s[0]]||(n&&(s[2]?s[2]="".concat(n," and ").concat(s[2]):s[2]=n),t.push(s))}},t}},819:(e,t,n)=>{var o=n(254);o&&o.__esModule&&(o=o.default),e.exports="string"==typeof o?o:o.toString()},200:e=>{"use strict";e.exports=coreApis.spinQuery}},t={};function n(o){var i=t[o];if(void 0!==i)return i.exports;var r=t[o]={id:o,exports:{}};return e[o](r,r.exports,n),r.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var o={};return(()=>{"use strict";n.d(o,{component:()=>r});const e=coreApis.componentApis.define,t=coreApis.utils.urls,i=async e=>{if(document.URL.startsWith("https://live.bilibili.com")){const{touchLiveMiniPlayer:t}=await Promise.resolve().then(n.bind(n,304));await t(e)}else{const{touchVideoMiniPlayer:t}=await Promise.resolve().then(n.bind(n,36));await t(e)}},r=(0,e.defineComponentMetadata)({name:"touchMiniPlayer",displayName:"迷你播放器触摸拖动",description:{"zh-CN":"使迷你播放器的拖动条可以触摸拖动."},enabledByDefault:navigator.maxTouchPoints>0,tags:[componentsTags.touch],urlInclude:[...t.videoAndBangumiUrls,...t.liveUrls],entry:()=>i(!0),reload:()=>i(!0),unload:()=>i(!1),options:{touchMoveDistance:{displayName:"拖动触发最小距离",defaultValue:10,hidden:!0}},commitHash:"6018100079aee98be9efd86c6eaf152fff96fef4",coreVersion:"2.8.13"})})(),o=o.component})()));