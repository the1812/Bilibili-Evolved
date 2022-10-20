/**
 * 数据注入 API
 * @module plugins/data
 *
 * 各个组件或插件可以通过该 API 进行数据通信。
 * 要进行通信，需要数据接收方准备一个或多个接受更改的对象给数据提供方。
 * 数据提供方通过修改这些对象本身来提供数据。双方通过一个唯一的 key 来标识数据。
 *
 * 接收方通过 {@link registerData} 注册一个或多个接受更改的对象，
 * 并通过 {@link getData} 获取被更改的对象。
 * 提供方通过 {@link addData} 提供 {@link PluginDataProvider} 来修改上述对象。
 *
 * 数据接收方需要手动保证 `registerData` 在 `getData` 之前调用，
 * 否则 `getData` 只会返回空数组。
 *
 * `registerData` 只应被调用一次，多余的调用会被直接忽略。
 *
 * `addData` 在 `registerData` 之前或之后调用都是允许的。
 * 不论是在之前还是在之后调用，其提供的 provider 都会被正确应用到已注册的或即将注册的数据上。
 *
 * 提供方提供方提供的 provider 不会被立即应用，而是被存储起来，在 `getData` 时一次性应用。
 * 已经应用过的 provider 会被立刻丢弃，因此每个 provider 最多只会被执行一次。
 */

/** 执行数据注入, 参数将由插件注册者提供 */
export type PluginDataProvider = (...args: any[]) => void | Promise<void>
const pluginDataMap = new Map<
  string,
  {
    /** 是否被注册过 ({@link registerData} / {@link registerAndGetData}) */
    registered: boolean
    /** 数据内容 */
    data: any[]
    /** 是否被加载过 ({@link getData} / {@link registerAndGetData}) */
    loaded: boolean
    /** 在被加载前储存的 provider (惰性求值) */
    providers: PluginDataProvider[]
  }
>()

/**
 * 注册数据, 允许其他代码修改数据
 * @param key 数据的唯一标识
 * @param data 提供的一系列数据对象。会作为参数应用到每个 {@link PluginDataProvider} 上
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
 * 为 `key` 所标识的对象添加 provider
 * @param key 数据的唯一标识
 * @param provider 用于修改数据的回调函数
 */
export const addData = (key: string, provider: PluginDataProvider) => {
  if (pluginDataMap.has(key)) {
    const { providers, loaded, data } = pluginDataMap.get(key)
    if (loaded) {
      provider(...data)
    } else {
      providers.push(provider)
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
 * 在注册的数据上应用未使用的 provider，并返回对象自身
 * @param key 数据的唯一标识
 * @returns 被更改后的数据。若数据尚未被注册，则返回空数组
 */
export const getData = (key: string) => {
  if (pluginDataMap.has(key)) {
    const item = pluginDataMap.get(key)
    const { data, registered, loaded, providers } = item
    if (registered) {
      if (!loaded) {
        providers.forEach(p => p(...data))
        item.providers = []
        item.loaded = true
      }
      return data
    }
  }
  return []
}

/**
 * 注册并获取数据（{@link registerData} + {@link getData}）
 * @param key 数据的唯一标识
 * @param data 提供数据对象。将会应用到未使用的 provider
 * @returns 被更改后的数据
 */
export const registerAndGetData = <T extends any[]>(key: string, ...data: T) => {
  registerData(key, ...data)
  return getData(key) as T
}
