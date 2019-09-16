<template>
  <div class="profile-item" :class="{duplicate: duplicateName, selected}">
    <template v-if="!editing">{{profile.name}}</template>
    <template v-else>
      <input type="text" v-model="name" />
    </template>
    <icon v-if="!editing" style="transform: scale(0.9)" type="mdi" icon="pencil-outline" title="重命名" @click.native="editing = true"></icon>
    <icon v-if="editing" type="mdi" icon="check" title="确定" @click.native="saveProfile()"></icon>
    <!-- <icon v-if="deletable && !editing" type="mdi" icon="close" title="删除"></icon> -->
  </div>
</template>
<script lang="ts">
export default {
  components: {
    Icon: () => import('../../style/icon.vue')
  },
  props: ['profile', 'deletable', 'selected'],
  data() {
    return {
      name: this.profile.name,
      editing: false,
      duplicateName: false
    }
  },
  methods: {
    saveProfile() {
      if (this.name === this.profile.name) {
        this.duplicateName = false
        this.editing = false
        return
      }
      if (this.name === '' || settings.aria2RpcOptionProfiles.some(p => p.name === this.name)) {
        this.duplicateName = true
        return
      } else {
        this.duplicateName = false
        if (settings.aria2RpcOptionSelectedProfile === this.profile.name) {
          settings.aria2RpcOptionSelectedProfile = this.name
        }
        this.profile.name = this.name
        this.editing = false
        this.$emit('profile-update')
      }
    }
  }
}
</script>
<style lang="scss">
.profile-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background-color: #8882;
  border-radius: 4px;
  border: 2px solid transparent;
  flex-shrink: 0;
  cursor: pointer;
  &:not(:last-child) {
    margin-right: 8px;
  }
  &.duplicate {
    border-color: red;
  }
  &.selected:not(.duplicate) {
    border-color: var(--theme-color);
  }
  input[type='text'] {
    width: 5em;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    line-height: normal;
  }
}
</style>
