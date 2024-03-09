import { playerAgent } from '@/components/video/player-agent'
import { LifeCycleEventTypes } from '@/core/life-cycle'
import { videoChange } from '@/core/observer'
import { des } from '@/core/utils'
import { ascendingSort } from '@/core/utils/sort'
import { bindCallback, concat, firstValueFrom, fromEvent, of, subject, Subject } from '../mini-rxjs'
import { bufferSet } from '../mini-rxjs/operators/bufferSet'
import { combineLatest } from '../mini-rxjs/operators/combineLatest'
import { debounceTime } from '../mini-rxjs/operators/debounceTime'
import { distinctUntilChanged } from '../mini-rxjs/operators/distinctUntilChanged'
import { filter } from '../mini-rxjs/operators/filter'
import { map } from '../mini-rxjs/operators/map'
import { pairwise } from '../mini-rxjs/operators/pairwise'
import { startWith } from '../mini-rxjs/operators/startWith'
import type { EntrySpeedComponent } from '../speed'
import { convertToXPath, formatSpeedText, parseSpeedText, useShare } from './utils'

export const PLAYER_AGENT = playerAgent.provideCustomQuery({
  video: {
    speedMenuList: '.bilibili-player-video-btn-speed-menu, .bpx-player-ctrl-playbackrate-menu',
    speedMenuItem:
      '.bilibili-player-video-btn-speed-menu-list, .bpx-player-ctrl-playbackrate-menu-item',
    speedNameBtn: '.bilibili-player-video-btn-speed-name, .bpx-player-ctrl-playbackrate-result',
    speedContainer: '.bilibili-player-video-btn-speed, .bpx-player-ctrl-playbackrate',
    active: '.bilibili-player-active, .bpx-state-active',
    show: '.bilibili-player-speed-show, .bpx-state-show',
  },
  bangumi: {
    speedMenuList: '.squirtle-speed-select-list, .bpx-player-ctrl-playbackrate-menu',
    speedMenuItem: '.squirtle-select-item, .bpx-player-ctrl-playbackrate-menu-item',
    speedNameBtn: '.squirtle-speed-select-result, .bpx-player-ctrl-playbackrate-result',
    speedContainer: '.squirtle-speed-wrap, .bpx-player-ctrl-playbackrate',
    active: '.active, .bpx-state-active',
    // bangumi 那边没有这种 class, 随便填一个就行了
    show: '.bilibili-player-speed-show, .bpx-state-show',
  },
})

export type VideoIdObject = { aid: string; cid: string }

export enum SpeedSeekPosition {
  MIN,
  CURRENT,
  MAX,
}

export interface SpeedContext {
  readonly videoChange$: Subject<VideoIdObject>
  readonly speedContext$: Subject<SpeedContext>
  readonly videoIdObject: VideoIdObject
  readonly containerElement: HTMLElement
  readonly videoElement: HTMLVideoElement
  readonly nameBtnElement: HTMLElement
  readonly menuListElement: HTMLElement
  readonly activeVideoSpeed$: Subject<number>
  readonly playbackRate$: Subject<number>
  readonly playbackRateChange$: Subject<number>
  readonly menuListElementClickSpeed$: Subject<number>
  readonly menuListElementClickSpeedChange$: Subject<number>
  readonly videoSpeedChange$: Subject<number>
  readonly menuListElementMutations$: Subject<{
    attributes: MutationRecord[]
    childList: MutationRecord[]
  }>

  getAvailableSpeedValues(): number[]
  getActiveVideoSpeed(): number
  getOldActiveVideoSpeed(): number | undefined
  getOldPlaybackRate(): number | undefined

