可能会查询直播间是否能够使用SuperChat, 顺带返回当前挂在上面的留言
https://api.live.bilibili.com/av/v1/SuperChat/enable?room_id=21547895&jpn=1
```json
{
  "code": 0,
  "msg": "ok",
  "message": "ok",
  "data": {
    "status": 0,
    "jump_url": "https://live.bilibili.com/p/html/live-app-superchat/index.html?is_live_half_webview=1&hybrid_biz=superchat&hybrid_half_ui=1,3,100p,320,0,0,30,100;2,2,375,100p,2d2d2d,0,30,100;3,3,100p,320,2d2d2d,0,30,100;4,2,375,100p,2d2d2d,0,30,100;5,3,100p,420,2d2d2d,0,30,100;6,3,100p,420,0,0,30,100;7,3,100p,420,2d2d2d,0,30,100",
    "icon": "https://i0.hdslb.com/bfs/live/0a9ebd72c76e9cbede9547386dd453475d4af6fe.png",
    "message_list": [
      {
        "id": 2551,
        "uid": 0,
        "background_image": "https://i0.hdslb.com/bfs/live/1aee2d5e9e8f03eed462a7b4bbfd0a7128bbc8b1.png",
        "background_color": "#EDF5FF",
        "background_icon": "",
        "background_bottom_color": "#2A60B2",
        "background_price_color": "#7497CD",
        "font_color": "",
        "price": 30,
        "rate": 1000,
        "time": 56,
        "start_time": 1569678362,
        "end_time": 1569678422,
        "message": "花丸太可爱了",
        "message_jpn": "",
        "ts": 1569678366,
        "token": "B04FC859",
        "user_info": {
          "uname": "",
          "face": "",
          "face_frame": "",
          "guard_level": 0,
          "user_level": 5,
          "is_vip": 0,
          "is_svip": 0,
          "is_main_vip": 0
        }
      },
      {
        "id": 2550,
        "uid": 0,
        "background_image": "https://i0.hdslb.com/bfs/live/1aee2d5e9e8f03eed462a7b4bbfd0a7128bbc8b1.png",
        "background_color": "#EDF5FF",
        "background_icon": "",
        "background_bottom_color": "#2A60B2",
        "background_price_color": "#7497CD",
        "font_color": "",
        "price": 30,
        "rate": 1000,
        "time": 21,
        "start_time": 1569678327,
        "end_time": 1569678387,
        "message": "こんばんは",
        "message_jpn": "",
        "ts": 1569678366,
        "token": "CA2C647F",
        "user_info": {
          "uname": "",
          "face": "",
          "face_frame": "",
          "guard_level": 0,
          "user_level": 20,
          "is_vip": 0,
          "is_svip": 0,
          "is_main_vip": 1
        }
      },
      {
        "id": 2548,
        "uid": 0,
        "background_image": "https://i0.hdslb.com/bfs/live/1aee2d5e9e8f03eed462a7b4bbfd0a7128bbc8b1.png",
        "background_color": "#F2FFFE",
        "background_icon": "",
        "background_bottom_color": "#427D9E",
        "background_price_color": "#7DA4BD",
        "font_color": "",
        "price": 50,
        "rate": 1000,
        "time": 13,
        "start_time": 1569678259,
        "end_time": 1569678379,
        "message": "花丸ハ花丸ハ花丸ハ花丸/花丸/",
        "message_jpn": "",
        "ts": 1569678366,
        "token": "5A52512F",
        "user_info": {
          "uname": "",
          "face": "",
          "face_frame": "",
          "guard_level": 0,
          "user_level": 17,
          "is_vip": 0,
          "is_svip": 0,
          "is_main_vip": 1
        }
      }
    ]
  }
}
```

仅查询留言列表
https://api.live.bilibili.com/av/v1/SuperChat/getMessageList?room_id=21547895&jpn=1
```json
{
  "code": 0,
  "msg": "success",
  "message": "success",
  "data": {
    "list": [
      {
        "id": 2566,
        "uid": 0,
        "background_image": "https://i0.hdslb.com/bfs/live/1aee2d5e9e8f03eed462a7b4bbfd0a7128bbc8b1.png",
        "background_color": "#FFF4FB",
        "background_icon": "",
        "background_bottom_color": "#86105D",
        "background_price_color": "#AD5990",
        "font_color": "",
        "price": 100,
        "rate": 1000,
        "time": 232,
        "start_time": 1569679412,
        "end_time": 1569679712,
        "message": "花丸世界一かわいい！！！！！",
        "message_jpn": "",
        "ts": 1569679480,
        "token": "3F73C13",
        "user_info": {
          "uname": "",
          "face": "",
          "face_frame": "",
          "guard_level": 0,
          "user_level": 9,
          "is_vip": 0,
          "is_svip": 0,
          "is_main_vip": 0
        }
      }
    ]
  }
}
```

这个不知道干什么用的
https://api.live.bilibili.com/av/v1/SuperChat/ownMessageList?room_id=21547895

