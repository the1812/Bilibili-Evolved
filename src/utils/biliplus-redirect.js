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
      const setUrl = url => {
        if (document.URL !== url) {
          button.href = url
        } else {
          button.disabled = true
        }
      }

      if (location.host === 'space.bilibili.com') {
        const url = document.URL.replace('space.bilibili.com/', `${host}/space/`)
        setUrl(url)
      }
      else if (document.URL.includes('/bangumi/')) {
        Observer.videoChange(() => {
          const aid = unsafeWindow.aid || document.querySelector('.av-link,.info-sec-av').innerText.replace(/[aAvV]/g, '')
          const url = `https://${host}/video/av${aid}/`
          setUrl(url)
        })
      }
      else {
        Observer.videoChange(() => {
          const url = document.URL.replace(window.location.host, host)
          setUrl(url)
        })
      }
    },
  }
}