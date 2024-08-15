!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/download/mpv-output-ex"]=t():e["video/download/mpv-output-ex"]=t()}(globalThis,(()=>(()=>{var e={199:(e,t,n)=>{var o=n(218)((function(e){return e[1]}));o.push([e.id,".mpv-ex.config {\n  align-self: stretch;\n  display: flex;\n  align-items: stretch;\n  flex-direction: column;\n  gap: 12px;\n}\n.mpv-ex.config > .config-item {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}",""]),e.exports=o},218:e=>{"use strict";
// eslint-disable-next-line func-names
e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n=e(t);return t[2]?"@media ".concat(t[2]," {").concat(n,"}"):n})).join("")},
// eslint-disable-next-line func-names
t.i=function(e,n,o){"string"==typeof e&&(
// eslint-disable-next-line no-param-reassign
e=[[null,e,""]]);var i={};if(o)for(var a=0;a<this.length;a++){
// eslint-disable-next-line prefer-destructuring
var r=this[a][0];null!=r&&(i[r]=!0)}for(var s=0;s<e.length;s++){var c=[].concat(e[s]);o&&i[c[0]]||(n&&(c[2]?c[2]="".concat(n," and ").concat(c[2]):c[2]=n),t.push(c))}},t}},332:(e,t,n)=>{"use strict";var o,i=function(){return void 0===o&&(
// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
// @see https://github.com/webpack-contrib/style-loader/issues/177
o=Boolean(window&&document&&document.all&&!window.atob)),o},a=function(){var e={};return function(t){if(void 0===e[t]){var n=document.querySelector(t);if(window.HTMLIFrameElement&&n instanceof window.HTMLIFrameElement)try{n=n.contentDocument.head}catch(e){n=null}e[t]=n}return e[t]}}(),r=[];function s(e){for(var t=-1,n=0;n<r.length;n++)if(r[n].identifier===e){t=n;break}return t}function c(e,t){for(var n={},o=[],i=0;i<e.length;i++){var a=e[i],c=t.base?a[0]+t.base:a[0],l=n[c]||0,d="".concat(c," ").concat(l);n[c]=l+1;var p=s(d),u={css:a[1],media:a[2],sourceMap:a[3]};-1!==p?(r[p].references++,r[p].updater(u)):r.push({identifier:d,updater:h(u,t),references:1}),o.push(d)}return o}function l(e){var t=document.createElement("style"),o=e.attributes||{};if(void 0===o.nonce){var i=n.nc;i&&(o.nonce=i)}if(Object.keys(o).forEach((function(e){t.setAttribute(e,o[e])})),"function"==typeof e.insert)e.insert(t);else{var r=a(e.insert||"head");if(!r)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");r.appendChild(t)}return t}var d,p=(d=[],function(e,t){return d[e]=t,d.filter(Boolean).join("\n")});function u(e,t,n,o){var i=n?"":o.media?"@media ".concat(o.media," {").concat(o.css,"}"):o.css;if(e.styleSheet)e.styleSheet.cssText=p(t,i);else{var a=document.createTextNode(i),r=e.childNodes;r[t]&&e.removeChild(r[t]),r.length?e.insertBefore(a,r[t]):e.appendChild(a)}}function f(e,t,n){var o=n.css,i=n.media,a=n.sourceMap;if(i?e.setAttribute("media",i):e.removeAttribute("media"),a&&"undefined"!=typeof btoa&&(o+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(a))))," */")),e.styleSheet)e.styleSheet.cssText=o;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(o))}}var v=null,m=0;function h(e,t){var n,o,i;if(t.singleton){var a=m++;n=v||(v=l(t)),o=u.bind(null,n,a,!1),i=u.bind(null,n,a,!0)}else n=l(t),o=f.bind(null,n,t),i=function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(n)};return o(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;o(e=t)}else i()}}e.exports=function(e,t){(t=t||{}).singleton||"boolean"==typeof t.singleton||(t.singleton=i());var n=c(e=e||[],t);return function(e){if(e=e||[],"[object Array]"===Object.prototype.toString.call(e)){for(var o=0;o<n.length;o++){var i=s(n[o]);r[i].references--}for(var a=c(e,t),l=0;l<n.length;l++){var d=s(n[l]);0===r[d].references&&(r[d].updater(),r.splice(d,1))}n=a}}}},185:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>v});var o=function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"mpv-ex config"},[t("div",{staticClass:"config-item"},[t("span",{staticClass:"item-name"},[e._v("api_dev_key:")]),e._v(" "),t("TextBox",{on:{blur:e.onChange},model:{value:e.api_dev_key,callback:function(t){e.api_dev_key=t},expression:"api_dev_key"}})],1),e._v(" "),t("div",{staticClass:"config-item"},[t("span",{staticClass:"item-name"},[e._v("api_user_key:")]),e._v(" "),t("TextBox",{on:{blur:e.onChange},model:{value:e.api_user_key,callback:function(t){e.api_user_key=t},expression:"api_user_key"}})],1)])};o._withStripped=!0;const i=coreApis.settings,a=coreApis.ui,{options:r}=(0,i.getComponentSettings)("downloadVideo"),s=Vue.extend({components:{TextBox:a.TextBox},data:()=>({...lodash.pick(r,["api_dev_key","api_user_key"])}),methods:{onChange(){Object.assign(r,lodash.pick(this,["api_dev_key","api_user_key"]))}}});var c=n(332),l=n.n(c),d=n(199),p=n.n(d),u={insert:"head",singleton:!1};l()(p(),u);p().locals;var f=function(e,t,n,o,i,a,r,s){var c,l="function"==typeof e?e.options:e;if(t&&(l.render=t,l.staticRenderFns=n,l._compiled=!0),o&&(l.functional=!0),a&&(l._scopeId="data-v-"+a),r?(c=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),i&&i.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(r)},l._ssrRegister=c):i&&(c=s?function(){i.call(this,(l.functional?this.parent:this).$root.$options.shadowRoot)}:i),c)if(l.functional){l._injectStyles=c;var d=l.render;l.render=function(e,t){return c.call(t),d(e,t)}}else{var p=l.beforeCreate;l.beforeCreate=p?[].concat(p,c):[c]}return{exports:e,options:l}}(s,o,[],!1,null,null,null);const v=f.exports}},t={};function n(o){var i=t[o];if(void 0!==i)return i.exports;var a=t[o]={id:o,exports:{}};return e[o](a,a.exports,n),a.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var o={};return(()=>{"use strict";n.d(o,{plugin:()=>a});const e=coreApis.ajax,t=coreApis.utils.log,i={name:"mpv-ex",displayName:"MPV 输出支持加强版",description:'多文件时格式选择 flv，使用前请先阅读 <a href="https://github.com/Asukaaaaaa/tricks/blob/main/Bilibili-Evolved%20mpv-ex%20%E6%8F%92%E4%BB%B6.md" target="blank">README</a>',runAction:async(n,o)=>{let i;const a='mpv://--http-header-fields="referer:https://www.bilibili.com/"';if(n.isSingleVideo){const e=n.infos[0].fragments;1===e.length?i=`${a} ${e[0].url}`:2===e.length&&(i=`${a} ${e[0].url} --audio-file=${e[1].url}`)}else{const r=n.infos.reduce(((e,t)=>`${e}#EXTINF:-1,${t.input.title}\n${t.fragments[0].url}\n`),"#EXTM3U\n");try{i=`${a} ${(await(async(t,n)=>{const o=new URLSearchParams;Object.entries({api_dev_key:n.api_dev_key,api_user_key:n.api_user_key,api_folder_key:"m3u",api_option:"paste",api_paste_code:t,api_paste_private:"1",api_paste_expire_date:"10M"}).forEach((e=>{let[t,n]=e;return o.append(t,n)}));const i=await(0,e.monkey)({url:"https://pastebin.com/api/api_post.php",method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},data:o.toString(),nocache:!0,responseType:"text",fetch:!0});if(/^Bad API request,/.test(i))throw i;return i})(r,o)).replace(/^(https:\/\/pastebin.com)\/(.*)/,"$1/raw/$2?.m3u")}`}catch(e){return void(0,t.logError)(e)}}console.log(i),window.open(i)},component:()=>Promise.resolve().then(n.bind(n,185)).then((e=>e.default))},a={name:"downloadVideo.outputs.mpv-ex",displayName:"下载视频 - MPV 输出支持加强版",author:{name:"asuaaa",link:"https://github.com/Asukaaaaaa"},description:"为下载视频增加 MPV 输出，支持导出列表, 配置方式请参考 [README](https://github.com/Asukaaaaaa/tricks/blob/main/Bilibili-Evolved%20mpv-ex%20%E6%8F%92%E4%BB%B6.md)",setup:e=>{let{addData:t}=e;t("downloadVideo.outputs",(e=>{e.push(i)}))},commitHash:"49dab167c6a752ded5d6aca0615efb98bcc98884",coreVersion:"2.9.1"}})(),o=o.plugin})()));