<template>
  <div class="video-page-orientation-options">
    <div class="label-input-line form-line">
      <div class="label">
        默认位置
      </div>
      <TextBox
        v-model="defaultLocation"
        class="input"
        linear
        change-on-blur
        @change="onChangeDefaultLocation"
      />
    </div>

    <div class="inputs-line form-line">
      <ExtendBox
        v-model="hiddenAdvance"
        class="input"
        @change="resetObservePosition"
      >
        <Advanced
          :observe-position="observePosition"
          :location-limit="locationLimit"
          @set-default-location="setDefaultLocation"
        />
      </ExtendBox>
    </div>
  </div>
</template>

<script lang="ts">
import { getComponentSettings } from '@/core/settings'
import { TextBox } from '@/ui'
import ExtendBox from './ExtendBox.vue'
import Advanced from './Advanced.vue'

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
  },
  props: {
    componentData: {
      type: Object, // ComponentMetadata
      required: true,
    },
  },
  data() {
    const { options } = getComponentSettings(this.componentData)
    return {
      options,
      defaultLocation: String(options.location),
      hiddenAdvance: true,
      observePosition: false,
      locationLimit: maxLocation,
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
    setDefaultLocation(value: number) {
      this.options.location = value
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
        console.error(
          "[videoPageOrientation] Could not find element '.component-detail-panel'",
        )
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

<style lang="scss" scoped>
.form-line {
  margin: 8px 0;
  display: flex;
  align-items: center;
  column-gap: 10px;
  &>* {
    hight: min-content;
  }
}

.label-input-line {
  .label {
    flex: 0 auto;
  }
  .input {
    flex: 1;
  }
}

.inputs-line .input {
  flex: 1;
}
</style>
