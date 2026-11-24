<template>
  <section
    class="dashboard-home-general-settings"
    aria-labelledby="dashboard-home-general-settings-title"
  >
    <div class="dashboard-home-general-settings-decoration" aria-hidden="true">
      <VIcon icon="mdi-water-polo" />
    </div>
    <h2 id="dashboard-home-general-settings-title" class="dashboard-home-tab-settings-heading">
      <VIcon icon="mdi-tune" :size="20" aria-hidden="true" />
      通用设置
    </h2>
    <div class="dashboard-home-general-settings-options">
      <label>
        <strong>{{ metadata.defaultTab.displayName }}</strong>
        <select v-model="defaultTab">
          <option v-for="tab in defaultTabs" :key="tab" :value="tab">{{ tab }}</option>
        </select>
      </label>
      <label>
        <input v-model="rememberTabInUrl" type="checkbox" />
        <span>
          {{ dashboardRememberTabLabel.prefix
          }}<strong>{{ dashboardRememberTabLabel.keyword }}</strong>
        </span>
      </label>
    </div>
    <fieldset class="dashboard-home-general-settings-preview">
      <legend>
        <span class="dashboard-home-tab-settings-heading">
          <VIcon icon="mdi-picture-in-picture-bottom-right-outline" :size="16" aria-hidden="true" />
          首页内预览
        </span>
      </legend>
      <div class="dashboard-home-general-settings-options">
        <label v-for="option in previewOptions" :key="option.name">
          <input v-model="option.enabled.value" type="checkbox" />
          <span>
            {{ dashboardLinkPreviewLabelPrefix }}<strong>{{ option.label }}</strong>
          </span>
        </label>
      </div>
    </fieldset>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VIcon } from '@/ui'
import {
  dashboardHomeOptionsMetadata as metadata,
  dashboardLinkPreviewLabelPrefix,
  dashboardLinkPreviewLabels,
  dashboardLinkPreviewOptions,
  dashboardRememberTabLabel,
  setDashboardOption,
  useDashboardOption,
  type DashboardHomeOptions,
} from '../../options'

const bindOption = <K extends keyof DashboardHomeOptions>(name: K) => {
  const option = useDashboardOption(name)
  return computed({
    get: () => option.value,
    set: value => setDashboardOption(name, value),
  })
}

const defaultTab = bindOption('defaultTab')
const defaultTabs = Object.values(metadata.defaultTab.dropdownEnum)
const rememberTabInUrl = bindOption('rememberTabInUrl')
const previewOptions = Object.values(dashboardLinkPreviewOptions).map(name => ({
  name,
  label: dashboardLinkPreviewLabels[name],
  enabled: bindOption(name),
}))
</script>
