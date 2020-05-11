export default {
  widget: {
    content: /*html*/`
      <button class="gui-settings-flat-button" id="live-pip">
        <i class="mdi mdi-24px mdi-picture-in-picture-bottom-right" style="transform: scale(0.9);"></i>
        <span>画中画</span>
      </button>
    `,
    condition: () => {
      return document.URL.match(/https:\/\/live.bilibili.com\/(blanc\/)?([\d]+)/)
        && 'requestPictureInPicture' in HTMLVideoElement.prototype
    },
    success: () => {
      (dq('#live-pip') as HTMLButtonElement).addEventListener('click', () => {
        if (document.pictureInPictureElement === dq('video')) {
          document.exitPictureInPicture()
        } else {
          (dq('video') as HTMLVideoElement).requestPictureInPicture()
        }
      })
    }
  }
}