  query(speed: number): HTMLElement | null
  /**
   * 通过模拟点击倍速菜单项来设置倍速
   *
   * 若指定的倍速值不在倍速菜单里，或等待倍速菜单就绪后，最终设定的倍速值与指定的倍速值不相符，则会抛出异常
   *
   * @param value 欲设置的倍速值
   */
  set(value: number, timeout?: number): Promise<void>
  /**
   * 强行设置倍速
   *
   * 通过 {@link set} 或 {@link toggle} 方法设置的倍速，可能会因为指定的倍速值不在倍速菜单里而失败，如果想要强行设置倍速值，就需要使用此方法
   *
   * 【注意】谨慎使用此方法，这个方法不会更新倍速菜单的状态，有可能造成状态不一致的现象，而且还可能会影响上次倍速值，从而出现一些其他的副作用
   */
  force(value: number): Promise<void>
  /** 重置倍速为 1.0x */
  reset(): Promise<void>
  /**
   * 切换倍速
   *
   * 默认情况下，如果当前倍速不是 1.0x，则切换到 1.0x（即重置当前视频倍速），否则切换到上次倍速
   *
   * @param legacy 传统方式：无论当前倍速如何，均切换到上次倍速
   */
  toggle(legacy?: boolean): Promise<void>
  /**
   * 切换倍速
   *
   * 类似文件系统 API 提供的 `seek` 函数，将倍速菜单被视作可寻址的地址空间，想象一个「指针」指向当前激活的倍速菜单项，
   * 「指针」每次移动后所指向的倍速菜单项就成为新的被激活的倍速菜单项，通过给定参照和偏移量移动「指针」，就完成了切换倍速的操作.
   *
   * @param offset 「指针」偏移量
   * @param whence 可选，默认为当前倍速菜单项，给 offset 一个参照，表示从何处开始偏移量的计算
   */
  toggle(offset: number, whence?: SpeedSeekPosition): Promise<void>
  /**
   * 提高倍速
   *
   * 类似于：
   *
   * ```
   * toggle(1, SpeedSeekPosition.CURRENT)
   * ```
   *
   * 与之不同的是，如果当前倍速已经是倍速菜单里最高的倍速，不会产生作用，也不会抛出异常
   */
  increase(): Promise<void>
  /**
   * 降低倍速
   *
   * 类似于：
   *
   * ```
   * toggle(-1, SpeedSeekPosition.CURRENT)
   * ```
   *
   * 与之不同的是，如果当前倍速已经是倍速菜单里最低的倍速，不会产生作用，也不会抛出异常
   */
  decrease(): Promise<void>
}

export interface DisposableSpeedContext extends SpeedContext {
  dispose(): void
}

const useMutationObserver = (
  target: Node,
  mutationInit: MutationObserverInit,
  callback: MutationCallback,
) => {
  const observer = new MutationObserver(callback)
  observer.observe(target, mutationInit)
  return observer
}

