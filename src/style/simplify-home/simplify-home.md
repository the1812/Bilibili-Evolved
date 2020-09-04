# 简化首页注意事项
虽然使用新的首页组件替代了原来的, 但是原来的首页仍然会在后台加载各种数据(但实际上是隐藏的看不见), 这会导致看起来就是新的首页一直显示加载中, 直到原来的首页加载完成才开始加载, 浪费了很多时间.

所以, 脚本会尝试删除原版首页使用的各种js资源, 这样页面一进去就可以加载新版首页的数据, ~~这在Chrome中确实可行~~, Chrome 78 之后改了渲染方式也不行了, 在Firefox中没有效果, 即使从页面中删除了那些js资源, 只要它曾经存在过, 浏览器就会先去下载并执行它们. 为了得到良好的加载速度, 需要再配合一个可自定义的反广告插件, 比如说 Adblock Plus, 然后屏蔽主页的所有js资源:
```
*://s1.hdslb.com/*/sentry/*.js
*://s1.hdslb.com/*/log/*.js
*://s1.hdslb.com/*/international-home/*.js
*://s1.hdslb.com/*/cm-sdk/*.js
*://s1.hdslb.com/*/footer-v2/*.js
*://www.bilibili.com/gentleman/polyfill.js
```

Adblock Plus 用户也可以在设置-高级里添加过滤列表, URL填:
```
https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved@preview/src/style/simplify-home/simplify-home.abp.txt
```
(也许这个列表也兼容同类的其他反广告插件)
