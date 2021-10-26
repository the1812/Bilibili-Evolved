# Danmaku Converter Design Notes
## XML
```xml
<d p="10.60800,5,25,16724991,1544806627,0,6d16be9f,9261260365889536">biu</d>
```
### 属性含义
| 发送时间 | 类型 | 字体相对大小 | 颜色     | Unix时间戳 | 弹幕池 | 用户Hash | 行序号           |
| -------- | ---- | ------------ | -------- | ---------- | ------ | -------- | ---------------- |
| 10.60800 | 5    | 25           | 16724991 | 1544806627 | 0      | 6d16be9f | 9261260365889536 |
### 弹幕类型
| 1~3  | 4    | 5    | 6    | 7~8  |
| ---- | ---- | ---- | ---- | ---- |
| 普通 | 底端 | 顶端 | 逆向 | 高级 |
### 字体相对大小
25为标准大小, 即`字体缩放倍数 = 字体相对大小 / 25`.

## ASS
### 样式定义
```ass
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
...
Style: SomeStyle,Microsoft YaHei UI,18,&H66FFFFFF,&H66FFFFFF,&H66000000,&H66000000,0,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0
```
### 单条弹幕定义
```ass
[Events]
Format:   Layer, Start     , End       , Style    , Name, MarginL, MarginR, MarginV, Effect, Text
...
Dialogue: 0    , 0:00:10.60, 0:00:14.60, SomeStyle,     , 20     , 20     , 2      ,       , {\pos(280,75)\c&HFF33FF}biu
```

### 颜色
设置填充色: `\c&H<bb><gg><rr>&`

设置边框色: `\2c&H<bb><gg><rr>&`

透明度: `\alpha&H<aa>`

### 位置
滚动: `\move(<x1>,<y1>,<x2>,<y2>)`

固定: `\pos(<X>,<Y>)`
