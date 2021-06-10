<template>
  <div class="translate-container">
    <div v-if="!working && !translated" class="translate" @click="translate()">
      <i class="mdi mdi-earth"></i>翻译
    </div>
    <i v-if="working" class="translating mdi mdi-18px mdi-loading mdi-spin"></i>
    <div v-if="translated" class="translated">
      翻译自
      <a
        :href="activeTranslator.link"
        target="_blank"
      >{{ activeTranslator.name }}</a>:
    </div>
    <div v-if="translated" class="translate-result">
      {{ result }}
    </div>
  </div>
</template>

<script lang="ts">
import { logError } from '@/core/utils/log'
import { getTranslator, MachineTranslateProvider } from './translators'

export default Vue.extend({
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      result: '',
      working: false,
      activeTranslator: {},
    }
  },
  computed: {
    translated() {
      return this.result !== ''
    },
  },
  methods: {
    async translate() {
      try {
        this.working = true
        // 移除 #话题# , '#'似乎会干扰翻译器
        const text = this.text.replace(/#(.+?)#/g, '') as string
        this.activeTranslator = getTranslator()
        const translator = this.activeTranslator as MachineTranslateProvider
        this.result = await translator.translate(text)
      } catch (error) {
        logError(error)
      } finally {
        this.working = false
      }
    },
  },
})
</script>

<style lang="scss">
.bb-comment .translate-container,
.card-content .translate-container {
  margin-top: 10px;
  .translated {
    font-size: 12px;
    color: #aaa;
    a {
      color: var(--theme-color);
    }
  }
  .translate {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #aaa;
    cursor: pointer;
    &:hover {
      color: var(--theme-color);
    }
    .mdi {
      font-size: 14px;
      margin-right: 2px;
    }
  }
  .translating {
    font-size: 18px;
  }
  .translate-result {
    padding-top: 10px;
    padding-right: 10px;
    white-space: pre-wrap;
    line-height: 22px;
    word-break: break-all;
    overflow-wrap: break-word;
    body.dark & {
      color: #eee;
    }
  }
}
.bb-comment .translate-container {
  margin-top: 6px;
  font-weight: normal;
  font-size: 14px;
}
</style>
