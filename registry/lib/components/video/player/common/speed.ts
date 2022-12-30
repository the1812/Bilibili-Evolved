import {
  ComponentEntry,
  ComponentMetadata,
  OptionMetadata,
  UnknownOptions,
} from '@/components/types'
import { CoreApis } from '@/core/core-apis'
import { addComponentListener, ComponentSettings } from '@/core/settings'
import { logError } from '@/core/utils/log'
import { getHook } from '@/plugins/hook'
import { bindCallback, Subject, subject, TeardownLogic } from './mini-rxjs'
import { distinctUntilChanged } from './mini-rxjs/operators/distinctUntilChanged'
import {
  getSpeedContext,
  SpeedContext,
  SpeedSeekPosition,
  useShareBuildArgument$,
} from './speed/context'

export type VideoIdObject = { aid: string; cid: string }

/** 原生支持的倍速值 */
export const NATIVE_SUPPORTED_VALUES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
/** 浏览器支持设定的最小倍速值 */
export const MIN_BROWSER_SPEED_VALUE = 0.0625
/** 浏览器支持设定的最大倍速值 */
export const MAX_BROWSER_SPEED_VALUE = 16

export type EntryContext = Parameters<ComponentEntry>[0]

export type OptionSubjects<O> = O & { [K in keyof O as `${Exclude<K, symbol>}$`]: Subject<O[K]> }

export class EntrySpeedComponent<O extends UnknownOptions = UnknownOptions>
  implements EntryContext
{
  static create: <OO extends Record<string, any> = unknown>(
    metadata: Omit<ComponentMetadata, 'entry' | 'reload' | 'unload' | 'options'> & {
      options?: { [K in keyof OO]: OptionMetadata }
    },
  ) => ComponentMetadata

  static contextMap: Partial<Record<keyof EntrySpeedComponent, keyof SpeedContext | string>> = {
    getVideoIdObject: 'videoIdObject',
    getAvailableSpeedValues: 'getAvailableSpeedValues',
    getOldActiveVideoSpeed: 'getOldActiveVideoSpeed',
    getVideoSpeed: 'videoElement.playbackRate',
    setVideoSpeed: 'set',
    forceVideoSpeed: 'force',
    resetVideoSpeed: 'reset',
    toggleVideoSpeed: 'toggle',
    increaseVideoSpeed: 'increase',
    decreaseVideoSpeed: 'decrease',
  }

  constructor(
    protected readonly entryContext: EntryContext,
    protected readonly enabled$: Subject<boolean>,
  ) {
    lodash.assign(this, entryContext, {
      options: entryContext.settings.options,
    })

    // 执行迁移操作
    this.migrate?.()

    lodash.assign(
      this,
      lodash.mapValues(EntrySpeedComponent.contextMap, path => async (...args) => {
        // 这里调用 getSpeedContext 不是第一次调用，因此拿到的一定是缓存
        // 无需传递 build 参数
        const context = await getSpeedContext()
        const value = lodash.get(context, path) as any
        const result = lodash.isFunction(value) ? await value(...args) : value
        return result
      }),
    )
  }

  speedContext?: SpeedContext
  settings: ComponentSettings<O>
  coreApis: CoreApis
  metadata: ComponentMetadata
  options: OptionSubjects<O>
  readonly getVideoIdObject: () => Promise<VideoIdObject>
  readonly getAvailableSpeedValues: () => Promise<number[]>
  readonly getOldActiveVideoSpeed: () => Promise<number | undefined>
  readonly forceVideoSpeed: (value: number) => Promise<void>
  readonly getVideoSpeed: () => Promise<number>
  readonly setVideoSpeed: (value: number, timeout?: number) => Promise<void>
  readonly resetVideoSpeed: () => Promise<void>
  readonly toggleVideoSpeed: (
    legacy?: boolean,
  ) => Promise<void> | ((offset: number, whence?: SpeedSeekPosition) => Promise<void>)
  readonly increaseVideoSpeed: () => Promise<void>
  readonly decreaseVideoSpeed: () => Promise<void>

  getSpeedContextMixin?(context: SpeedContext): Partial<SpeedContext>
  onSpeedContext?(context: SpeedContext): TeardownLogic | any
  protected migrate?(): void
}

getSpeedContext((components: EntrySpeedComponent[]) => disposableSpeedContext => {
  const safeContext = lodash.omit(disposableSpeedContext, 'dispose')

  const mixins = components.map(component => component.getSpeedContextMixin(safeContext))

  if (mixins.length > 1) {
    // 检查是否有重复覆盖的字段
    const repeatedKeys = lodash.intersection(...mixins.map(Object.keys))

    if (repeatedKeys.length) {
      throw new Error(
        'In the registered speed component, there is an implementation of getSpeedContextMixin that causes the speed context to be mixed in ambiguous.\n' +
          `The repeated key names are ${repeatedKeys.join(', ')}`,
      )
    }
  }

  // 混入
  lodash.assign(safeContext, ...mixins)

  const allOptions$: Subject<unknown>[] = []

  components.forEach(component => {
    const options$ = lodash(component.settings.options)
      .mapValues((_, optionName) =>
        bindCallback(addComponentListener, `${component.metadata.name}.${optionName}`).pipe(
          distinctUntilChanged(),
        ),
      )
      .mapKeys((_, optionName) => `${optionName}$`)
      .value()

    allOptions$.push(...lodash.values(options$))

    // 重新生成 options 代理对象
    component.options = new Proxy<OptionSubjects<unknown>>(component.settings.options, {
      get: (target, p, receiver) => {
        if (lodash.isSymbol(p)) {
          return Reflect.get(target, p, receiver)
        }
        if (!Reflect.has(target, p) && p.endsWith('$')) {
          return options$[p]
        }
        return Reflect.get(target, p, receiver)
      },
    })

    component.speedContext = safeContext
    component.onSpeedContext(safeContext)

    if (!component.settings.enabled) {
      return
    }

    // 通知一下组件的选项值
    lodash(options$)
      .entries()
      .forEach(([optionName, optionValue$]: [string, Subject<unknown>]) => {
        optionValue$.next(component.settings.options[optionName.slice(0, -1)])
      })
  })

  return {
    ...safeContext,
    dispose: () => {
      allOptions$.forEach(option$ => option$.complete())
      disposableSpeedContext.dispose()
    },
  }
})

// 不知道为啥，Webpack 会用 EntrySpeedComponent 直接替换类内定义的静态函数中的 this
// 这将导致 create 函数无法正常工作，因此只能在类外定义
// 这样做也不是没有缺点，typescript 会认为此函数不是 EntrySpeedComponent 的一部分，对于 EntrySpeedComponent 静态成员的访问受限
EntrySpeedComponent.create = function create(metadata) {
  const enabled$ = subject<boolean>().pipe(distinctUntilChanged())

  return {
    ...metadata,
    entry: (entryContext: EntryContext) => {
      const component: EntrySpeedComponent | Error = lodash.attempt(
        () => new this(entryContext, enabled$),
      )

      if (component instanceof Error) {
        logError(component)
        return null
      }

      const [shareBuildArgument$] = useShareBuildArgument$()

      enabled$.subscribe(() => {
        shareBuildArgument$.next(component)
      })

      enabled$.next(true)

      getHook(`speed.component.${metadata.name}`).after(component)

      return component
    },
    reload: () => enabled$.next(true),
    unload: () => enabled$.next(false),
  }
}
