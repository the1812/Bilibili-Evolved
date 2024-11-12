<template>
  <div class="user-face-container">
    <img :src="faceSrc" :srcset="faceSrcset" class="user-face" />
    <img :src="pendantSrc" :srcset="pendantSrcset" class="user-pendant" />
  </div>
</template>

<script lang="ts">
import { getUserInfo } from '@/core/user-info'
import { getDpiSourceSet } from '@/core/utils'
import { EmptyImageUrl } from '@/core/utils/constants'
import notLoginFaceUrl from './akari.jpg'

const noFaceUrl = '//static.hdslb.com/images/member/noface.gif'
export default Vue.extend({
  name: 'UserFace',
  data() {
    return {
      faceSrc: EmptyImageUrl,
      pendantSrc: EmptyImageUrl,
      faceSrcset: null,
      pendantSrcset: null,
    }
  },
  async created() {
    const userInfo = await getUserInfo()
    if (!userInfo.isLogin) {
      this.faceSrc = notLoginFaceUrl
    } else {
      if (userInfo.face) {
        const faceUrl = userInfo.face.replace('http:', 'https:')
        if (faceUrl.includes(noFaceUrl)) {
          this.faceSrc = noFaceUrl
        } else {
          const faceBaseSize = 68
          this.faceSrc = faceUrl
          this.faceSrcset = getDpiSourceSet(faceUrl, faceBaseSize)
        }
      }
      if (userInfo.pendant?.image) {
        const pendantUrl = userInfo.pendant.image.replace('http:', 'https:')
        const pendantBaseSize = 116
        this.pendantSrcset = getDpiSourceSet(pendantUrl, pendantBaseSize, 'png')
      }
    }
  },
})
</script>

<style lang="scss">
.user-face-container {
  position: relative;
  height: calc(var(--navbar-height) - 16px);
  width: calc(var(--navbar-height) - 16px);
  max-width: 36px;
  max-height: 36px;
  .user-face,
  .user-pendant {
    position: absolute;
    width: 100%;
    height: 100%;
    .custom-navbar-item:hover & {
      transform: scale(2) translateY(10px);
      z-index: 100;
      opacity: 1;
    }
  }
  .user-face {
    background-color: transparent;
    background-size: contain;
    border-radius: 50%;
  }
  .user-pendant {
    background-color: transparent;
    background-size: cover;
    width: 170%;
    height: 170%;
    top: -12px;
    left: -12px;
    opacity: 0;
    pointer-events: none;
  }
}
</style>
