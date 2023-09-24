<template>
  <div class="be-image-picker">
    <VButton ref="pickButton" class="pick-button" @click="popupOpen = !popupOpen">
      <slot name="text"> 选择图片 </slot>
    </VButton>
    <VPopup
      v-model="popupOpen"
      class="popup"
      :trigger-element="$refs.pickButton"
      @keydown.esc="cancel()"
    >
      <transition-group name="image-list" tag="div" class="images" tabindex="-1">
        <div
          v-for="i of images"
          :key="i.name"
          v-hit="() => selectImage(i)"
          class="image"
          :class="{ selected: i.name === selectedImage.name }"
          :title="i.name"
          :tabindex="popupOpen ? 0 : -1"
        >
          <img width="64" height="64" :src="i.url" />
        </div>
      </transition-group>
      <div v-show="images.length === 0" class="empty-tip">空空如也哦 =￣ω￣=</div>
      <div class="operations">
        <VPopup
          v-model="addImagePopupOpen"
          tabindex="-1"
          class="add-image-popup"
          :lazy="false"
          :trigger-element="$refs.addButton"
        >
          <div class="add-image-row">
            名称:
            <TextBox
              ref="addImageInput"
              v-model="newImage.name"
              :disabled="!addImagePopupOpen"
            ></TextBox>
          </div>
          <div class="add-image-row">
            链接:
            <TextBox v-model="newImage.url" :disabled="!addImagePopupOpen"></TextBox>
          </div>
          <div class="add-image-row buttons">
            <VButton
              :disabled="!addImagePopupOpen"
              @click="
                addImagePopupOpen = false
                clearNewImage()
              "
            >
              取消
            </VButton>
            <VButton
              :disabled="!newImage.url || !newImage.name"
              type="primary"
              @click="
                addImage(newImage)
                addImagePopupOpen = false
                clearNewImage()
              "
            >
              确定
            </VButton>
          </div>
        </VPopup>
        <VButton :disabled="!selectedImage.name" class="clear-image" @click="clearImage()">
          清除选择
        </VButton>
        <VButton
          ref="addButton"
          :disabled="!popupOpen"
          class="add-image"
          @click="openAddImagePopup()"
        >
          添加
        </VButton>
        <VButton :disabled="!selectedImage.name" class="edit-image" @click="editImage()">
          编辑
        </VButton>
        <VButton
          :disabled="!selectedImage.name"
          @click="
            removeImage(selectedImage)
            clearImage()
          "
        >
          删除
        </VButton>
      </div>
      <div class="operations">
        <VButton :disabled="!popupOpen" @click="cancel()"> 取消 </VButton>
        <VButton :disabled="!popupOpen" type="primary" @click="ok()"> 确定 </VButton>
      </div>
      <div v-if="addImagePopupOpen" class="mask"></div>
    </VPopup>
  </div>
</template>

<script lang="ts">
import { ImageItem, getEmptyImage, images, addImage, removeImage } from './image-store'

export default Vue.extend({
  name: 'ImagePicker',
  components: {
    VButton: () => import('./VButton.vue').then(m => m.default),
    VPopup: () => import('./VPopup.vue').then(m => m.default),
    TextBox: () => import('./TextBox.vue').then(m => m.default),
  },
  model: {
    prop: 'image',
    event: 'change',
  },
  props: {
    image: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      images,
      popupOpen: false,
      addImagePopupOpen: false,
      selectedImage: getEmptyImage(),
      newImage: getEmptyImage(),
    }
  },
  methods: {
    addImage,
    removeImage,
    ok() {
      this.$emit('change', this.selectedImage)
      this.popupOpen = false
    },
    cancel() {
      this.selectedImage = this.image
      this.popupOpen = false
    },
    selectImage(image: ImageItem) {
      if (this.selectedImage.name === image.name) {
        this.selectedImage = getEmptyImage()
      } else {
        this.selectedImage = image
      }
    },
    clearImage() {
      this.selectedImage = getEmptyImage()
    },
    clearNewImage() {
      this.newImage = getEmptyImage()
    },
    editImage() {
      this.newImage = this.selectedImage
      // this.$refs.addButton.$el.click()
      this.openAddImagePopup()
    },
    async openAddImagePopup() {
      this.addImagePopupOpen = !this.addImagePopupOpen
      await this.$nextTick()
      this.$refs.addImageInput.$refs.input.focus()
    },
  },
})
</script>

<style lang="scss" scoped>
@import 'common';
.be-image-picker {
  position: relative;
  font-size: 14px;
  .popup {
    transition: 0.12s ease-out;
    transform: translateX(-50%) translateY(8px) scale(0.75);
    transform-origin: top;
    top: 100%;
    left: 50%;
    padding: 8px;
    width: 302px; // 2 * 8px + 4 * 64px + 5 * 6px
    box-sizing: border-box;
    @include popup();
    &.open {
      transform: translateX(-50%) translateY(8px) scale(1);
    }
    .empty-tip {
      @include text-color();
      text-align: center;
      margin-bottom: 16px;
    }
    .images {
      max-height: 240px;
      @include no-scrollbar();
      outline: none !important;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-start;
      padding-left: 6px;
      padding-top: 6px;
      .image {
        &.image-list-enter,
        &.image-list-leave-to {
          opacity: 0;
        }
        &.image-list-leave-active {
          position: absolute;
        }
        @include round-corner(4px);
        transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
        outline: none !important;
        overflow: hidden;
        cursor: pointer;
        display: flex;
        margin-right: 6px;
        margin-bottom: 6px;
        img {
          object-fit: cover;
          transition: 0.2s ease-out;
        }
        &:hover,
        &:focus-within {
          box-shadow: 0 0 0 2px var(--theme-color), 0 0 0 4px var(--theme-color-20);
          img {
            transform: scale(1.1);
          }
        }
        &.selected {
          box-shadow: 0 0 0 3px var(--theme-color);
        }
      }
    }
    .mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      @include round-corner();
      background-color: #000a;
    }
    .operations {
      display: flex;
      margin: 8px 4px 4px 4px;
      @include flex-gap();
      > .be-button {
        flex: 1 0 0;
        padding: 6px 8px;
        &.clear-image {
          flex-grow: 2;
        }
      }
      .add-image-popup {
        transition: 0.12s ease-out;
        transform: translateX(-50%) translateY(-50%) scale(0.75);
        top: 50%;
        left: 50%;
        padding: 14px;
        @include popup();
        width: 80%;
        &.open {
          transform: translateX(-50%) translateY(-50%) scale(1);
        }
        .add-image-row {
          display: flex;
          align-items: center;
          justify-content: center;
          @include text-color();
          &:not(:last-child) {
            margin-bottom: 12px;
          }
          .be-textbox {
            margin-left: 8px;
            flex: 1 0 0;
          }
          .be-button {
            flex: 1 0 0;
            padding: 6px 8px;
          }
          .title {
            @include semi-bold();
            font-size: 16px;
          }
          &.buttons {
            @include flex-gap();
          }
        }
      }
    }
  }
}
</style>
