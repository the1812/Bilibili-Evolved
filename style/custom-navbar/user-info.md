`https://api.bilibili.com/x/web-interface/nav`
```json
{
    "code": 0,
    "message": "0",
    "ttl": 1,
    "data": {
        "isLogin": true,
        "email_verified": 1,
        "face": "http://i2.hdslb.com/bfs/face/569398f8a5c48665e7fa1038c1fc26730dfc5d32.jpg",
        "level_info": {
            "current_level": 5, // 0 - 注册会员 >1 - 正式会员
            "current_min": 10800,
            "current_exp": 16029,
            "next_exp": 28800
        },
        "mid": 39717974,
        "mobile_verified": 1,
        "money": 10, // 硬币
        "moral": 70, // ?
        "officialVerify": { // 官方认证
            "type": -1,
            "desc": ""
        },
        "pendant": { // 头像挂件
            "pid": 132,
            "name": "拳皇",
            "image": "http://i2.hdslb.com/bfs/face/b4261f53a146346cc95ec687cdbb5b7102ba9481.png",
            "expire": 1586966400
        },
        "scores": 0,
        "uname": "Grant-Howard",
        "vipDueDate": 1586966400000, // 大会员有效期限
        "vipStatus": 1, // 1 - 大会员在有效期内  2 - 大会员已过期?
        "vipType": 2, // 1 - 大会员  2 - 年度大会员
        "vip_pay_type": 0, // ?
        "vip_theme_type": 0, // 小会员活动
        "wallet": {
            "mid": 39717974,
            "bcoin_balance": 5, // B币余额
            "coupon_balance": 5, // B币券余额
            "coupon_due_time": 0 // B币券过期时间?
        },
        "has_shop": false, // 开店?
        "shop_url": "",
        "allowance_count": 0 // ?
    }
}
```
```js
isVip: function() {
    return (1 == this.userInfo.vipType || 2 == this.userInfo.vipType) && 1 == this.userInfo.vipStatus
},
redName: function() {
    return 1 === this.userInfo.vip_theme_type ? "small-vip-green" + (2 == this.userInfo.vipType ? " year" : "") : 2 == this.userInfo.vipType && 2 != this.userInfo.vipStatus ? "big-vip-red" : ""
},
vipType: function() {
    return 1 === this.userInfo.vip_theme_type ? 1 === this.userInfo.vipType ? "小会员" : 2 === this.userInfo.vipType ? "年度小会员" : "" : 1 === this.userInfo.vipType ? "大会员" : 2 === this.userInfo.vipType ? "年度大会员" : ""
},
bcoin: function() {
    return this.userInfo.wallet && (this.userInfo.wallet.bcoin_balance || 0 == this.userInfo.wallet.bcoin_balance) ? this.userInfo.wallet.bcoin_balance : "-"
},
money: function() {
    return this.userInfo.money
},
mailLink: function() {
    return "https://passport.bilibili.com/account/security#/bindmail"
},
phoneLink: function() {
    return "https://passport.bilibili.com/account/security#/bindphone"
},
exp: function() {
    var t = this.userInfo.level_info;
    return t ? 6 === t.current_level ? "100%" : (t.current_exp / t.next_exp * 100 >> 0) + "%" : "0"
},
levelTxt: function() {
    return tt[this.userInfo.level_info.current_level]
},
bindTips: function() {
    return 0 === this.userInfo.email_verified && 0 === this.userInfo.mobile_verified ? '<a href="https://passport.bilibili.com/account/security#/bindphone" target="_blank">绑定手机可领取每日硬币</a>' : 1 === this.userInfo.email_verified && 0 === this.userInfo.mobile_verified ? '<a href="https://passport.bilibili.com/account/security#/bindphone" target="_blank">绑定手机可领取每日硬币</a>' : ""
}
```