!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/player/auto-light"]=t():e["video/player/auto-light"]=t()}(globalThis,(()=>(()=>{"use strict";var e,t,n={847:e=>{e.exports=coreApis.utils}},o={};function i(e){var t=o[e];if(void 0!==t)return t.exports;var r=o[e]={exports:{}};return n[e](r,r.exports,i),r.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,i.t=function(n,o){if(1&o&&(n=this(n)),8&o)return n;if("object"==typeof n&&n){if(4&o&&n.__esModule)return n;if(16&o&&"function"==typeof n.then)return n}var r=Object.create(null);i.r(r);var a={};e=e||[null,t({}),t([]),t(t)];for(var s=2&o&&n;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>a[e]=()=>n[e]));return a.default=()=>n,i.d(r,a),r},i.d=(e,t)=>{for(var n in t)i.o(t,n)&&!i.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),i.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var r={};i.d(r,{component:()=>m});const a=coreApis.componentApis.video.playerAgent,s=coreApis.componentApis.video.playerLight,d=coreApis.observer,l=coreApis.utils.urls,p=e=>{let t=document.getElementById("mstars1"),n=document.getElementById("mstars2");e?(null==t&&((()=>{const e=document.getElementById("biliMainHeader");if(null==e)return;const t=document.createElement("div");t.id="mstars1";const n=document.createElement("div");n.id="mstars2",e.appendChild(t),e.appendChild(n);const o=document.createElement("style");function i(e){let t="";const n=window.innerWidth*window.innerHeight;for(let o=0;o<n/e;o++)t+=`${Math.floor(Math.random()*window.innerWidth*1.5)}px ${Math.floor(Math.random()*(window.innerHeight+2e3))}px #FFF,`;return t+=`${Math.floor(Math.random()*window.innerWidth*1.5)}px ${Math.floor(Math.random()*(window.innerHeight+2e3))}px #FFF;`,t}const r=i(400),a=i(800),s=i(1600),d=i(3200);o.innerHTML=`\n  #mstars1{z-index: 1009;position: fixed;left:0px; width:1px;height:1px;background:transparent;box-shadow:${r};animation:animStar 50s linear infinite}\n  #mstars1:after{content:' ';position:fixed;left:0px;top:0px;width:1px;height:1px;background:transparent;box-shadow:${a}}\n  #mstars2{z-index: 1009;position: fixed;left:0px;width:2px;height:2px;background:transparent;box-shadow:${s};animation:animStar 100s linear infinite}\n  #mstars2:after{content:' ';position:fixed;left:0px;top:0px;width:2px;height:2px;background:transparent;box-shadow:${d}}\n  @keyframes animStar{from{transform:translateY(-200px)}to{transform:translateY(-2200px)}}\n  `,document.body.appendChild(o)})(),t=document.getElementById("mstars1"),n=document.getElementById("mstars2")),t.style.visibility="visible",n.style.visibility="visible"):null!=t&&(t.style.visibility="hidden",n.style.visibility="hidden")};let c;const m=(0,coreApis.componentApis.define.defineComponentMetadata)({name:"playerAutoLight",displayName:"播放时自动关灯",urlInclude:l.allVideoUrls,tags:[componentsTags.video],options:{starAnimation:{defaultValue:!0,displayName:"启用星光动画"}},description:{"zh-CN":"在视频播放时自动关灯, 暂停或结束时再自动打开."},entry:async e=>{let{settings:t}=e;const{isEmbeddedPlayer:n}=await Promise.resolve().then(i.t.bind(i,847,23));if(n())return;const o=()=>{(0,s.lightOn)(),p(!1)},r=()=>{(0,s.lightOff)(),t.options.starAnimation&&p(!0)};(0,d.videoChange)((async()=>{if(null!=c){const e=await c.query.video.element();e.removeEventListener("ended",o),e.removeEventListener("pause",o),e.removeEventListener("play",r)}c=a.playerAgent;const e=await c.query.video.element();c.isAutoPlay()&&r(),e.addEventListener("ended",o),e.addEventListener("pause",o),e.addEventListener("play",r)}))},commitHash:"7b6b5b65d16bb71b2f7f006cf966e072f8ae8936",coreVersion:"2.10.0"});return r=r.component})()));