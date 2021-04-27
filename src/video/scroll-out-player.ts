let videoEl: HTMLVideoElement;
let mode = '视频中间';

enum MODE {
  TOP = '视频顶部',
  MID = '视频中间',
  BOT = '视频底部',
}

function getToTop(_mode: string, client: DOMRect): number {
  switch (_mode) {
    case MODE.TOP:
      return client?.top;
    case MODE.MID:
      return client?.top + client?.height / 2;
    case MODE.BOT:
      return client?.top + client?.height;
    default:
      return 0;
  }
}

// run callback when video el scroll out.
function handlePlayerOut(_mode: string, callback?: () => void) {
  const videoClient = videoEl?.getBoundingClientRect();
  if (videoClient?.top && videoClient.height) {
    let toTop = getToTop(_mode, videoClient);
    if (toTop <= 0) {
      callback ? callback() : '';
      // get ready to check when the video el came back.
      window.addEventListener('scroll', onPlayerBackEvent, {
        passive: true,
      });
      window.removeEventListener('scroll', onPlayerOutEvent);
    }
  }
}

// run callback when video el scroll back.
function handlePlayerBack(_mode: string, callback?: () => void) {
  const videoClient = videoEl?.getBoundingClientRect();
  if (videoClient?.top && videoClient.height) {
    let toTop = getToTop(_mode, videoClient);
    if (toTop >= 0) {
      callback ? callback() : '';
      window.addEventListener('scroll', onPlayerOutEvent, {
        passive: true,
      });
      window.removeEventListener('scroll', onPlayerBackEvent);
    }
  }
}

let lightOff = () => {};
let lightOn = () => {};
async function initLights() {
  await SpinQuery.unsafeJquery();
  const settingsButton = await SpinQuery.any(() =>
    unsafeWindow.$('.bilibili-player-video-btn-setting')
  );
  if (!settingsButton) {
    return;
  }
  settingsButton.mouseover().mouseout();
  const setLight = async (state: boolean) => {
    const checkbox = (await SpinQuery.select(
      '.bilibili-player-video-btn-setting-right-others-content-lightoff .bui-checkbox-input'
    )) as HTMLInputElement;
    checkbox.checked = state;
    raiseEvent(checkbox, 'change');
  };
  lightOff = () => setLight(true);
  lightOn = () => setLight(false);
}

function onPlayerOutEvent() {
  handlePlayerOut(mode, () => {
    if (settings.autoPause && !videoEl.paused) videoEl.pause();
    // 满足条件: 自动开灯功能启用、自动关灯功能启用、没有启用自动暂停
    // 补充: 当启用自动关灯与自动暂停时, 自动开灯动作由自动暂停完成
    if (settings.autoLightOn && settings.autoLightOff && !settings.autoPause)
      lightOn();
  });
}

function onPlayerBackEvent() {
  handlePlayerBack(mode, () => {
    if (settings.autoPause && videoEl.paused) videoEl.play();
    // 回来时自动关灯
    // 满足条件: 自动开灯功能启用、自动关灯功能启用、没有启用自动暂停、视频播放中
    if (settings.autoLightOn && settings.autoLightOff && !settings.autoPause && !videoEl.paused)
      lightOff();
  });
}

async function setup() {
  await initLights();
  addSettingsListener('triggerPlayerOutPlace', (value) => (mode = value));
  videoEl = dq('.bilibili-player-video video') as HTMLVideoElement;
  window.addEventListener('scroll', onPlayerOutEvent, { passive: true });
}
setup();

export default {
  reload: () => {
    window.addEventListener('scroll', onPlayerOutEvent, { passive: true });
  },
  unload: () => {
    window.removeEventListener('scroll', onPlayerBackEvent);
    window.removeEventListener('scroll', onPlayerOutEvent);
  },
};