const buildElementPart = ([containerElement, videoElement]: [
  HTMLElement | null,
  HTMLVideoElement | null,
]) => {
  if (!containerElement) {
    throw new Error('speed container element not found!')
  }
  if (!videoElement) {
    throw new Error('video element not found!')
  }

  const nameBtnElement = containerElement.querySelector(
    PLAYER_AGENT.custom.speedNameBtn.selector,
  ) as HTMLButtonElement
  const menuListElement = containerElement.querySelector(
    PLAYER_AGENT.custom.speedMenuList.selector,
  ) as HTMLElement

  const query = (speed: number) =>
    des<HTMLElement | null>(
      `./*[(${convertToXPath(PLAYER_AGENT.custom.speedMenuItem.selector)})` +
        // 以前实现功能时发现一个 BUG，在用户点击 1.0x 倍速后，却错误选中 11.0x 倍速
        // 删掉 11.0x 倍速后，再选择 1.0x 倍速就没不会产生此问题，这是因为之前的实现使用 contains 函数判断，由于 11.0x 倍速文本包含 1.0x，所以被误判了
        // 原先使用 contains 而不直接比较的原因是，自定义的倍速菜单项，可能在创建时引入了多余的空白符，现在使用 normalize-space 代替之前的做法
        // see: https://developer.mozilla.org/en-US/docs/Web/XPath/Functions/normalize-space
        // 自定义的倍速菜单项，在创建时引入了多余的空白符，需要通过 normalize-space 函数排除掉
        ` and normalize-space()="${formatSpeedText(speed)}"]`,
      menuListElement,
    )

  let activeVideoSpeed: number
  let oldActiveVideoSpeed: number
  let availableSpeedValues: number[]
  const menuListElementMutations$ = subject()
  const activeVideoSpeed$ = subject<number>().pipe(distinctUntilChanged())

  activeVideoSpeed$
    .pipe<[number, number]>(startWith(undefined), pairwise())
    .subscribe(([oldValue, newValue]) => {
      oldActiveVideoSpeed = oldValue
      activeVideoSpeed = newValue
    })

  const updateActiveVideoSpeed = (target?: HTMLElement | CharacterData) => {
    if (!target) {
      return
    }
    switch (target.nodeType) {
      case Node.TEXT_NODE:
        activeVideoSpeed$.next(parseSpeedText((target as CharacterData).data))
        break
      case Node.ELEMENT_NODE:
        activeVideoSpeed$.next(parseSpeedText((target as HTMLElement).innerHTML))
        break
      default:
        console.warn(
          'The target parameter of updateActiveVideoSpeed must be a Node, and the node type must be one of TEXT_NODE and ELEMENT_NODE',
        )
        break
    }
  }

  const updateAvailableSpeedValues = () => {
    availableSpeedValues = lodash([...menuListElement.children])
      .map(element => lodash.attempt(() => parseSpeedText(element.textContent)))
      .reject(speed => lodash.isError(speed))
      .sort(ascendingSort())
      .value() as number[]
  }

  // 初始更新
  updateActiveVideoSpeed(nameBtnElement)
  updateAvailableSpeedValues()

  const menuListElementObserver = useMutationObserver(
    menuListElement,
    { childList: true, attributes: true },
    mutations => {
      const { attributes = [], childList = [] } = lodash.groupBy(mutations, 'type')
      if (childList.length) {
        updateAvailableSpeedValues()
      }
      menuListElementMutations$.next({ attributes, childList })
    },
  )

  const nameBtnElementObserver = useMutationObserver(
    nameBtnElement,
    { childList: true, subtree: true },
    mutations => {
      mutations.forEach(mutation => {
        const [newTextNode] = mutation.addedNodes
        updateActiveVideoSpeed(newTextNode as HTMLElement | CharacterData)
      })
    },
  )

  const dispose = () => {
    menuListElementObserver.disconnect()
    nameBtnElementObserver.disconnect()
  }

  return {
    containerElement,
    videoElement,
    nameBtnElement,
    menuListElement,
    query,
    dispose,
    activeVideoSpeed$,
    menuListElementMutations$,
    getActiveVideoSpeed: () => activeVideoSpeed,
    getOldActiveVideoSpeed: () => oldActiveVideoSpeed,
    getAvailableSpeedValues: () => availableSpeedValues,
  }
}

