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
export type PluginDataProvider<D extends unknown[] = unknown[]> = (
  ...data: D
) => void | Promise<void>

class PluginData<D extends unknown[] = unknown[]> {
  private data: D | null = null
  private unusedProviders: PluginDataProvider<D>[] = []

  setDataIfNot(...data: D): boolean {
    if (this.data) {
      return false
    }
    this.data = data
    return true
  }

  pushProvider(...providers: PluginDataProvider<D>[]) {
    this.unusedProviders.push(...providers)
  }

  /**
   * 应用所有未应用的 provider，并返回 data
   *
   * 该方法是不安全的，调用者应该保证 data 已经被设置过。
   *
   * @returns 被 provider 更改的 data
   */
  getDataUnchecked(): D {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.unusedProviders.forEach(provider => provider(...this.data!))
    this.unusedProviders = []
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.data!
  }

  /**
   * 应用所有未应用的 provider，并返回 data
   * @returns 被 provider 更改的 data。如果没有设置过 data，则返回 null
   */
  getData(): D | null {
    const { data } = this
    if (data !== null) {
      return this.getDataUnchecked()
    }
    return null
  }
}

const pluginDataMap = new (class PluginDataMap {
  private map: Map<string, PluginData> = new Map()

  /**
   * 应用所有未应用的 provider，并返回 data
   *
   * 该方法是不安全的，调用者应该保证 data 已经被设置过。
   *
   * @returns 被 provider 更改的 data
   */
  getDataUnchecked<D extends unknown[]>(key: string): D {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.map.get(key)!.getDataUnchecked() as D
  }

  /**
   * 应用所有未应用的 provider，并返回 data
   * @returns 被 provider 更改的 data。如果没有设置过 data，则返回 null
   */
  getData<D extends unknown[]>(key: string): D | null {
    const data = this.map.get(key)
    if (data) {
      return data.getData() as D | null
    }
    return null
  }

  setDataIfNot(key: string, ...data: unknown[]): boolean {
    const pluginData = this.getOrSetNew(key)
    return pluginData.setDataIfNot(...data)
  }

  pushProvider(key: string, ...providers: PluginDataProvider[]) {
    const pluginData = this.getOrSetNew(key)
    pluginData.pushProvider(...providers)
  }

  /**
   * 获取或创建一个新的 `PluginData`
   *
   * 新 `PluginData` 的创建方式是 `new PluginData()`
   *
   * @param key 数据的 key
   * @private 已存在的或新创建的 `PluginData`
   */
  private getOrSetNew(key: string): PluginData {
    let pluginData = this.map.get(key)
    if (!pluginData) {
      pluginData = new PluginData()
      this.map.set(key, pluginData)
    }
    return pluginData
  }
})()

/**
 * 注册数据, 允许其他代码修改数据
 * @param key 数据的唯一标识
 * @param data 提供的一系列数据对象。会作为参数应用到每个 {@link PluginDataProvider} 上
 */
export const registerData = (key: string, ...data: unknown[]) => {
  pluginDataMap.setDataIfNot(key, ...data)
}

/**
 * 为 `key` 所标识的对象添加 provider
 * @param key 数据的唯一标识
 * @param provider 用于修改数据的回调函数
 */
export const addData = (key: string, provider: PluginDataProvider) => {
  pluginDataMap.pushProvider(key, provider)
}

/**
 * 在注册的数据上应用未使用的 provider，并返回对象自身
 * @param key 数据的唯一标识
 * @return 被更改后的数据。若数据尚未被注册，则返回空数组
 */
export const getData = <D extends unknown[]>(key: string): D | [] => (
  pluginDataMap.getData<D>(key) ?? []
)

/**
 * 注册并获取数据（{@link registerData} + {@link getData}）
 * @param key 数据的唯一标识
 * @param data 提供数据对象。将会应用到未使用的 provider
 * @return 被更改后的数据
 */
export const registerAndGetData = <D extends unknown[]>(
  key: string,
  ...data: D
): D => {
  pluginDataMap.setDataIfNot(key, ...data)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return pluginDataMap.getDataUnchecked<D>(key)!
}
