!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports["style/player-shadow"]=e():t["style/player-shadow"]=e()}(self,(function(){return function(){var t,e,n={932:function(t,e,n){var o=n(645)((function(t){return t[1]}));o.push([t.id,"#bilibili-player,\n#bilibili-player.mini-player::before {\n  box-shadow: 0px 2px 8px 0px var(--theme-color-30) !important;\n}\nbody.dark #bilibili-player,\nbody.dark #bilibili-player.mini-player::before {\n  box-shadow: 0px 2px 8px 0px var(--theme-color-20) !important;\n}",""]),t.exports=o},645:function(t){"use strict";
// eslint-disable-next-line func-names
t.exports=function(t){var e=[];return e.toString=function(){return this.map((function(e){var n=t(e);return e[2]?"@media ".concat(e[2]," {").concat(n,"}"):n})).join("")},
// eslint-disable-next-line func-names
e.i=function(t,n,o){"string"==typeof t&&(
// eslint-disable-next-line no-param-reassign
t=[[null,t,""]]);var r={};if(o)for(var i=0;i<this.length;i++){
// eslint-disable-next-line prefer-destructuring
var a=this[i][0];null!=a&&(r[a]=!0)}for(var c=0;c<t.length;c++){var u=[].concat(t[c]);o&&r[u[0]]||(n&&(u[2]?u[2]="".concat(n," and ").concat(u[2]):u[2]=n),e.push(u))}},e}},509:function(t,e,n){var o=n(932);o&&o.__esModule&&(o=o.default),t.exports="string"==typeof o?o:o.toString()}},o={};function r(t){var e=o[t];if(void 0!==e)return e.exports;var i=o[t]={id:t,exports:{}};return n[t](i,i.exports,r),i.exports}e=Object.getPrototypeOf?function(t){return Object.getPrototypeOf(t)}:function(t){return t.__proto__},r.t=function(n,o){if(1&o&&(n=this(n)),8&o)return n;if("object"==typeof n&&n){if(4&o&&n.__esModule)return n;if(16&o&&"function"==typeof n.then)return n}var i=Object.create(null);r.r(i);var a={};t=t||[null,e({}),e([]),e(e)];for(var c=2&o&&n;"object"==typeof c&&!~t.indexOf(c);c=e(c))Object.getOwnPropertyNames(c).forEach((function(t){a[t]=function(){return n[t]}}));return a.default=function(){return n},r.d(i,a),i},r.d=function(t,e){for(var n in e)r.o(e,n)&&!r.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:e[n]})},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})};var i={};return function(){"use strict";r.d(i,{component:function(){return e}});var t=coreApis.utils.urls;const e={name:"playerShadow",displayName:"播放器投影",entry:none,instantStyles:[{name:"playerShadow",style:()=>Promise.resolve().then(r.t.bind(r,509,23))}],tags:[componentsTags.style,componentsTags.video],description:{"zh-CN":"为播放器添加主题色投影."},urlInclude:t.allVideoUrls,commitHash:"6b53bf777c1668967400cd28b7c815867b9cbb38"}}(),i=i.component}()}));