const buildSubjectPart = (elementContext: ReturnType<typeof buildElementPart>) => {
  const { videoElement, menuListElement } = elementContext

  const menuListElementClickSpeed$ = fromEvent(menuListElement, 'click').pipe<number>(
    map(ev => {
      const { innerText, innerHTML } = ev.target as HTMLLIElement
      const speedText = innerText.trim() || innerHTML.trim()
      return lodash.attempt(() => parseSpeedText(speedText))
    }),
    filter(value => !lodash.isError(value)),
  )
  const playbackRate$ = subject(({ next }) => {
    // 沿着 videoElement 的原型链一路向上找，直到找到 hasOwnProperty playbackRate 的 prototype 或者 null
    let proto: { playbackRate: number } = videoElement

    do {
      proto = Object.getPrototypeOf(proto)
    } while (proto === null || !Object.prototype.hasOwnProperty.call(proto, 'playbackRate'))

    const descriptor = Object.getOwnPropertyDescriptor(proto, 'playbackRate')

    Object.defineProperty(proto, 'playbackRate', {
      set(v) {
        descriptor.set.call(this, v)
        next(v)
      },
    })

    return () => {
      Object.defineProperty(proto, 'playbackRate', descriptor)
    }
  })
  const menuListElementClickSpeedChange$ = menuListElementClickSpeed$.pipe(distinctUntilChanged())
  const playbackRateChange$ = playbackRate$.pipe(distinctUntilChanged())

  const videoSpeedChange$ = subject(({ next }) => {
    const temp$ = combineLatest(menuListElementClickSpeedChange$, playbackRateChange$)
    temp$.subscribe(([userSpeed, currentSpeed]) => {
      if (userSpeed === currentSpeed) {
        next(currentSpeed)
      }
    })
    return () => temp$.complete()
  }).pipe(distinctUntilChanged())

  let oldPlaybackRate: number

  playbackRateChange$
    .pipe<[number, number]>(debounceTime(200), startWith(undefined), pairwise())
    .subscribe(([oldValue]) => {
      oldPlaybackRate = oldValue
    })

  const subjects = {
    menuListElementClickSpeed$,
    menuListElementClickSpeedChange$,
    playbackRate$,
    playbackRateChange$,
    videoSpeedChange$,
  }

  const dispose = () => {
    lodash.values(subjects).forEach(subject$ => {
      subject$.complete()
    })
    elementContext.dispose()
  }

  return {
    ...elementContext,
    ...subjects,
    dispose,
    getOldPlaybackRate: () => oldPlaybackRate,
  }
}

export const [NoSuchSpeedMenuItemElementError] = useShare(
  'speed.NoSuchSpeedMenuItemElementError',
  () =>
    class InnerNoSuchSpeedMenuItemElementError extends Error {
      readonly formattedSpeed: string
      constructor(readonly speed: number) {
        const formattedSpeedMaybeError = lodash.attempt(() => formatSpeedText(speed))
        const formattedSpeed = lodash.isError(formattedSpeedMaybeError)
          ? String(speed)
          : String(formattedSpeedMaybeError)
        super(`There is no such speed menu item as ${formattedSpeed}`)
        this.formattedSpeed = formattedSpeed
      }
    },
)

const buildMethodPart = (speedContext: ReturnType<typeof buildSubjectPart>) => {
  const {
    query,
    videoElement,
    videoSpeedChange$,
    getOldActiveVideoSpeed,
    getAvailableSpeedValues,
    getActiveVideoSpeed,
  } = speedContext

  const set = async (value: number, timeoutArg = 200) => {
    const speedMenuItemElement = query(value)

    if (speedMenuItemElement == null) {
      throw new NoSuchSpeedMenuItemElementError(value)
    }

    speedMenuItemElement.click()

    const check = result => {
      if ((result ?? videoElement.playbackRate) !== value) {
        throw new Error(`failed to set ${formatSpeedText(value)} video speed.`)
      }
    }

    const promises = [
      firstValueFrom(videoSpeedChange$.pipe(debounceTime(Math.max(0, timeoutArg || 0)))),
    ]

    if (timeoutArg > 0) {
      promises.push(
        new Promise((resolve, reject) => setTimeout(() => setTimeout(reject, timeoutArg))),
      )
    }

    await Promise.all(promises).then(check).catch(check)
  }

  const force = async (value: number) => {
    videoElement.playbackRate = value
  }

  const reset = async () => {
    await set(1)
  }

  const toggle = async (legacyOrOffset?: boolean | number, whence?: SpeedSeekPosition) => {
    if (lodash.isNil(legacyOrOffset)) {
      legacyOrOffset = false
    }

    if (typeof legacyOrOffset === 'boolean') {
      if (!legacyOrOffset && videoElement.playbackRate !== 1) {
        await reset()
      } else {
        await set(getOldActiveVideoSpeed())
      }
    } else {
      const availableSpeedValues = getAvailableSpeedValues()
      switch (whence) {
        case SpeedSeekPosition.MIN:
          await set(availableSpeedValues[legacyOrOffset])
          break
        case SpeedSeekPosition.MAX:
          await set(availableSpeedValues[availableSpeedValues.length - 1 + legacyOrOffset])
          break
        case SpeedSeekPosition.CURRENT:
        default:
          {
            const index = availableSpeedValues.indexOf(getActiveVideoSpeed())
            if (index === -1) {
              throw new Error(
                'Unexpected Error: The available speed values do not include the active speed value, this should be a bug, please report the issue on github!',
              )
            }
            await set(availableSpeedValues[index + legacyOrOffset])
          }
          break
      }
    }
  }

  const step = async (direction: number) => {
    try {
      await toggle(direction, SpeedSeekPosition.CURRENT)
    } catch (error) {
      console.warn(error)
      if (!(error instanceof NoSuchSpeedMenuItemElementError)) {
        throw error
      }
    }
  }

  const increase = async () => {
    await step(1)
  }

  const decrease = async () => {
    await step(-1)
  }

  return Object.assign(speedContext, {
    set,
    force,
    reset,
    toggle,
    step,
    increase,
    decrease,
  })
}

