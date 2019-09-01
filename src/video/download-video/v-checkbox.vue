<template>
  <div class="v-checkbox" v-on:click="toggleCheck()" v-bind:class="{checked: checked}">
    <i class="mdi mdi-checkbox-blank-circle-outline">
      <i class="mdi mdi-checkbox-marked-circle"></i>
    </i>
    <span class="content">{{title}}</span>
  </div>
</template>
<script lang="ts">
export default {
  props: ['checked', 'title'],
  methods: {
    toggleCheck() {
      this.$emit('update:checked', !this.checked)
    }
  }
}
</script>
<style lang="scss">
.v-checkbox {
  font-size: 10pt;
  cursor: pointer;
  display: flex;
  align-items: center;

  .mdi {
    font-size: 15pt;
    line-height: 1;
  }
  .content {
    flex-grow: 1;
    text-align: left;
    padding: 0 8px;
  }
  .mdi-checkbox-marked-circle {
    color: var(--theme-color);
    position: absolute;
    top: 0;
    left: 0;
    transform: scale(0);
    transition-timing-function: cubic-bezier(0.6, -0.28, 0.74, 0.05);
  }
  .mdi-checkbox-blank-circle-outline {
    color: #8884;
    position: relative;
  }
  &.checked .mdi-checkbox-blank-circle-outline {
    color: var(--theme-color);
  }
  &.checked .mdi-checkbox-marked-circle {
    transform: scale(1);
    transition-timing-function: cubic-bezier(0.18, 0.89, 0.32, 1.28);
  }
}
</style>