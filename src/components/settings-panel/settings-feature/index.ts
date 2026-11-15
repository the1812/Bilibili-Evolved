import { computed, ref } from 'vue'
import { isUserPlugin } from '@/core/settings'
import { plugins } from '@/plugins/plugin'
import { styles } from '@/plugins/style'
import { components } from '../../component'
import { getSettingsTags } from '../tag-filter'
import type { SettingsFeature } from './base'
import { ComponentSettingsFeature } from './component'
import { PluginSettingsFeature } from './plugin'
import { StyleSettingsFeature } from './style'

export { SettingsFeature } from './base'
export { ComponentSettingsFeature, PluginSettingsFeature, StyleSettingsFeature }
export type { RelatedSettingsFeature, SettingsFeatureTarget } from './types'

export const useSettingsFeatures = () => {
  const allComponents = ref(components)
  const allPlugins = ref(plugins)
  const allStyles = ref(styles)
  const visibleComponents = computed(() =>
    allComponents.value.filter(component => !component.hidden),
  )
  const features = computed<SettingsFeature[]>(() => [
    ...visibleComponents.value.map(component => new ComponentSettingsFeature(component)),
    ...allPlugins.value.filter(isUserPlugin).map(plugin => new PluginSettingsFeature(plugin)),
    ...allStyles.value.map(style => new StyleSettingsFeature(style)),
  ])
  const tags = computed(() =>
    getSettingsTags(features.value, {
      components: allComponents.value,
      renderedComponents: visibleComponents.value,
    }),
  )
  return { features, tags }
}
