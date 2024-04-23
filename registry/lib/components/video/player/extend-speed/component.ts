import { ComponentSettings, getComponentSettings } from '@/core/settings'
import { addStyle } from '@/core/style'
import { Toast } from '@/core/toast'
import { dea, des } from '@/core/utils'
import { logError } from '@/core/utils/log'
import { ascendingSort } from '@/core/utils/sort'
import { fromEvent, PublishContext, Subject, TeardownLogic } from '../common/mini-rxjs'
import { debounceTime } from '../common/mini-rxjs/operators/debounceTime'
import { filter } from '../common/mini-rxjs/operators/filter'
import { asapScheduler, observeOn } from '../common/mini-rxjs/operators/observeOn'
import { loadStyle } from '../common/mini-rxjs/utils/loadStyle'
import {
  EntryContext,
  EntrySpeedComponent,
  MAX_BROWSER_SPEED_VALUE,
  MIN_BROWSER_SPEED_VALUE,
  NATIVE_SUPPORTED_VALUES,
} from '../common/speed'
import { PLAYER_AGENT, SpeedContext } from '../common/speed/context'
import {
  formatSpeedText,
  parseSpeedText,
  splitToSpace,
  trimLeadingDot,
} from '../common/speed/utils'
import type { Options as RememberSpeedOptions } from '../remember-speed/component'

export const EXTEND_SPEED_INPUT_CLASS_NAME = 'extend-speed-input'
export const EXTEND_SPEED_ITEM_CLASS_NAME = 'extend-speed-item'
/** 步进倍速值大小 */
export const STEP_SPEED_VALUE = 0.5
/** 错误信息持续时间（单位：毫秒） */
export const ERROR_MESSAGE_DURATION = 5000
/** 计算菜单项 order */
export const calcOrder = (value: number) => ((MAX_BROWSER_SPEED_VALUE - value) * 10000).toString()

export type Options = {
  /** 最大菜单高度 */
  maxMenuHeight: boolean
  /** 隐藏进度条 */
  hideScrollbar: boolean
  /** 隐藏移除图标 */
  hideRemoveBtn: boolean
  /** 隐藏新增图标 */
  hideAddBtn: boolean
  /** 扩展倍速列表 */
  extendSpeedList: number[]
}

/**
 * 对于源订阅对象发出的每一对前后数组，计算两个数组的差异信息，生成一个 splice 参数形式的补丁数据提交到下一个订阅对象
 *
 * 该算法来自 Neil Fraser 的 paper，只实现了最简单的预处理部分，即去除两个数组公共的前缀和后缀，然后计算差异部分
 * 这种优化力度在当前「扩展倍速」组件的实现中已经完全足够了。除非设置介于中间值的扩展倍速项，否则生成的补丁应该是最优的
 *
 * @see https://neil.fraser.name/writing/diff/
 *
 */
const diff = (previousArr: number[], currentArr: number[]): [number, number, number[]] => {
  let pStartIdx = 0
  let pEndIdx = previousArr.length
  let cStartIdx = 0
  let cEndIdx = currentArr.length

  while (
    pStartIdx < pEndIdx &&
    cStartIdx < cEndIdx &&
    previousArr[pStartIdx] === currentArr[cStartIdx]
  ) {
    pStartIdx++
    cStartIdx++
  }

  while (
    pStartIdx < pEndIdx &&
    cStartIdx < cEndIdx &&
    previousArr[pEndIdx - 1] === currentArr[cEndIdx - 1]
  ) {
    pEndIdx--
    cEndIdx--
  }

  return [pStartIdx, pEndIdx - pStartIdx, currentArr.slice(cStartIdx, cEndIdx)]
}

interface VNode<N extends Node, T = any> {
  tag?: T
  node: N
  destroy(): void
}

const $ = <E extends Record<string, Element>, R extends Element = Element>(
  html: string,
  scoped = true,
) => {
  const containerElement = document.createElement('div')
  containerElement.innerHTML = html
  const result = {}
  const root = containerElement.children.item(0)
  const walkChildren = (element: Element) => {
    if (scoped) {
      element.id = `scoped-element-${Math.random()
        .toString(36)
        .replace(/[^a-z0-9]+/g, '')}`
    }
    const dataRef = element.getAttribute('data-ref')
    if (dataRef) {
      result[lodash.camelCase(dataRef)] = element
    }
    for (let i = 0; i < element.children.length; i++) {
      walkChildren(element.children.item(i))
    }
  }
  walkChildren(root)
  return { ...result, root } as E & { root: R; [index: string]: Element }
}

export class ExtendSpeedComponent extends EntrySpeedComponent<Options> {
  protected static get activeClassName() {
    return trimLeadingDot(PLAYER_AGENT.custom.active.selector)
  }

  protected static get showClassName() {
    return trimLeadingDot(PLAYER_AGENT.custom.show.selector)
  }