留言内容结构
```js
{
  // 醒目留言ID
  "id": 2551,
  // 用户ID
  "uid": 0,
  // 样式也写在api中可还行
  "background_image": "https://i0.hdslb.com/bfs/live/1aee2d5e9e8f03eed462a7b4bbfd0a7128bbc8b1.png",
  "background_color": "#EDF5FF",
  "background_icon": "",
  "background_bottom_color": "#2A60B2",
  "background_price_color": "#7497CD",
  "font_color": "",
  // 钞能力等级(
  "price": 30,
  // 这个不知道是什么 可能是RMB与金瓜子的倍率?
  "rate": 1000,
  // 剩余时间
  "time": 56,
  // 开始时间
  "start_time": 1569678362,
  // 结束时间
  "end_time": 1569678422,
  "message": "花丸太可爱了",
  // (机翻)日语文本
  "message_jpn": "",
  "ts": 1569678366,
  "token": "B04FC859",
  "user_info": {
    "uname": "",
    "face": "",
    "face_frame": "",
    "guard_level": 0,
    "user_level": 5,
    "is_vip": 0,
    "is_svip": 0,
    "is_main_vip": 0
  }
}
```
HTML结构
```html
<div data-v-d9f0951e="" class="detail-info">
  <div data-v-d9f0951e="" class="mask"></div>
  <div data-v-d08fa08e="" data-v-d9f0951e="" class="card-detail">
    <div data-v-d08fa08e="" class="card-item-middle-top"
      style="border: 1px solid rgb(187, 11, 48); background-image: url(&quot;https://i0.hdslb.com/bfs/live/1aee2d5e9e8f03eed462a7b4bbfd0a7128bbc8b1.png&quot;); background-color: rgb(255, 236, 234);">
      <div data-v-d08fa08e="" class="card-item-middle-top-left">
        <div data-v-d08fa08e="" class="icon-face"
          style="background-image: url(&quot;https://i2.hdslb.com/bfs/face/9b6310bae3e76914376e2abc8d9e71cce8c85a44.jpg&quot;);">
        </div>
        <!---->
      </div>
      <div data-v-d08fa08e="" class="card-item-middle-top-right">
        <div data-v-d08fa08e="" class="name isVip">uname</div>
        <div data-v-d08fa08e="" class="content-bottom">
          <div data-v-d08fa08e="" class="price">￥1000<span data-v-d08fa08e="" class="exp">（100万金瓜子）</span></div>
          <!---->
        </div>
      </div>
    </div>
    <div data-v-d08fa08e="" class="card-item-middle-bottom" style="background-color: rgb(187, 11, 48);">
      <div data-v-d08fa08e="" class="input-contain"><span data-v-d08fa08e=""
          class="text">encore！！encore！！encore！！</span></div>
      <div data-v-d08fa08e="" class="bottom-background"
        style="background-image: url(&quot;https://i0.hdslb.com/bfs/live/0cf7b5fdc7084c9ae05f7a371ea2438118529d66.png&quot;);">
      </div>
    </div>
    <div data-v-d08fa08e="" class="more"></div>
    <!---->
  </div>
</div>

<div class="chat-item danmaku-item superChat-card-detail" data-uname="" data-uid="" data-ts="1569679816"
  data-ct="FF618B15" data-danmaku="いつも可愛くて優しい花丸ちゃんのこと好きになってよかった。">
  <div class="card-item-top-right" style="background-color: #AD5990">￥150(15万金瓜子)</div>
  <div class="card-item-middle-top"
    style="background-image: url(https://i0.hdslb.com/bfs/live/1aee2d5e9e8f03eed462a7b4bbfd0a7128bbc8b1.png); border: 1px solid #86105D; background-color: #FFF4FB">
    <div class="card-item-middle-top-left">
      <div class="icon-face pointer open-menu"
        style="background-image: url(http://i2.hdslb.com/bfs/face/52bf7ba0c2840c939650a7ebae31666304473911.jpg)"></div>
      <div class="icon-face-frame pointer open-menu"
        style="background-image: url(http://i0.hdslb.com/bfs/live/78e8a800e97403f1137c0c1b5029648c390be390.png)"></div>
    </div>
    <div class="card-item-middle-top-right pointer">
      <div class="name  pointer open-menu isVip">uname</div>
      <div class="superChat-base guard-danmaku"><a
          href="//link.bilibili.com/p/center/index#/user-center/my-info/operation?vip=true" target="_blank"><i
            class="vip-icon svg-icon vip-year-color" title="不来当一发老爷么？>ㅂ<ﾉ ☆"></i></a>
        <div class="fans-medal-item-ctnr dp-i-block p-relative v-middle" title="这是 TA 的粉丝勋章 >ㅂ<ﾉ ☆">
          <div class="fans-medal-item level-8 false">
            <span class="label">花丸家</span><span class="level">8</span>
            <div class="hover-panel a-scale-in-ease">
              <a class="out-link" href="/21547895" target="_blank">
                <span class="content">勋章主播：花丸晴琉Official</span>
              </a>
            </div>

          </div>
        </div>
        <div class="user-level-icon lv-24 dp-i-block p-relative v-middle" title="这是 TA 的用户等级 <(▰˘◡˘▰)>">UL 24</div>
        <div class="title-label dp-i-block p-relative v-middle">
          <div class="hover-panel a-scale-in-ease"><span style="color: #000">活动头衔</span><br><a class="out-link"
              title="点击查看所有直播头衔 (=・ω・=)" href="//link.bilibili.com/p/center/index#/user-center/wearing-center/library"
              target="_blank">查看详情</a></div>
        </div>
      </div>
    </div>
  </div>
  <div class="card-item-middle-bottom" style="background-color: #86105D">
    <div class="input-contain">
      <span class="text">いつも可愛くて優しい花丸ちゃんのこと好きになってよかった。</span>
    </div>
    <div class="bottom-background" style="background-image: url()"></div>
  </div>
</div>
```