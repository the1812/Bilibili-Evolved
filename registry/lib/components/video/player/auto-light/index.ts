import { defineComponentMetadata } from '@/components/define'
import { playerAgent } from '@/components/video/player-agent'
import { lightOn, lightOff } from '@/components/video/player-light';
import { videoChange } from '@/core/observer'
import { allVideoUrls } from '@/core/utils/urls'

let playerAgentInstance;

const CreateAnim = () => {
  let biliMainHeader = document.getElementById("biliMainHeader");
  if (!biliMainHeader) return;
  let mstars1 = document.createElement("div");
  mstars1.id = "mstars1";
  let mstars2 = document.createElement("div");
  mstars2.id = "mstars2";
  biliMainHeader.appendChild(mstars1);
  biliMainHeader.appendChild(mstars2);

  // 添加一段css 样式到document最后
  let style = document.createElement("style");
  // generate random stars
  function generate(numCtrl) {
    let star = '';
    let max = window.innerWidth * window.innerHeight;
    for (let i = 0; i < max / numCtrl; i++) {
      star += `${Math.floor(Math.random() * window.innerWidth * 1.5)}px ${Math.floor(Math.random() * (window.innerHeight + 2000))}px #FFF,`
    }
    star += `${Math.floor(Math.random() * window.innerWidth * 1.5)}px ${Math.floor(Math.random() * (window.innerHeight + 2000))}px #FFF;`
    return star;
  }
  let starNumCtl = 400;
  style.innerHTML = `
  #mstars1{z-index: 1009;position: fixed;left:0px; width:1px;height:1px;background:transparent;box-shadow:${generate(starNumCtl)};animation:animStar 50s linear infinite}
  #mstars1:after{content:" ";position:fixed;left:0px;top:0px;width:1px;height:1px;background:transparent;box-shadow:${generate(starNumCtl * 2)}}
  #mstars2{z-index: 1009;position: fixed;left:0px;width:2px;height:2px;background:transparent;box-shadow:${generate(starNumCtl * 4)};animation:animStar 100s linear infinite}
  #mstars2:after{content:" ";position:fixed;left:0px;top:0px;width:2px;height:2px;background:transparent;box-shadow:${generate(starNumCtl * 8)}}
  @keyframes animStar{from{transform:translateY(${-200}px)}to{transform:translateY(${-2200}px)}}
  `;
  document.body.appendChild(style);
}

const StarAnim = (on: boolean) => {
  //查找id mstars1 的div
  let mstars1 = document.getElementById("mstars1");
  let mstars2 = document.getElementById("mstars2");
  //如果没有找到id biliMainHeader 的div创建2个id为 mstars1 mstars2 的div
  if (on) {
    if (mstars1 == null) {
      CreateAnim();
      mstars1 = document.getElementById("mstars1");
      mstars2 = document.getElementById("mstars2");
    }
    //设置mstars1 mstars2 visible 为true
    mstars1.style.visibility = "visible";
    mstars2.style.visibility = "visible";
  } else {
    if (mstars1 != null) {
      mstars1.style.visibility = "hidden";
      mstars2.style.visibility = "hidden";
    }
  }
}

let lightOn2 = () => {
  lightOn();
  StarAnim(false);
}

let lightOff2 = () => {
  lightOff();
  StarAnim(true);
}

export const component = defineComponentMetadata({
  name: 'playerAutoLight',
  displayName: '播放时自动关灯',
  urlInclude: allVideoUrls,
  tags: [componentsTags.video],
  description: {
    'zh-CN': '在视频播放时自动关灯, 暂停或结束时再自动打开.',
  },
  entry: async () => {
    const { isEmbeddedPlayer } = await import('@/core/utils')
    const { lightOn, lightOff } = await import('@/components/video/player-light')

    if (isEmbeddedPlayer()) {
      return
    }

    videoChange(async () => {
      if (playerAgentInstance != null) {
        const oldVideo = await playerAgentInstance.query.video.element()
        oldVideo.removeEventListener('ended', lightOn2)
        oldVideo.removeEventListener('pause', lightOn2)
        oldVideo.removeEventListener('play', lightOff2)
      }

      playerAgentInstance = playerAgent
      const video = await playerAgentInstance.query.video.element()

      if (playerAgentInstance.isAutoPlay()) {
        lightOff2()
      }

      video.addEventListener('ended', lightOn2)
      video.addEventListener('pause', lightOn2)
      video.addEventListener('play', lightOff2)
    })
  },
})