  protected static get speedMenuItemClassName() {
    return trimLeadingDot(PLAYER_AGENT.custom.speedMenuItem.selector)
  }

  constructor(entryContext: EntryContext, enabled$: Subject<boolean>) {
    super(entryContext, enabled$)

    this.enabled$.subscribe(
      loadStyle({
        name: 'fix-after-element',
        style: enabled => enabled && '.bpx-player-ctrl-playbackrate-menu:after { display: none; }',
      }),
    )
  }

  addSpeedValue(value: number) {
    this.options.extendSpeedList = lodash.sortedUniq(
      this.options.extendSpeedList.concat(value).sort(ascendingSort()),
    )
  }

  removeSpeedValue(value: number) {
    this.options.extendSpeedList = lodash.without(this.options.extendSpeedList, value)
  }

  createInputElement(): VNode<HTMLLIElement> {
    const { input, root, icon } = $<{ input: HTMLInputElement; icon: HTMLElement }, HTMLLIElement>(`
      <li class="${splitToSpace(
        trimLeadingDot(PLAYER_AGENT.custom.speedMenuItem.selector),
      )} ${EXTEND_SPEED_INPUT_CLASS_NAME}">
        <i data-ref="icon" class="mdi mdi-playlist-plus" style="font-size: 1.5em"></i>
        <input data-ref="input" type="number" title="添加新的倍数值" max="${MAX_BROWSER_SPEED_VALUE}" step="${STEP_SPEED_VALUE}" style="display: none;"></input>
      </li>
    `)

    const updateRecommendedValue = () => {
      const value = this.speedContext.getAvailableSpeedValues().slice(-1)[0] + STEP_SPEED_VALUE
      const recommendedValue = lodash.toString(value > MAX_BROWSER_SPEED_VALUE ? null : value)
      input.value = recommendedValue
      input.min = recommendedValue
    }

    this.options.extendSpeedList$.pipe(observeOn(asapScheduler)).subscribe(updateRecommendedValue)

    const styleElement = addStyle(`
      #${input.id} {
        font-size: inherit;
        color: inherit;
        line-height: inherit;
        background: transparent;
        outline: none;
        width: 100%;
        border: none;
        text-align: center;
        cursor: text;
      }
      /* https://stackoverflow.com/a/4298216 */
      /* Chrome */
      #${input.id}::-webkit-outer-spin-button,
      #${input.id}::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      /* Firefox */
      #${input.id}[type=number] {
        -moz-appearance:textfield;
      }
    `)

    const destroy = lodash.over(
      fromEvent(input, 'keydown')
        .pipe<KeyboardEvent>(debounceTime(200))
        .subscribe(({ key }) => {
          if (key !== 'Enter') {
            return
          }

          const value = parseFloat(input.value)

          try {
            if (!lodash.isFinite(value)) {
              throw new Error('无效的倍数值')
            }
            if (value < MIN_BROWSER_SPEED_VALUE) {
              throw new Error('倍数值太小了')
            }
            if (value > MAX_BROWSER_SPEED_VALUE) {
              throw new Error('倍数值太大了')
            }
            if (this.speedContext.getAvailableSpeedValues().includes(value)) {
              throw new Error('不能重复添加已有的倍数值')
            }
            this.addSpeedValue(value)
          } catch (error) {
            logError(String(error), ERROR_MESSAGE_DURATION)
            input.focus()
            input.select()
          }
        }),
      fromEvent(root, 'mouseenter').subscribe(() => {
        input.style.display = 'inline'
        icon.style.display = 'none'
        updateRecommendedValue()
        setTimeout(() => input.focus())
      }),
      fromEvent(root, 'mouseleave').subscribe(() => {
        input.style.display = 'none'
        icon.style.display = 'inline'
      }),
      () => root.remove(),
      () => styleElement.remove(),
    )

    return {
      node: root,
      destroy,
    }
  }

  createCustomSpeedMenuItemElement(value: number): VNode<HTMLLIElement, number> {
    // 3.X的倍速需要通过data-value读取值并设置
    const { closeBtn, root } = $<{ closeBtn: HTMLElement }, HTMLLIElement>(`
      <li class="${splitToSpace(
        trimLeadingDot(PLAYER_AGENT.custom.speedMenuItem.selector),
      )} ${EXTEND_SPEED_ITEM_CLASS_NAME}" data-value="${value}">
        ${formatSpeedText(value)}
        <i data-ref="close-btn" class="mdi mdi-close-circle"></i>
      </li>
    `)

    const styleElement = addStyle(`
      .${EXTEND_SPEED_ITEM_CLASS_NAME} [data-ref="close-btn"] {
        color: inherit;
        opacity: 0.5;
        display: none;
        position: absolute;
        right: 4px;
      }
      :is(${PLAYER_AGENT.custom.speedMenuItem.selector}):not(${PLAYER_AGENT.custom.active.selector}):hover [data-ref="close-btn"] {
        display: inline;
      }
      .${EXTEND_SPEED_ITEM_CLASS_NAME} [data-ref="close-btn"]:hover {
        opacity: 1;
        transition: all .3s;
      }
    `)

    const destroy = lodash.over(
      fromEvent(closeBtn, 'click').subscribe(() => {
        this.removeSpeedValue(value)
      }),
      () => root.remove(),
      () => styleElement.remove(),
    )

    return {
      tag: value,
      node: root,
      destroy,
    }
  }

