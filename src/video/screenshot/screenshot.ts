import { getFriendlyTitle } from '../title'
const canvas = document.createElement('canvas')
class Screenshot {
  video: HTMLVideoElement
  url = ""
  videoTime: number
  blob: Blob
  timeStamp = new Date().getTime()
  withDanmaku = false
  constructor(video: HTMLVideoElement, videoTime: number, withDanmaku = false) {
    this.video = video
    this.videoTime = videoTime
    // this.url = URL.createObjectURL(this.blob)
    this.withDanmaku = withDanmaku
    this.createUrl()
  }
  async createUrl() {
    canvas.width = this.video.videoWidth
    canvas.height = this.video.videoHeight
    const context = canvas.getContext("2d")
    if (context === null) {
      logError('视频截图失败: canvas 未创建或创建失败.')
      return
    }
    context.drawImage(this.video, 0, 0)
    if (this.withDanmaku) {
      const danmakuCanvas = dq('canvas.bilibili-player-video-danmaku') as HTMLCanvasElement
      if (danmakuCanvas !== null) {
        context.drawImage(danmakuCanvas, 0, 0, this.video.videoWidth, this.video.videoHeight)
      }
    }
    try {
      canvas.toBlob(blob => {
        if (blob === null) {
          logError('视频截图失败: 创建 blob 失败.')
          return
        }
        this.blob = blob
        this.url = URL.createObjectURL(blob)
      }, 'image/png')
    } catch (error) {
      logError('视频截图失败: 操作被浏览器阻止. 这通常发生于电影的试看片段, 请在正片尝试使用截图功能.')
    }
  }
  get filename() {
    return `${getFriendlyTitle()} @${this.time.replace(/:/g, "-")} ${this.timeStamp.toString()}.png`
  }
  get id() {
    return this.videoTime.toString() + this.timeStamp.toString()
  }
  get time() {
    const hour = Math.trunc(this.videoTime / 3600).toString()
    const minute = Math.trunc(this.videoTime / 60).toString()
    const second = (this.videoTime % 60).toFixed(2)
    if (hour === '0') {
      return `${minute.padStart(2, '0')}:${second.padStart(5, '0')}`
    }
    return `${hour}:${minute.padStart(2, '0')}:${second.padStart(5, '0')}`
  }
  revoke() {
    URL.revokeObjectURL(this.url)
  }
}
export const takeScreenshot = (video: HTMLVideoElement, withDanmaku = false) => {
  const time = video.currentTime
  return new Screenshot(video, time, withDanmaku)
}
let screenShotsList: { screenshots: Screenshot[] } = { screenshots: [] }
Observer.videoChange(async () => {
  if (!dq('.video-screenshot-container')) {
    resources.applyStyle('videoScreenshotStyle')
    document.body.insertAdjacentHTML('beforeend', /*html*/`
      <div class="video-screenshot-container">
        <transition-group class="video-screenshot-list" name="video-screenshot-list" tag="div">
          <video-screenshot v-for="screenshot of screenshots" :filename="screenshot.filename"
            :object-url="screenshot.url" :time="screenshot.time" @discard="discard(screenshot)"
            :key="screenshot.id"></video-screenshot>
        </transition-group>
        <div v-show="showBatch" class="video-screenshot-batch">
          <a class="batch-link" style="display:none" :download="batchFilename"></a>
          <button @click="saveAll">
            <i class="mdi mdi-content-save"></i>全部保存
          </button>
          <button @click="discardAll">
            <i class="mdi mdi-delete-forever"></i>全部丢弃
          </button>
        </div>
      </div>
    `)
    Vue.component('video-screenshot', {
      props: {
        objectUrl: String,
        filename: String,
        time: String,
      },
      template: /*html*/`
        <div class="video-screenshot-thumbnail">
          <img v-if="objectUrl" :src="objectUrl">
          <div class="mask" v-if="objectUrl">
            <a class="link" style="display:none" :href="objectUrl" :download="filename"></a>
            <button @click="save" class="save" title="保存"><i class="mdi mdi-content-save-outline"></i></button>
            <button @click="discard" title="丢弃" class="discard"><i class="mdi mdi-delete-forever-outline"></i></button>
            <span class="time">{{time}}</span>
          </div>
          <div class="loading" @click="discard" v-else>
          </div>
        </div>
      `,
      methods: {
        discard() {
          this.$emit("discard")
        },
        save() {
          this.$el.querySelector(".link").click()
          this.discard()
        },
      },
    })
    screenShotsList = new Vue({
      el: '.video-screenshot-container',
      data: {
        screenshots: [] as Screenshot[],
        batchFilename: getFriendlyTitle() + '.zip',
      },
      methods: {
        discard(screenshot: Screenshot) {
          this.screenshots.splice(this.screenshots.indexOf(screenshot), 1)
          screenshot.revoke()
        },
        async saveAll() {
          const zip = new JSZip()
          this.screenshots.forEach((it: Screenshot) => {
            zip.file(it.filename, it.blob, {
              date: new Date(it.timeStamp),
            })
          })
          const blob = await zip.generateAsync({ type: 'blob' })
          const link = this.$el.querySelector('.batch-link')
          link.href = URL.createObjectURL(blob)
          link.click()
          URL.revokeObjectURL(link.href)
          link.href = ""
          this.discardAll()
        },
        discardAll() {
          this.screenshots.forEach((it: Screenshot) => it.revoke())
          this.screenshots = []
        },
      },
      computed: {
        showBatch() {
          return this.screenshots.length >= 2
        },
      },
    })
  }

  const video = await SpinQuery.select('#bofqi video') as HTMLVideoElement
  if (video === null) {
    return
  }
  const time = await SpinQuery.select('.bilibili-player-video-time')
  if (time === null || document.querySelector('.video-take-screenshot')) {
    return
  }

  const buttonHtml = /*html*/`
    <div class="video-take-screenshot" title="截图">
      <span><i class="mdi mdi-camera"></i></span>
    </div>`
  time.insertAdjacentHTML('afterend', buttonHtml)
  const screenshotButton = document.querySelector('.video-take-screenshot') as HTMLElement
  screenshotButton.addEventListener('click', async e => {
    const video = await SpinQuery.select('#bofqi video') as HTMLVideoElement
    const screenshot = takeScreenshot(video, e.shiftKey)
    screenShotsList.screenshots.unshift(screenshot)
  })
  document.addEventListener('keydown', e => {
    if (document.activeElement && ['input', 'textarea'].includes(document.activeElement.nodeName.toLowerCase())) {
      return
    }
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "c") {
      e.stopPropagation()
      e.preventDefault()
      screenshotButton.click()
    }
  })
  if (settings.touchVideoPlayer) {
    document.querySelectorAll('.video-take-screenshot').forEach(it => it.classList.add('touch'))
  }
})
export default {
  export: {
    takeScreenshot,
    screenShotsList,
  },
  unload: () => document.querySelectorAll('.bilibili-player-video-control-bottom .video-take-screenshot,.video-screenshot-container')
    .forEach(it => (it as HTMLElement).setAttribute('style', 'display: none !important')),
  reload: () => document.querySelectorAll('.bilibili-player-video-control-bottom .video-take-screenshot,.video-screenshot-container')
    .forEach(it => (it as HTMLElement).setAttribute('style', 'display: flex !important')),
}