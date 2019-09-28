https://api.live.bilibili.com/av/v1/SuperChat/enable?room_id=21547895
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
        "uid": 5585179,
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
          "uname": "圣光的剑舞",
          "face": "https://i2.hdslb.com/bfs/face/4a4d9e010bd30bf177bfa27c84ed7df937e4fc5e.jpg",
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
        "uid": 2931168,
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
          "uname": "殘飯掃除機",
          "face": "https://i2.hdslb.com/bfs/face/fa0245d29babcfbafde4765ead381ec8aade5e3b.jpg",
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
        "uid": 3246970,
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
          "uname": "一只青叶两只青叶三只青叶",
          "face": "https://i2.hdslb.com/bfs/face/7d75b38502f42310d6112e1dfc1964e9a7ec74c5.jpg",
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

```js
{
  // 醒目留言ID
  "id": 2551,
  // 用户ID
  "uid": 5585179,
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
  // 说好的机翻日语文本呢?
  "message_jpn": "",
  "ts": 1569678366,
  "token": "B04FC859",
  "user_info": {
    "uname": "圣光的剑舞",
    "face": "https://i2.hdslb.com/bfs/face/4a4d9e010bd30bf177bfa27c84ed7df937e4fc5e.jpg",
    "face_frame": "",
    "guard_level": 0,
    "user_level": 5,
    "is_vip": 0,
    "is_svip": 0,
    "is_main_vip": 0
  }
}
```