const video = dq('.bilibili-player-video video') as HTMLVideoElement;
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
/**
 *
 * @param _mode - when callback should trigger
 * @param callback
 * @param handelScrollBack - a func which called onVideoBack
 */
function onVideoOut(_mode: string, callback?: () => void) {
  const videoClient = video?.getBoundingClientRect();
  if (videoClient?.top && videoClient.height) {
    let toTop = getToTop(_mode, videoClient);
    if (!video.paused && toTop <= 0) {
      callback ? callback() : '';
      window.removeEventListener('scroll', onVideoOutEvent);
      // get ready to check when the video el came back.
      window.addEventListener('scroll', onVideoBackEvent, {
        passive: true,
      });
    }
  }
}

function onVideoOutEvent() {
  onVideoOut(mode, () => video.pause());
}

// run callback when video el scroll back.
function onVideoBack(_mode: string, callback?: () => void) {
  const videoClient = video?.getBoundingClientRect();
  if (videoClient?.top && videoClient.height) {
    let toTop = getToTop(_mode, videoClient);
    if (video.paused && toTop >= 0) {
      callback ? callback() : '';
      // this is do by 
      // window.addEventListener('scroll',onVideoOut)
      window.removeEventListener('scroll', onVideoBackEvent);
    }
  }
}

function onVideoBackEvent() {
  onVideoBack(mode, () => video.play());
}

(async () => {
  addSettingsListener('triggerPausePlace', (value) => (mode = value));
  Observer.videoChange(async () => {
    video.addEventListener('play', () => {
      window.addEventListener('scroll', onVideoOutEvent, { passive: true });
    });
  });
})();
