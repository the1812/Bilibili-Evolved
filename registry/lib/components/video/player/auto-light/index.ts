import { playerAgent } from '@/components/video/player-agent'
import { lightOn, lightOff } from '@/components/video/player-light'
import { videoChange } from '@/core/observer'
import { allVideoUrls } from '@/core/utils/urls'
import { newSwitchComponentWrapper, defineSwitchMetadata } from '@/components/switch-options'
import { getComponentSettings } from '@/core/settings'

let playerAgentInstance

const CreateAnim = (): void => {
  const biliMainHeader = document.getElementById('biliMainHeader')
  if (biliMainHeader == null) {
    return
  }
  const mstars1 = document.createElement('div')
  mstars1.id = 'mstars1'
  const mstars2 = document.createElement('div')
  mstars2.id = 'mstars2'
  biliMainHeader.appendChild(mstars1)
  biliMainHeader.appendChild(mstars2)

  // 添加一段css 样式到document最后
  const style = document.createElement('style')
  // generate random stars
  function generate(numCtrl) {
    let star = ''
    const max = window.innerWidth * window.innerHeight
    for (let i = 0; i < max / numCtrl; i++) {
      const x = Math.floor(Math.random() * window.innerWidth * 1.5)
      const y = Math.floor(Math.random() * (window.innerHeight + 2000))
      star += `${x}px ${y}px #FFF,`
    }
    const x = Math.floor(Math.random() * window.innerWidth * 1.5)
    const y = Math.floor(Math.random() * (window.innerHeight + 2000))
    star += `${x}px ${y}px #FFF;`
    return star
  }
  const starNumCtl = 400
  const stars1Shadow = generate(starNumCtl)
  const stars2Shadow = generate(starNumCtl * 2)
  const stars3Shadow = generate(starNumCtl * 4)
  const stars4Shadow = generate(starNumCtl * 8)
  style.innerHTML = `
  #mstars1{z-index: 1009;position: fixed;left:0px; width:1px;height:1px;background:transparent;box-shadow:${stars1Shadow};animation:animStar 50s linear infinite}
  #mstars1:after{content:' ';position:fixed;left:0px;top:0px;width:1px;height:1px;background:transparent;box-shadow:${stars2Shadow}}
  #mstars2{z-index: 1009;position: fixed;left:0px;width:2px;height:2px;background:transparent;box-shadow:${stars3Shadow};animation:animStar 100s linear infinite}
  #mstars2:after{content:' ';position:fixed;left:0px;top:0px;width:2px;height:2px;background:transparent;box-shadow:${stars4Shadow}}
  @keyframes animStar{from{transform:translateY(-200px)}to{transform:translateY(-2200px)}}
  `
  document.body.appendChild(style)
}

const StarAnim = (on: boolean) => {
  // 查找id mstars1 的div
  let mstars1 = document.getElementById('mstars1')
  let mstars2 = document.getElementById('mstars2')
  // 如果没有找到id biliMainHeader 的div创建2个id为 mstars1 mstars2 的div
  if (on) {
    if (mstars1 == null) {
      CreateAnim()
      mstars1 = document.getElementById('mstars1')
      mstars2 = document.getElementById('mstars2')
    }
    // 设置mstars1 mstars2 visible 为true
    mstars1.style.visibility = 'visible'
    mstars2.style.visibility = 'visible'
  } else if (mstars1 != null) {
    mstars1.style.visibility = 'hidden'
    mstars2.style.visibility = 'hidden'
  }
}

const switchMetadata = defineSwitchMetadata({
  name: 'simplifyOptions',
  dimAt: 'checked',
  switchProps: {
    checkedIcon: 'mdi-eye-off-outline',
    notCheckedIcon: 'mdi-eye-outline',
  },
  switches: {
    anim: {
      defaultValue: false,
      displayName: '隐藏星光动画',
    },
  },
})

export const component = newSwitchComponentWrapper(switchMetadata)({
  name: 'playerAutoLight',
  displayName: '播放时自动关灯',
  urlInclude: allVideoUrls,
  tags: [componentsTags.video],
  description: {
    'zh-CN': '在视频播放时自动关灯, 暂停或结束时再自动打开.',
  },
  entry: async ({ metadata }) => {
    const { isEmbeddedPlayer } = await import('@/core/utils')
    const { options } = getComponentSettings(metadata.name)

    if (isEmbeddedPlayer()) {
      return
    }

    const makeLightOn = () => {
      lightOn()
      StarAnim(false)
    }

    const makeLightOff = () => {
      lightOff()
      if (!options['switch-anim']) {
        StarAnim(true)
      }
    }

    videoChange(async () => {
      if (playerAgentInstance != null) {
        const oldVideo = await playerAgentInstance.query.video.element()
        oldVideo.removeEventListener('ended', makeLightOn)
        oldVideo.removeEventListener('pause', makeLightOn)
        oldVideo.removeEventListener('play', makeLightOff)
      }

      playerAgentInstance = playerAgent
      const video = await playerAgentInstance.query.video.element()

      if (playerAgentInstance.isAutoPlay()) {
        makeLightOff()
      }

      video.addEventListener('ended', makeLightOn)
      video.addEventListener('pause', makeLightOn)
      video.addEventListener('play', makeLightOff)
    })
  },
})
