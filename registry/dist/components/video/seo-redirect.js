!function(e,o){"object"==typeof exports&&"object"==typeof module?module.exports=o():"function"==typeof define&&define.amd?define([],o):"object"==typeof exports?exports["video/seo-redirect"]=o():e["video/seo-redirect"]=o()}(self,(function(){return function(){"use strict";var e={d:function(o,t){for(var n in t)e.o(t,n)&&!e.o(o,n)&&Object.defineProperty(o,n,{enumerable:!0,get:t[n]})},o:function(e,o){return Object.prototype.hasOwnProperty.call(e,o)}},o={};e.d(o,{component:function(){return t}});const t={name:"seoRedirect",displayName:"SEO 页面重定向",entry:()=>{window.location.assign(document.URL.replace("/s/","/"))},urlInclude:["//www.bilibili.com/s/video/"],tags:[componentsTags.video],description:{"zh-CN":"进入 SEO 视频页面时 (`https://www.bilibili.com/s/video/`) 自动跳转到原视频页面."},commitHash:"6b53bf777c1668967400cd28b7c815867b9cbb38"};return o=o.component}()}));