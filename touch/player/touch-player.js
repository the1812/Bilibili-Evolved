const getPosition = element => {
  let x = 0
  let y = 0
  while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
    x += element.offsetLeft - element.scrollLeft
    y += element.offsetTop - element.scrollTop
    element = element.offsetParent
  }
  return { x: x, y: y }
}
const secondsToTime = sec => {
  sec = Math.abs(sec)
  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor((sec - hours * 3600) / 60)
  const seconds = sec - hours * 3600 - minutes * 60

  let result = fixed(seconds) + '秒'
  if (minutes > 0) {
    result = minutes + '分' + result
  }
  if (hours > 0) {
    result = hours + '时' + result
  }

  return result
}
const secondsToHms = sec => {
  sec = Math.abs(sec)
  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor((sec - hours * 3600) / 60)
  const seconds = sec - hours * 3600 - minutes * 60

  let result = (seconds < 10 ? '0' : '') + fixed(seconds)
  result = (minutes < 10 ? '0' : '') + minutes + ':' + result
  result = (hours < 10 ? '0' : '') + hours + ':' + result

  return result
}
class Swiper {
  constructor (element) {
    this.action = new SwipeAction(element)
    this.onTouchStart = null
    this.onTouchEnd = null
    this.direction = null

    element.addEventListener('touchstart', e => {
      this.xDown = e.touches[0].clientX
      this.yDown = e.touches[0].clientY
      if (this.onTouchStart) {
        this.onTouchStart(e)
      }
    })
    element.addEventListener('touchmove', e => {
      if (!this.xDown || !this.yDown) {
        return
      }
      const xUp = e.touches[0].clientX
      const yUp = e.touches[0].clientY
      const elementPosition = getPosition(element)
      const position = {
        x: (e.touches[0].pageX - elementPosition.x) / element.clientWidth,
        y: (e.touches[0].pageY - elementPosition.y) / element.clientHeight,
        width: element.clientWidth,
        height: element.clientHeight
      }

      const xDiff = this.xDown - xUp
      const yDiff = this.yDown - yUp

      if (!this.direction) {
        let direction = ''
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
          direction = 'horizontal'
        } else {
          direction = 'vertical'
        }
        this.direction = direction
      } else {
        if (this.direction === 'vertical') {
          this.action.startAction(this.direction, yDiff, position)
        } else if (this.direction === 'horizontal') {
          this.action.startAction(this.direction, -xDiff, position)
        }
      }
      if (e.cancelable) {
        e.preventDefault()
      }
    })
    element.addEventListener('touchend', e => {
      this.xDown = null
      this.yDown = null
      this.direction = null
      if (this.onTouchEnd) {
        this.onTouchEnd(e)
      }
    })
  }
}
class SwipeAction {
  constructor (element) {
    this.lowSpeedForward = null
    this.lowSpeedBackward = null
    this.mediumSpeedForward = null
    this.mediumSpeedBackward = null
    this.highSpeedForward = null
    this.highSpeedBackward = null

    this.volumeUp = null
    this.volumeDown = null
    this.brightnessUp = null
    this.brightnessDown = null

    this.speedCancel = null
    this.minSwipeDistance = 20
    this.onActionStart = null
    this.onActionEnd = null

    this.element = element
    this.touchStart = false
    this.startPosition = null
    this.lastAction = null
    element.addEventListener('touchstart', () => {
      this.touchStart = true
    })
    element.addEventListener('touchend', () => {
      this.startPosition = null
      this.onActionEnd && this.onActionEnd(this.lastAction)
      this.lastAction = null
    })
  }