  protected elementMap: VNode<HTMLLIElement>[] = []
  protected inputElement: VNode<HTMLLIElement>
  protected unpatch: TeardownLogic

  protected migrate() {
    type MixedRememberSpeedOptions = Partial<RememberSpeedOptions> & {
      extendList?: number[]
      extend?: unknown
    }
    const { options } = this.settings
    const { options: rememberSpeedOptions } = getComponentSettings(
      'rememberVideoSpeed',
    ) as ComponentSettings<MixedRememberSpeedOptions>
    if (rememberSpeedOptions.extendList) {
      options.extendSpeedList = Array.from(rememberSpeedOptions.extendList as number[])
      delete rememberSpeedOptions.extendList
      delete rememberSpeedOptions.extend
      Toast.success('从「倍速记忆」组件迁移旧配置成功', '【扩展倍速】旧配置迁移完成', 8e3)
    }
  }

  getSpeedContextMixin({ menuListElement }: SpeedContext): Partial<SpeedContext> {
    return {
      query: (speed: number) =>
        des<HTMLElement>(
          // 有的时候，选择 1.0x 倍速，会错误选中 11.0x 倍速
          // 删掉 11.0x 倍速后，再选择 1.0x 倍速就没出现该问题，这是因为之前的实现使用 contains 函数判断，由于 11.0x 倍速文本包含 1.0x，所以被误判了
          // 原先使用 contains 而不直接比较的原因是，自定义的倍速菜单项，可能在创建时引入了多余的空白符，现在使用 normalize-space 代替之前的做法
          // `./*[contains(@class, "${ExtendSpeedComponent.speedMenuItemClassName}")`
          `./*[(${ExtendSpeedComponent.speedMenuItemClassName
            .split(',')
            .map(cls => `contains(@class, "${cls}")`)
            .join(' or ')})` +
            ` and not(contains(@class, "${EXTEND_SPEED_INPUT_CLASS_NAME}"))` +
            // see: https://developer.mozilla.org/en-US/docs/Web/XPath/Functions/normalize-space
            // 自定义的倍速菜单项，在创建时引入了多余的空白符，需要通过 normalize-space 函数排除掉
            ` and normalize-space()="${formatSpeedText(speed)}"]`,
          menuListElement,
        ),
    }
  }

  currentSpeedValue: number

  onSpeedContext({ menuListElementClickSpeedChange$, playbackRate$ }: SpeedContext) {
    this.options.extendSpeedList$.subscribe({
      next: extendSpeedList =>
        this.patch(
          diff(
            this.elementMap.map(e => e.tag),
            Array.from(extendSpeedList),
          ),
        ),
      complete: () => {
        this.unpatch()
      },
    })

    // 倍速菜单最大高度
    this.options.maxMenuHeight$.subscribe(
      loadStyle({
        name: 'extend-video-speed-style',
        style: maxMenuHeight => `
                  ${PLAYER_AGENT.custom.speedMenuList.selector} {
                    display: flex !important; /* 防止3.X样式覆盖 */
                    flex-direction: column;
                    overflow-y: auto;
                    max-height: ${maxMenuHeight}px;
                    visibility: hidden;
                  }
                  /* 修复2.X倍速列表显示问题 */
                  :is(${PLAYER_AGENT.custom.show.selector}) :is(${PLAYER_AGENT.custom.speedMenuList.selector}){
                    visibility: visible;
                  }
                  /* 修复番剧区的列表显示问题 */
                  :is(${PLAYER_AGENT.custom.speedMenuList.selector})[style*="block"] {
                    visibility: visible;
                  }`,
      }),
    )

    this.options.hideScrollbar$.subscribe(
      loadStyle({
        name: 'extend-video-speed-no-scrollbar-style',
        style: hideScrollbar =>
          hideScrollbar &&
          `
                ${PLAYER_AGENT.custom.speedMenuList.selector} {
                  scrollbar-width: none !important;
                  overscroll-behavior: contain;
                }
                :is(${PLAYER_AGENT.custom.speedMenuList.selector})::-webkit-scrollbar {
                    height: 0 !important;
                    width: 0 !important;
                }`,
      }),
    )

    this.options.hideRemoveBtn$.subscribe(
      loadStyle({
        name: 'extend-video-speed-no-remove-btn-style',
        style: hideRemoveBtn =>
          hideRemoveBtn &&
          `
            .${EXTEND_SPEED_ITEM_CLASS_NAME} [data-ref="close-btn"] {
              display: none !important;
            }
            :is(${PLAYER_AGENT.custom.speedMenuItem.selector}):not(${PLAYER_AGENT.custom.active.selector}):hover [data-ref="close-btn"] {
              display: none !important;
            }`,
      }),
    )

    this.options.hideAddBtn$.subscribe(
      loadStyle({
        name: 'extend-video-speed-no-add-btn-style',
        style: hideAddBtn =>
          hideAddBtn &&
          `
          .${EXTEND_SPEED_INPUT_CLASS_NAME} {
              display: none !important;
            }`,
      }),
    )

    let nativeSpeedValue = 1

    playbackRate$
      .pipe(filter(value => NATIVE_SUPPORTED_VALUES.includes(value)))
      .subscribe(value => {
        nativeSpeedValue = value
      })

    menuListElementClickSpeedChange$.subscribe({
      next: value => {
        this.forceVideoSpeedWithUpdateStyle(value)
        this.currentSpeedValue = value
      },
      complete: () => {
        // 并不能指望 setVideoSpeed 正常工作，但是模拟点击仍然可能引发一些副作用，所以还是需要调用它...
        this.setVideoSpeed(nativeSpeedValue)
        this.forceVideoSpeedWithUpdateStyle(nativeSpeedValue)
      },
    })

    this.currentSpeedValue &&
      requestIdleCallback(() => {
        this.setVideoSpeed(this.currentSpeedValue, 1000)
      })
  }

