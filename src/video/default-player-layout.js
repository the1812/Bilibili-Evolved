class LayoutCookie {
  setCookie (key, value) {
    document.cookie = `${key}=${value};path=/;domain=.bilibili.com;max-age=31536000`
  }
  clearCookie (key) {
    document.cookie = `${key}=;path=/;domain=.bilibili.com;max-age=0`
  }
  getValue (key) {
    return document.cookie.replace(new RegExp(`(?:(?:^|.*;\\s*)${key}\\s*\\=\\s*([^;]*).*$)|^.*$`), '$1')
  }
  checkSettings () {
    return settings.useDefaultPlayerLayout
  }
  checkCookies () {}
  useNewLayout () {}
  useOldLayout () {}
  setLayout (newLayout) {
    if (newLayout) {
      this.useNewLayout()
    } else {
      this.useOldLayout()
    }
  }
}
class VideoLayoutCookie extends LayoutCookie {
  checkCookies () {
    super.checkCookies()
    const value = this.getValue(this.cookieKey)
    if (value === '' || parseInt(value) < 0 && settings.defaultPlayerLayout !== '旧版') {
      this.useNewLayout()
    } else if (settings.defaultPlayerLayout !== '新版') {
      this.useOldLayout()
    }
  }
  constructor () {
    super()
    this.cookieKey = 'stardustvideo'
    this.checkCookies()
  }
  useNewLayout () {
    super.useNewLayout()
    this.setCookie(this.cookieKey, 1)
  }
  useOldLayout () {
    super.useOldLayout()
    this.setCookie(this.cookieKey, -1)
  }
}
class BangumiLayoutCookie extends LayoutCookie {
  checkCookies () {
    super.checkCookies()
    const value = this.getValue(this.cookieKey)
    if (value === '' || parseInt(value) <= 0 && settings.defaultBangumiLayout !== '旧版') {
      this.useNewLayout()
    } else if (settings.defaultBangumiLayout !== '新版') {
      this.useOldLayout()
    }
  }
  constructor () {
    super()
    this.cookieKey = 'stardustpgcv'
    this.checkCookies()
  }
  useNewLayout () {
    super.useNewLayout()
    this.setCookie(this.cookieKey, '0606')
  }
  useOldLayout () {
    super.useOldLayout()
    this.setCookie(this.cookieKey, 0)
  }
}

const videoCookie = new VideoLayoutCookie()
addSettingsListener('defaultPlayerLayout', value => {
  videoCookie.setLayout(value === '新版')
})
const bangumiCookie = new BangumiLayoutCookie()
addSettingsListener('defaultBangumiLayout', value => {
  bangumiCookie.setLayout(value === '新版')
})
