<template>
  <div class="aria2-rpc-profiles">
    <h2>预设</h2>
    <div class="profiles-list">
      <profile-item
        v-for="(profile, index) of profiles"
        :key="profile.name + index"
        @profile-update="profileUpdate()"
        @click.native="changeProfile(profile)"
        :profile="profile"
        :deletable="profiles.length > 1"
        :selected="profile.name === selectedProfile"
      ></profile-item>
      <div class="profile-item new-profile" @click="addProfile()">
        新增预设
        <icon type="mdi" icon="plus"></icon>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
const defaultProfile: RpcOptionProfile = {
  name: '未命名',
  ...settings.aria2RpcOption
}
export default {
  components: {
    ProfileItem: () => import('./aria2-rpc-profile-item.vue'),
    Icon: () => import('../../style/icon.vue')
  },
  data() {
    const profiles = [...settings.aria2RpcOptionProfiles]
    if (profiles.length === 0) {
      profiles.push(defaultProfile)
      settings.aria2RpcOptionProfiles = profiles
    }
    return {
      profiles,
      selectedProfile:
        settings.aria2RpcOptionSelectedProfile || defaultProfile.name
    }
  },
  watch: {
    selectedProfile(newValue: string) {
      if (settings.aria2RpcOptionSelectedProfile !== newValue) {
        settings.aria2RpcOptionSelectedProfile = newValue
      }
    }
  },
  methods: {
    profileUpdate() {
      settings.aria2RpcOptionProfiles = this.profiles
      this.selectedProfile = settings.aria2RpcOptionSelectedProfile
    },
    changeProfile(profile: RpcOptionProfile) {
      this.selectedProfile = profile.name
      this.$emit('profile-change', profile)
    },
    addProfile() {
      const profile = {
        ...this.profiles.find(
          (p: RpcOptionProfile) => p.name === this.selectedProfile
        )
      }
      if (
        this.profiles.some((p: RpcOptionProfile) => p.name === profile.name)
      ) {
        let suffix = 1
        while (
          this.profiles.some(
            (p: RpcOptionProfile) => p.name === profile.name + suffix
          )
        ) {
          suffix++
        }
        profile.name += suffix
      }
      this.profiles.push(profile)
      settings.aria2RpcOptionProfiles = this.profiles
      this.changeProfile(profile)
    }
  }
}
</script>
<style lang="scss">
.aria2-rpc-profiles {
  h2 {
    margin-bottom: 8px;
  }
  .profiles-list {
    display: flex;
    overflow: auto;
    scrollbar-width: none !important;
    &::-webkit-scrollbar {
      width: 0px !important;
    }
  }
}
</style>