<template>
  <div class="video-default-location-options">
    <div class="video-default-location-form-line">
      <div class="video-default-location-form-item-not-grow">页面</div>
      <PageTypeSelector
        v-model="pageType"
        class="video-default-location-form-item-grow"
        @change="onChangePageType"
      />
    </div>

    <div class="video-default-location-vertical-space"></div>

    <div class="video-default-location-form-line">
      <div class="video-default-location-form-item-not-grow">默认位置</div>
      <TextBox
        v-model="defaultLocation"
        class="video-default-location-form-item-grow"
        linear
        change-on-blur
        @change="onChangeDefaultLocation"
      />
    </div>

    <div class="video-default-location-vertical-space"></div>

    <div class="video-default-location-options-test">
      <ExtendBox v-model="hiddenAdvance" @change="resetObservePosition">
        <div class="video-default-location-options-advanced">
          <Advanced
            :observe-position="observePosition"
            :location-limit="locationLimit"
            @set-default-location="setDefaultLocation"
          />
        </div>
      </ExtendBox>
    </div>
  </div>
</template>

<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { TextBox } from '@/ui'
import ExtendBox from './ExtendBox.vue'
import Advanced from './Advanced.vue'
import PageTypeSelector from './PageTypeSelector.vue'
import { pageTypeInfos, getCurrentPageType } from '.'

const maxLocation = 4000

let panelObserver = null

const stringIntoInt = (value: string): number | null => {
  const num = parseFloat(value)
  if (isNaN(num)) {
    return null
  }
  return Math.round(num)
}

export default Vue.extend({
  components: {
    TextBox,
    ExtendBox,
    Advanced,
    PageTypeSelector,
  },
  props: {
    componentData: {
      type: Object, // ComponentMetadata
      required: true,
    },
  },
  data() {
    const {
      options: { locations },
    } = getComponentSettings(this.componentData)
    const currentPageType = getCurrentPageType() ?? Object.keys(pageTypeInfos)[0]
    return {
      locations,
      defaultLocation: String(locations[currentPageType]),
      hiddenAdvance: true,
      observePosition: false,
      locationLimit: maxLocation,
      pageType: currentPageType,
    }
  },
  created() {
    this.setupPanelSwitch()
  },
  mounted() {
    if (panelObserver) {
      panelObserver.start()
    }
  },
  beforeDestroy() {
    if (panelObserver) {
      panelObserver.stop()
    }
  },
  methods: {
    onChangePageType(value: string) {
      this.defaultLocation = String(this.locations[value])
    },
    setDefaultLocation(value: number) {
      this.locations[this.pageType] = value
      this.defaultLocation = String(value)
    },
    onChangeDefaultLocation(value: string) {
      let num = stringIntoInt(value)
      if (num === null) {
        this.setDefaultLocation(0)
      } else {
        num = lodash.clamp(num, 0, maxLocation)
        this.setDefaultLocation(num)
      }
    },
    resetObservePosition() {
      this.observePosition = !this.hiddenAdvance
    },
    // 启用监视设置面板的开启与关闭，以控制是否监视页面的滚动
    setupPanelSwitch() {
      const panel = dq('.component-detail-panel')
      if (!panel) {
        console.error("[videoPageOrientation] Could not find element '.component-detail-panel'")
        return
      }

      const callback = () => {
        if (panel.classList.contains('open')) {
          this.resetObservePosition()
        } else {
          this.observePosition = false
        }
      }
      const mutationObserver = new MutationObserver(callback)
      const options = {
        attributeFilter: ['class'],
        attributes: true,
      }
      panelObserver = {
        start: () => {
          callback()
          mutationObserver.observe(panel, options)
        },
        stop: () => mutationObserver.disconnect(),
      }
    },
  },
})
</script>

<style lang="scss">
@import 'form';

.video-default-location-options-advanced {
  margin: 8px;
}
</style>