  startAction (direction, distance, position) {
    if (this.touchStart) {
      this.onActionStart && this.onActionStart(direction)
      this.startPosition = position
      this.touchStart = false
    }
    if (direction === 'vertical') {
      // if (Math.abs(distance) < this.minSwipeDistance) {
      //   this.volumeCancel && this.volumeCancel()
      //   this.lastAction = null
      // } else {
      let upHandler
      let downHandler
      if (this.startPosition.x < 1 / 2) {
        upHandler = this.brightnessUp
        downHandler = this.brightnessDown
        const brightnessChange = Math.round(
          200 * (distance - this.minSwipeDistance) / (1.5 * position.height)
        )
        if (distance > 0) {
          upHandler && upHandler(brightnessChange)
        }
        else {
          downHandler && downHandler(brightnessChange)
        }
        this.lastAction = {
          type: 'brightness',
          brightness: brightnessChange
        }
      } else {
        upHandler = this.volumeUp
        downHandler = this.volumeDown
        const volumeChange = Math.round(
          200 * (distance - this.minSwipeDistance) / (1.5 * position.height)
        )
        if (distance > 0) {
          upHandler && upHandler(volumeChange)
        }
        else {
          downHandler && downHandler(volumeChange)
        }
        this.lastAction = {
          type: 'volume',
          volume: volumeChange
        }
      }
      // }
    } else if (direction === 'horizontal') {
      if (position.y < 1 / 3 && (position.x < 0.1 || position.x > 0.9)
        // || Math.abs(distance) < this.minSwipeDistance
        ) {
        this.speedCancel && this.speedCancel()
        this.lastAction = null
      } else {
        let speedFactor = 0
        let forwardHandler
        let backwardHandler
        if (this.startPosition.y < 1 / 3) {
          speedFactor = 0.05
          forwardHandler = this.lowSpeedForward
          backwardHandler = this.lowSpeedBackward
        } else if (this.startPosition.y >= 1 / 3 && this.startPosition.y <= 2 / 3) {
          speedFactor = 0.2
          forwardHandler = this.mediumSpeedForward
          backwardHandler = this.mediumSpeedBackward
        } else {
          speedFactor = 1
          forwardHandler = this.highSpeedForward
          backwardHandler = this.highSpeedBackward
        }

        if (distance > 0) {
          const seconds = (distance - this.minSwipeDistance) * speedFactor
          forwardHandler && forwardHandler(seconds)
          this.lastAction = {
            type: 'playback',
            seconds: seconds
          }
        } else {
          const seconds = (distance + this.minSwipeDistance) * speedFactor
          backwardHandler && backwardHandler(seconds)
          this.lastAction = {
            type: 'playback',
            seconds: seconds
          }
        }
      }
    }
  }
}
class VideoShot {
  constructor () {
    this.aid = unsafeWindow.aid
    this.cid = unsafeWindow.cid
    this.cidData = null
    this.supportWebp = VideoShot.supportWebp
  }
  getVideoshot (currentTime, done) {
    if (!(this.aid && this.cid)) {
      return
    }
    if (!this.cidData) {
      Ajax.getText(`https://api.bilibili.com/x/player/videoshot?aid=${this.aid}&cid=${this.cid}&index=1`).then(response => {
        this.cidData = JSON.parse(response).data
        this.getVideoshot(currentTime, done)
      })
    } else {
      const data = this.cidData
      const indexData = data.index
      let shotIndex = 0
      for (let index = 0; index < indexData.length - 2; index++) {
        if (currentTime >= indexData[index] &&
          currentTime < indexData[index + 1]) {
          shotIndex = index
          break
        }
      }

      let imageData = data.image
      if (imageData === null) {
        return
      }
      if (this.supportWebp) {
        imageData = imageData.map(url => url.replace('.jpg', '.jpg@.webp'))
      }
      const xLength = parseInt(data.pv_x_len) || 10
      const yLength = parseInt(data.pv_y_len) || 10
      const xSize = parseInt(data.pv_x_size) || 160
      const ySize = parseInt(data.pv_y_size) || 90
      const x = -(shotIndex % 100 % xLength) * xSize
      const y = -Math.floor(shotIndex % 100 / yLength) * ySize
      done({
        width: xSize,
        height: ySize,
        backgroundImage: `url(${imageData[Math.floor(shotIndex / 100)]})`,
        backgroundPosition: `${x}px ${y}px`
      })
    }
  }
  static get supportWebp () {
    try {
      const canvas = document.createElement('canvas')
      if (canvas.getContext && canvas.getContext('2d')) {
        try {
          return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
        } catch (ex) {
          return false
        }
      } else { return false }
    } catch (ex) {
      return false
    }
  }
}

