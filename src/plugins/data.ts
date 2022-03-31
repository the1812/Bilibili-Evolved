// /** 数据注入 */
// export interface PluginDataProvider {
//   /** 执行数据注入, 参数将由插件注册者提供 */
//   insertData: (...args: any[]) => void | Promise<void>
// }
/** 执行数据注入, 参数将由插件注册者提供 */
export type PluginDataProvider = (...args: any[]) => void | Promise<void>
const pluginDataMap = new Map<string, {
  registered: boolean
  data: any[]
  loaded: boolean
  providers: PluginDataProvider[]
}>()

/**
 * 注册数据, 允许其他代码向其中添加数据
 * @param key 标识ID
 * @param data 提供的数据对象, 注入者将把数据添加到其中
 */
export const registerData = (key: string, ...data: any[]) => {
  if (pluginDataMap.has(key)) {
    const item = pluginDataMap.get(key)
    const { registered } = item
    if (registered) {
      return
    }
    item.registered = true
    item.data = data
  } else {
    pluginDataMap.set(key, {
      registered: true,
      data,
      loaded: false,
      providers: [],
    })
  }
}
/**
 * 向由`key`指定的对象注入数据
 * @param key 标识ID
 * @param provider 数据注入的配置对象
 */
export const addData = (key: string, provider: PluginDataProvider) => {
  if (pluginDataMap.has(key)) {
    const { providers, loaded, data } = pluginDataMap.get(key)
    providers.push(provider)
    if (loaded) {
      provider(...data)
    }
  } else {
    pluginDataMap.set(key, {
      registered: false,
      data: [],
      loaded: false,
      providers: [provider],
    })
  }
}
/**
 * 从由`key`指定的对象获取数据, 未注册时返回空数组
 * @param key 标识ID
 */
export const getData = (key: string) => {
  if (pluginDataMap.has(key)) {
    const item = pluginDataMap.get(key)
    const {
      data, registered, loaded, providers,
    } = item
    if (registered) {
      if (!loaded) {
        providers.forEach(p => p(...data))
        item.loaded = true
      }
      return data
    }
  }
  return []
}

/**
 * 注册并获取数据 (`registerData`+`getData`)
 * @param key 标识ID
 * @param data 提供的数据对象, 注入者将把数据添加到其中
 */
export const registerAndGetData = <T extends any[]> (key: string, ...data: T) => {
  registerData(key, ...data)
  return getData(key) as T
}
