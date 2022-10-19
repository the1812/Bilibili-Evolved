export const ReorderDecreaseClassName = 'reorder-decrease'
export const ReorderIncreaseClassName = 'reorder-increase'
export const ReorderEnabledClassName = 'reorder-enabled'
export const ReorderingClassName = 'reordering'

/** 表示重排列事件的监听函数 */
export type ReorderEventHandler = (
  event: CustomEvent<
    {
      element: HTMLElement
      order: number
    }[]
  >,
) => void
/** 表示重排列项目的一个状态(位置信息) */
export interface ReorderItemSnapshot {
  /** 元素 */
  element: HTMLElement
  /** 元素定位矩形 */
  rect: DOMRect
}
/** 表示重排列方向 */
export interface ReorderOrientation {
  /** 名称 */
  name: string
  /** 计算被排列元素的`transform` */
  getMoveTransform: (xOffset: number, yOffset: number) => string
  /** 设置其他元素的`transform` */
  setOtherTransform: (
    snapshots: ReorderItemSnapshot[],
    currentElement: HTMLElement,
    xOffset: number,
    yOffset: number,
  ) => void
}
/** 支持的重排列方向 */
export const ReorderOrientations: { [key: string]: ReorderOrientation } = {
  /** 横向 */
  horizontal: {
    name: 'horizontal',
    getMoveTransform: xOffset => `translateX(${xOffset}px)`,
    setOtherTransform: lodash.throttle(
      (snapshots: ReorderItemSnapshot[], currentElement, xOffset) => {
        if (!currentElement.classList.contains(ReorderingClassName)) {
          return
        }
        const currentSnapshot = snapshots.find(s => s.element === currentElement)
        if (!currentSnapshot) {
          return
        }
        const currentRect = currentSnapshot.rect
        const leftSide = snapshots
          .filter(s => s.rect.left < currentRect.left)
          .sort((a, b) => b.rect.left - a.rect.left)
        const rightSide = snapshots
          .filter(s => s.rect.left > currentRect.left)
          .sort((a, b) => a.rect.left - b.rect.left)
        if (xOffset >= 0) {
          const [firstSnapshot] = rightSide
          leftSide.forEach(snapshot => {
            snapshot.element.style.transform = ''
            snapshot.element.classList.remove(ReorderIncreaseClassName)
          })
          rightSide.forEach(snapshot => {
            if (
              currentRect.left + xOffset + currentRect.width >=
              snapshot.rect.left + snapshot.rect.width / 2
            ) {
              snapshot.element.classList.add(ReorderDecreaseClassName)
              snapshot.element.style.transform = `translateX(-${
                firstSnapshot.rect.left - currentRect.left
              }px)`
            } else {
              snapshot.element.classList.remove(ReorderDecreaseClassName)
              snapshot.element.style.transform = ''
            }
          })
        } else {
          const [firstSnapshot] = leftSide
          rightSide.forEach(snapshot => {
            snapshot.element.style.transform = ''
            snapshot.element.classList.remove(ReorderDecreaseClassName)
          })
          leftSide.forEach(snapshot => {
            if (currentRect.left + xOffset <= snapshot.rect.left + snapshot.rect.width / 2) {
              snapshot.element.classList.add(ReorderIncreaseClassName)
              snapshot.element.style.transform = `translateX(${
                currentRect.left +
                currentRect.width -
                firstSnapshot.rect.left -
                firstSnapshot.rect.width
              }px)`
            } else {
              snapshot.element.classList.remove(ReorderIncreaseClassName)
              snapshot.element.style.transform = ''
            }
          })
        }
      },
      50,
    ),
  },
  /** 纵向 */
  vertical: {
    name: 'vertical',
    getMoveTransform: (xOffset, yOffset) => `translateY(${yOffset}px)`,
    setOtherTransform: lodash.throttle(
      (snapshots: ReorderItemSnapshot[], currentElement, xOffset, yOffset) => {
        if (!currentElement.classList.contains(ReorderingClassName)) {
          return
        }
        const currentSnapshot = snapshots.find(s => s.element === currentElement)
        if (!currentSnapshot) {
          return
        }
        const currentRect = currentSnapshot.rect
        const upperSide = snapshots
          .filter(s => s.rect.top < currentRect.top)
          .sort((a, b) => b.rect.top - a.rect.top)
        const lowerSide = snapshots
          .filter(s => s.rect.top > currentRect.top)
          .sort((a, b) => a.rect.top - b.rect.top)
        if (yOffset >= 0) {
          const [firstSnapshot] = lowerSide
          upperSide.forEach(snapshot => {
            snapshot.element.style.transform = ''
            snapshot.element.classList.remove(ReorderIncreaseClassName)
          })
          lowerSide.forEach(snapshot => {
            if (
              currentRect.top + yOffset + currentRect.height >=
              snapshot.rect.top + snapshot.rect.height / 2
            ) {
              snapshot.element.classList.add(ReorderDecreaseClassName)
              snapshot.element.style.transform = `translateY(-${
                firstSnapshot.rect.top - currentRect.top
              }px)`
            } else {
              snapshot.element.classList.remove(ReorderDecreaseClassName)
              snapshot.element.style.transform = ''
            }
          })
        } else {
          const [firstSnapshot] = upperSide
          lowerSide.forEach(snapshot => {
            snapshot.element.style.transform = ''
            snapshot.element.classList.remove(ReorderDecreaseClassName)
          })
          upperSide.forEach(snapshot => {
            if (currentRect.top + yOffset <= snapshot.rect.top + snapshot.rect.height / 2) {
              snapshot.element.classList.add(ReorderIncreaseClassName)
              snapshot.element.style.transform = `translateY(${
                currentRect.top +
                currentRect.height -
                firstSnapshot.rect.top -
                firstSnapshot.rect.height
              }px)`
            } else {
              snapshot.element.classList.remove(ReorderIncreaseClassName)
              snapshot.element.style.transform = ''
            }
          })
        }
      },
      50,
    ),
    // getFinalTransform: (changedSnapshots, currentSnapshot) => {
    //   return ''
    // },
  },
}
/** 为一排元素启用重排列支持 */
export class Reorder extends EventTarget {
  /** 排列方向, 默认为横向 */
  orientation = ReorderOrientations.horizontal
  /** 是否处于重排列状态(激活状态) */
  enabled = false
  private children: HTMLElement[]
  private snapshots: Map<HTMLElement, ReorderItemSnapshot> = new Map()
  private attachedEvents: (() => void)[] = []
  /**
   * 为指定容器元素中的子元素启用重排列支持
   * @param container 容器元素
   */
  constructor(public container: HTMLElement) {
    super()
    this.children = [...this.container.children] as HTMLElement[]
    if (this.children.every(e => e.style.order === '')) {
      this.children.forEach((e, i) => {
        e.style.order = (i + 1).toString()
      })
    }
  }
  addEventListener(
    type: 'reorder',
    listener: ReorderEventHandler,
    options?: boolean | AddEventListenerOptions,
  ) {
    super.addEventListener(type, listener, options)
  }
  removeEventListener(
    type: 'reorder',
    callback: ReorderEventHandler,
    options?: boolean | EventListenerOptions,
  ) {
    super.addEventListener(type, callback, options)
  }
  /** 获取各元素的`order`映射 */
  getOrderMap() {
    return new Map(this.children.map(e => [e, parseInt(e.style.order)]) as [HTMLElement, number][])
  }
  /** 切换开启状态 */
  toggle() {
    if (this.enabled) {
      this.disable()
    } else {
      this.enable()
    }
  }
  private generateSnapshots() {
    this.children.forEach(element => {
      this.snapshots.set(element, {
        element,
        rect: element.getBoundingClientRect() as DOMRect,
      })
    })
  }
  /** 启用重排列 */
  enable() {
    this.children.forEach(element => {
      let xInit = 0
      let yInit = 0
      let reordering = false
      element.classList.add(ReorderEnabledClassName)
      const handleDown = () => {
        const down = (x: number, y: number) => {
          element.classList.add(ReorderingClassName)
          element.style.transition = 'none'
          element.style.userSelect = 'none'
          this.generateSnapshots()
          this.children
            .filter(e => e !== element)
            .forEach(e => {
              e.style.transition = 'transform .2s ease-out'
            })
          xInit = x
          yInit = y
          reordering = true
        }
        const mousedown = (e: MouseEvent) => {
          down(e.screenX, e.screenY)
        }
        element.addEventListener('mousedown', mousedown)
        this.attachedEvents.push(() => element.removeEventListener('mousedown', mousedown))
        const touchstart = (e: TouchEvent) => {
          if (e.touches.length !== 1) {
            return
          }
          const [touch] = e.touches
          down(touch.screenX, touch.screenY)
        }
        element.addEventListener('touchstart', touchstart)
        this.attachedEvents.push(() => element.removeEventListener('touchstart', touchstart))
      }
      const handleMove = () => {
        const move = (x: number, y: number) => {
          const xOffset = x - xInit
          const yOffset = y - yInit
          element.style.transform = this.orientation.getMoveTransform(xOffset, yOffset)
          this.orientation.setOtherTransform(
            [...this.snapshots.values()],
            element,
            xOffset,
            yOffset,
          )
        }
        const mousemove = (e: MouseEvent) => {
          if (!reordering) {
            return
          }
          move(e.screenX, e.screenY)
          if (e.cancelable) {
            e.preventDefault()
          }
        }
        document.addEventListener('mousemove', mousemove)
        this.attachedEvents.push(() => document.removeEventListener('mousemove', mousemove))
        const touchmove = (e: TouchEvent) => {
          if (!reordering) {
            return
          }
          if (e.touches.length !== 1) {
            return
          }
          const [touch] = e.touches
          move(touch.screenX, touch.screenY)
          if (e.cancelable) {
            e.preventDefault()
          }
        }
        element.addEventListener('touchmove', touchmove, { passive: false })
        this.attachedEvents.push(() => element.removeEventListener('touchmove', touchmove))
      }
      const handleUp = () => {
        const up = () => {
          if (!reordering) {
            return
          }
          element.classList.remove(ReorderingClassName)
          reordering = false
          let orderOffset = 0
          const other = this.children.filter(e => e !== element)
          const changedSnapshots: ReorderItemSnapshot[] = []
          other.forEach(e => {
            e.style.transform = ''
            e.style.transition = ''
            if (e.classList.contains(ReorderIncreaseClassName)) {
              orderOffset--
              e.style.order = (parseInt(e.style.order) + 1).toString()
              e.classList.remove(ReorderIncreaseClassName)
              changedSnapshots.push(this.snapshots.get(e))
            } else if (e.classList.contains(ReorderDecreaseClassName)) {
              orderOffset++
              e.style.order = (parseInt(e.style.order) - 1).toString()
              e.classList.remove(ReorderDecreaseClassName)
              changedSnapshots.push(this.snapshots.get(e))
            }
          })
          element.style.userSelect = ''
          element.style.order = (parseInt(element.style.order) + orderOffset).toString()
          element.style.transform = ''
          element.style.transition = ''
          this.dispatchEvent(
            new CustomEvent('reorder', {
              detail: this.children.map(c => ({
                element: c,
                order: parseInt(c.style.order),
              })),
            }),
          )
          // setTimeout(() => element.style.transition = '', 200);
          // setTimeout(() => {
          //   other.forEach(e => {
          //     e.style.transition = ''
          //   })
          // }, 1000);
        }
        document.addEventListener('mouseup', up)
        this.attachedEvents.push(() => document.removeEventListener('mouseup', up))
        element.addEventListener('touchend', up)
        this.attachedEvents.push(() => element.removeEventListener('touchend', up))
      }
      handleDown()
      handleMove()
      handleUp()
    })
    this.enabled = true
  }
  /** 禁用重排列 */
  disable() {
    this.attachedEvents.forEach(remove => remove())
    this.children.forEach(e => e.classList.remove(ReorderEnabledClassName))
    this.enabled = false
  }
}