function unbindIconsClick (icons) {
  icons.unbind('click')
}
function setupTouchPlayer (player) {
  if ($('.touch-video-box').length !== 0) {
    return
  }
  $('.bilibili-player-video-subtitle').before(/* html */`
    <div class='touch-video-box-wrapper'>
      <div class='touch-video-box adjust-closed animation'>
        <div class='touch-video-info'>
          <div class='touch-row'>
            <div class='touch-row-item'>
              <span class='touch-speed'></span>
            </div>
            <div class='touch-row-item-wide'>
              <span class='touch-info'></span>
            </div>
          </div>
          <div class='touch-row'>
            <div class='videoshot-wrapper touch-row-item'>
              <div class='videoshot'></div>
            </div>
            <div class='touch-row-item-wide'>
              <span class='touch-result'></span>
            </div>
          </div>
        </div>
        <div class='touch-progress'></div>
      </div>
    </div>`)
  let video = $('video')
  const videoDuration = video.prop('duration')
  const swiper = new Swiper(player.get(0))
  const text = document.querySelector('.touch-video-info')
  const box = document.querySelector('.touch-video-box')

  let originalBrightness = 100
  let originalVolume = Math.round(video.prop('volume') * 100)
  const setVolume = volume => {
    volume /= 100
    if (volume < 0) {
      volume = 0
    } else if (volume > 1) {
      volume = 1
    }
    video.prop('volume', volume)
    $('.bilibili-player-video-volume-num').text(Math.round(volume * 100))

    $('.bui-thumb').css('transform', `translateY(-${48 * volume}px)`)
    $('.bui-track-vertical .bui-bar').css('transform', `scaleY(${volume})`)
    if (volume === 0) {
      $('.bilibili-player-video-btn-volume').addClass('video-state-volume-min')
      $('.bilibili-player-video-btn-volume').removeClass('video-state-volume-max')
      video.prop('muted', true)
    } else if (volume === 1) {
      $('.bilibili-player-video-btn-volume').removeClass('video-state-volume-min')
      $('.bilibili-player-video-btn-volume').addClass('video-state-volume-max')
      video.prop('muted', false)
    } else {
      $('.bilibili-player-video-btn-volume').removeClass('video-state-volume-min')
      $('.bilibili-player-video-btn-volume').removeClass('video-state-volume-max')
      video.prop('muted', false)
    }
  }

  swiper.action.onActionStart = direction => {
    box.classList.add('adjust-opened')
    text.classList[direction === 'vertical' ? 'remove' : 'add']('speed')
    video = $('video')
    originalVolume = Math.round(video.prop('volume') * 100)
    const filter = video.css('filter').match(/brightness\((.+)\)/)
    originalBrightness = Math.trunc((filter ? filter[1] : 1) * 100)
  }
  const videoshot = new VideoShot()
  const speedChange = speed => {
    return sec => {
      const current = video.prop('currentTime')
      const currentPercent = fixed(100 * current / videoDuration)
      let finalTime = current + sec
      let finalPercent = fixed(100 * finalTime / videoDuration)
      let change = sec
      if (finalTime > videoDuration) {
        finalTime = videoDuration
        finalPercent = 100
        change = videoDuration - current
      } else if (finalTime < 0) {
        finalTime = 0
        finalPercent = 0
        change = current
      }
      const result = `${secondsToHms(current)} (${currentPercent}%)<br>👇<br>${secondsToHms(finalTime)} (${finalPercent}%)`
      text.classList.remove('cancel')
      text.querySelector('.touch-speed').innerHTML = `${speed}速`
      text.querySelector('.touch-info').innerHTML = `进度: ${sec > 0 ? '+' : '-'}${secondsToTime(change)}`
      text.querySelector('.touch-result').innerHTML = result
      videoshot.getVideoshot(finalTime, style => $('.videoshot').css(style))
      $('.touch-progress').css('transform', `scaleX(${finalPercent / 100})`)
    }
  }
  swiper.action.lowSpeedBackward = speedChange('低')
  swiper.action.lowSpeedForward = speedChange('低')
  swiper.action.mediumSpeedBackward = speedChange('中')
  swiper.action.mediumSpeedForward = speedChange('中')
  swiper.action.highSpeedBackward = speedChange('高')
  swiper.action.highSpeedForward = speedChange('高')

  const volumeChange = volume => {
    let finalVolume = originalVolume + volume
    let change = Math.abs(volume)
    if (finalVolume > 100) {
      finalVolume = 100
      change = 100 - originalVolume
    } else if (finalVolume < 0) {
      finalVolume = 0
      change = originalVolume
    }
    const result = `${originalVolume} 👉 ${finalVolume}`
    setVolume(finalVolume)
    text.classList.remove('cancel')
    text.querySelector('.touch-info').innerHTML = `音量: ${volume > 0 ? '+' : '-'}${change}`
    text.querySelector('.touch-result').innerHTML = result
    $('.touch-progress').css('transform', `scaleX(${finalVolume / 100})`)
  }
  swiper.action.volumeUp = volumeChange
  swiper.action.volumeDown = volumeChange

  const brightnessChange = brightness => {
    let finalBrightness = originalBrightness + brightness
    let change = Math.abs(brightness)
    if (finalBrightness > 100) {
      finalBrightness = 100
      change = 100 - originalBrightness
    } else if (finalBrightness < 0) {
      finalBrightness = 0
      change = originalBrightness
    }
    const result = `${originalBrightness} 👉 ${finalBrightness}`
    // console.log(brightness, originalBrightness, finalBrightness)
    video.css('filter', `brightness(${finalBrightness / 100})`)
    text.classList.remove('cancel')
    text.querySelector('.touch-info').innerHTML = `亮度: ${brightness > 0 ? '+' : '-'}${change}`
    text.querySelector('.touch-result').innerHTML = result
    $('.touch-progress').css('transform', `scaleX(${finalBrightness / 100})`)
  }
  swiper.action.brightnessUp = brightnessChange
  swiper.action.brightnessDown = brightnessChange

  swiper.action.speedCancel = () => {
    text.querySelector('.touch-info').innerHTML = `取消时间调整`
    text.classList.add('cancel')
  }
  if (!unsafeWindow.TOUCH_PLAYER_DEBUG) {
    swiper.action.onActionEnd = action => {
      if (action) {
        if (action.type === 'playback') {
          let time = video.prop('currentTime')
          time += action.seconds
          if (time < 0) {
            time = 0
          } else if (time > videoDuration) {
            time = videoDuration
          }
          video.prop('currentTime', time)
        } else if (action.type === 'volume') {
          const playerSettings = JSON.parse(localStorage.bilibili_player_settings)
          playerSettings.video_status.volume = video.prop('volume')
          localStorage.bilibili_player_settings = JSON.stringify(playerSettings)
        }
      }
      box.classList.remove('adjust-opened')
    }
  }
}
function overrideClickHandler (playerArea) {
  if (!playerArea.hasClass('disable-original-hover')) {
    playerArea.addClass('disable-original-hover')
    const video = unsafeWindow.$('.bilibili-player-video')
    const hoverClassName = 'touch-video-control-show'
    const originalClickHandler = video.data('events').click[0].handler
    const doubleClick = new DoubleClickEvent(
      e => originalClickHandler(e),
      () => playerArea.toggleClass(hoverClassName)
    )

    video.unbind('click')
    doubleClick.bind(video[0])
  }
}

const main = () => {
  SpinQuery.any(
    () => $('.bilibili-player-iconfont,.bilibili-player-video-quality-menu'),
    unbindIconsClick
  )
  SpinQuery.condition(
    () => $('.bilibili-player-video'),
    it => it.length > 0 && $('video').length > 0 && $('video').prop('duration'),
    setupTouchPlayer
  )
  if (settings.touchVideoPlayerDoubleTapControl) {
    new SpinQuery(
      () => $('.bilibili-player-area'),
      it => it.length > 0 &&
        unsafeWindow.$ &&
        unsafeWindow.$('.bilibili-player-video').data('events'),
      overrideClickHandler
    ).start()
  }
}
Observer.videoChange(main)
resources.applyStyle('touchPlayerStyle')
