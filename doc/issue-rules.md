New Issue / Issues 须知

## 默认所有 Issues 发起者均已了解此处的内容
Issues 用于记录 Bug 等发生异常问题的情况, 如果您希望讨论新功能或是提问 / 答疑, 请到[讨论区](https://github.com/the1812/Bilibili-Evolved/discussions)进行.
> 请注意 Issues 和 Discussions (讨论区) 是两个独立板块, 搜索结果是相互独立的, Issues 搜索不到的内容可能能在 Discussions 里搜到.
>
> 讨论区于 2020-12-10 启用, 在此之前的新功能建议 / 提问 / 答疑的讨论仍然可以在 Issues 这边搜索到.
> 
> 讨论区使用指南见 https://github.com/the1812/Bilibili-Evolved/discussions/1297

发之前记得看下置顶 (Pinned) 的 issue (如果有的话), 当遇到一些我认为会影响绝大部分用户的情况时, 我就会把这个 issue 置顶.

----

Bug 反馈不仅仅是描述您遇到了什么样的 bug, 更重要的是总结一套步骤, 按照这个步骤来就能稳定遇到 bug. (对应模板中的`问题描述`) 其次是一些环境信息, 模板中也已经给出, 通常包括`脚本版本`, `浏览器版本`, `错误信息`等. 有时候我可能还会需要您导出脚本设置.

> 提示: 最好先在预览离线版(Preview Offline)中测试一下, 有些问题可能已经修复了但还未正式发布.

我们对此的处理方式如下:
1. 对于给出了所有必要信息的 bug 反馈, 我们会尽量尝试重现并修复这个 bug, 优先级高于功能请求.
2. 信息不全或者无法重现的, 我们会追问更多信息, 争取转变为上一条的情况.
3. **只描述了 bug 的现象, 未提供任何其他信息, 或者只写个标题 / 正文随便放几句话, 导致我们无法确定 bug 的问题所在的, 将不予理会, 下次更新时直接关闭.** (带有`bad-issue`标签)
> 除非您有十足的自信, 认为其他人一看标题就能马上明白整个 bug 的来龙去脉, 否则尽量不要只写标题.
4. 若与现有的重复, 可能我们会提示您重复, 也可能不予理会, 下次更新时直接关闭. (带有`duplicate`标签)

- 正面例子: [#221](https://github.com/the1812/Bilibili-Evolved/issues/221) [#604](https://github.com/the1812/Bilibili-Evolved/issues/604)
- 反面例子: [#562](https://github.com/the1812/Bilibili-Evolved/issues/562) [#564](https://github.com/the1812/Bilibili-Evolved/issues/564)

----

Bug 反馈不一定会做出回复, 特别是内容写得非常清晰时, 我就会直接加上相应的标签 (`bug` 或 `feature-request`), 表示我将会处理.

附部分标签含义解释:
- `bug`: 确认为Bug, 将会处理
- `maybe-bug`: 可能是Bug, 待测试验证
- `feature-request`: 确认为功能请求, 将会处理
- `question`: 提问/答疑
- `adaptation`: b站的变化导致脚本未跟进适配
- `bad-issue`: 不符合以上规范的issue
- `compatibility`: 兼容性问题
- `duplicate`: 重复
- `help-wanted`: 没啥解决思路
- `long-term`: 需要长期开发, 短时间内无法完成
- `stale`: 即将因无活动而关闭
- `wontfix`: 不予考虑