  protected async forceVideoSpeedWithUpdateStyle(value: number) {
    await this.forceVideoSpeed(value)
    // 番剧类的视频的激活 class 居然是按子元素顺序修改的，只能步其后尘再强制改一次了
    setTimeout(() => this.forceUpdateStyle(value))
  }

  protected readonly filterNativeSpeed =
    () =>
    ({ subscribe, next }: PublishContext<number>) => {
      subscribe(currentSpeed => {
        if (NATIVE_SUPPORTED_VALUES.includes(currentSpeed)) {
          next(currentSpeed)
        }
      })
    }

  protected patch(params: [number, number, number[]]) {
    const [start, deleteCount, added] = params
    const { menuListElement } = this.speedContext
    if (!this.inputElement) {
      this.inputElement = this.createInputElement()
      menuListElement.prepend(this.inputElement.node)
    }

    if (deleteCount === 0 && added.length === 0) {
      return
    }

    const addedElements = added.map(v => this.createCustomSpeedMenuItemElement(v))

    const deleted = this.elementMap.splice(start, deleteCount, ...addedElements)

    deleted.forEach(vnode => {
      vnode.destroy()
    })
    ;(this.elementMap[start - 1] || this.inputElement).node.after(
      ...addedElements.map(el => el.node).reverse(),
    )

    // 为所有倍速菜单项刷新 Order
    menuListElement
      .querySelectorAll(
        `:is(${PLAYER_AGENT.custom.speedMenuItem.selector}):not(#${this.inputElement.node.id})`,
      )
      .forEach((it: HTMLLIElement) => {
        it.style.order = calcOrder(parseSpeedText(it.innerHTML))
      })

    this.unpatch = () => {
      this.inputElement.destroy()
      this.inputElement = undefined
      this.elementMap.forEach(vnode => vnode.destroy())
      this.elementMap.length = 0
    }
  }

  protected forceUpdateStyle(value: number) {
    const {
      menuListElement,
      containerElement,
      nameBtnElement,
      query: querySpeedMenuItemElement,
    } = this.speedContext
    // 移除所有激活态的菜单项
    for (const element of dea(
      `./*[(${trimLeadingDot(ExtendSpeedComponent.speedMenuItemClassName)
        .split(',')
        .map(cls => `contains(@class, "${cls}")`)
        .join(' or ')})` +
        ' and ' +
        `(${trimLeadingDot(ExtendSpeedComponent.activeClassName)
          .split(',')
          .map(cls => `contains(@class, "${cls}")`)
          .join(' or ')})]`,
      menuListElement,
    ) as Iterable<HTMLElement>) {
      element.classList.remove(...ExtendSpeedComponent.activeClassName.split(','))
    }
    // 对于被强制更新的菜单项，添加激活态的类名
    querySpeedMenuItemElement(value).classList.add(
      ...ExtendSpeedComponent.activeClassName.split(','),
    )
    // 关闭菜单
    containerElement.classList.remove(...ExtendSpeedComponent.showClassName.split(','))
    // 更新倍速菜单按钮文本
    nameBtnElement.innerText = formatSpeedText(value, true)
  }
}
