// TODO: 需要支持不同标签页互相写入
// import { defaultSettings, settingsInternalState } from './internal-state'
// import { settingsChangedHandler } from './listener'
// import { createProxy } from './proxy'
// import { Property, Settings } from './types'

// const InstanceKey = 'instance'
// export const writeSettings = (prop: Property, value: any) => {
//   if (prop === InstanceKey) {
//     return
//   }
//   const latestInstance = GM_getValue(InstanceKey)
//   if (!latestInstance) {
//     return
//   }
//   const { internalSettings } = settingsInternalState
//   const currentInstance = internalSettings[InstanceKey]
//   if (!currentInstance || latestInstance === currentInstance) {
//     return
//   }
//   try {
//     settingsInternalState.settingsLoaded = false
//     const latestValue = GM_getValue(prop.toString(), internalSettings[prop.toString()])
//     let finalValue
//     if (typeof latestValue === 'object') {
//       finalValue = lodash.defaultsDeep(latestValue, )
//     }
//   } finally {
//     settingsInternalState.settingsLoaded = true
//   }
// }
