const host = `www.biliplus.com`
const supportedUrls = [
  'bilibili.com/video/',
  'bilibili.com/bangumi/play',
  'bilibili.com/bangumi/media',
  'space.bilibili.com',
  // 'manga.bilibili.com'
]
export default {
  widget: {
    condition: () => {
      return supportedUrls.some(url => document.URL.includes(url))
    },
    content: /*html*/`
      <a class="gui-settings-flat-button" id="biliplus-redirect">
        <i class="icon-biliplus"></i>
        <span>转到BiliPlus</span>
      </a>`,
    success: () => {
      const button = document.querySelector('#biliplus-redirect')

      let url
      if (location.host === 'space.bilibili.com') {
        url = document.URL.replace('space.bilibili.com/', `${host}/space/`)
      }
      else if (document.URL.includes('/bangumi/')) {
        const aid = unsafeWindow.aid || document.querySelector('.av-link,.info-sec-av').innerText.replace(/[aAvV]/g, '')
        url = `https://${host}/video/av${aid}/`
      }
      else {
        url = document.URL.replace(window.location.host, host)
      }

      if (document.URL !== url) {
        button.href = url
      } else {
        button.disabled = true
      }
    },
  }
}