const useShareSpeedContext = () => useShare<DisposableSpeedContext>('speed.speedContext')

export const useShareBuildArgument$ = () =>
  useShare<Subject<unknown>>('speed.buildArguments$', () =>
    subject().pipe(bufferSet((component: EntrySpeedComponent) => component.settings.enabled)),
  )

export const getSpeedContext = async (
  build: (args) => (context: DisposableSpeedContext) => DisposableSpeedContext = lodash.identity,
) => {
  const [speedContext, setSpeedContext] = useShareSpeedContext()

  if (speedContext) {
    return speedContext
  }

  let resolveBuildPromise
  let rejectBuildPromise

  const [lifeCycleComponentLoaded$] = useShare('lifeCycleComponentLoaded$', () =>
    fromEvent(unsafeWindow, LifeCycleEventTypes.ComponentsLoaded),
  )
  const [shareBuildArgument$] = useShareBuildArgument$()
  const [videoChange$] = useShare('speed.videoChange$', () =>
    bindCallback<VideoIdObject>(videoChange).pipe(filter(({ aid, cid }) => aid || cid)),
  )
  const [speedContext$] = useShare('speed.speedContext$', () =>
    subject<DisposableSpeedContext>(({ next }) =>
      combineLatest(
        videoChange$,
        concat(of([]), shareBuildArgument$),
        lifeCycleComponentLoaded$,
      ).subscribe(([videoIdObject, shareBuildArgument]) => {
        const [oldSpeedContext] = useShareSpeedContext()
        oldSpeedContext?.dispose()
        rejectBuildPromise?.('context update')

        const buildPromise = new Promise((resolve, reject) => {
          resolveBuildPromise = resolve
          rejectBuildPromise = reject
        })

        Promise.all([
          Promise.all([
            PLAYER_AGENT.custom.speedContainer() as Promise<HTMLElement | null>,
            PLAYER_AGENT.query.video.element() as Promise<HTMLVideoElement | null>,
          ]).then(resolveBuildPromise),
          buildPromise,
        ])
          .then(([, elements]) => elements)
          .then(buildElementPart)
          .then(buildSubjectPart)
          .then(buildMethodPart)
          .then(context =>
            Object.assign(context, {
              videoIdObject,
              speedContext$,
              videoChange$,
            }),
          )
          .then(build(shareBuildArgument))
          .then(next)
          .catch(err => console.error(err))
      }),
    ),
  )

  speedContext$.subscribe(setSpeedContext)

  return firstValueFrom(speedContext$)
}
