!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["style/custom-navbar-pgc"]=t():e["style/custom-navbar-pgc"]=t()}(globalThis,(()=>(()=>{"use strict";var e={d:(t,a)=>{for(var i in a)e.o(a,i)&&!e.o(t,i)&&Object.defineProperty(t,i,{enumerable:!0,get:a[i]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)},t={};e.d(t,{plugin:()=>a});const a={name:"customNavbar.items.pgc",displayName:"自定义顶栏 - 版权内容",description:"为自定义顶栏扩充版权内容相关的快速入口, 包括国创 / 电影 / 电视剧 /综艺 / 纪录片",async setup(e){let{addData:t}=e;t("customNavbar.items",(e=>{e.push(...[{name:"guochuang",displayName:"国创",href:"https://www.bilibili.com/guochuang/"},{name:"movie",displayName:"电影",href:"https://www.bilibili.com/movie/"},{name:"tv",displayName:"电视剧",href:"https://www.bilibili.com/tv/"},{name:"variety",displayName:"综艺",href:"https://www.bilibili.com/variety/"},{name:"documentary",displayName:"纪录片",href:"https://www.bilibili.com/documentary/"}].map((e=>({...e,content:e.displayName,active:document.URL.startsWith(e.href)}))))}))},commitHash:"13a749cf10be42e37eb59b0da3cd30dbe9610a82",coreVersion:"2.9.6"};return t=t.plugin})()));