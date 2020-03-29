export interface ReorderItemSnapshot {
  element: HTMLElement
  rect: DOMRect
}
export interface ReorderOrientation {
  name: string
  getMoveTransform: (xOffset: number, yOffset: number) => string
  setOtherTransform: (snapshots: ReorderItemSnapshot[], currentElement: HTMLElement, xOffset: number, yOffset: number) => void
}
export const ReorderOrientations: { [key: string]: ReorderOrientation } = {
  horizontal: {
    name: 'horizontal',
    getMoveTransform: (xOffset, yOffset) => {
      return `translateX(${xOffset}px)`
    },
    setOtherTransform: _.throttle((snapshots: ReorderItemSnapshot[], currentElement, xOffset, yOffset) => {
      if (!currentElement.classList.contains(Reorder.ReorderingClassName)) {
        return
      }
      const currentSnapshot = snapshots.find(s => s.element === currentElement)
      if (!currentSnapshot) {
        return
      }
      const currentRect = currentSnapshot.rect
      const leftSide = snapshots
        .filter(s => s.rect.left < currentRect.left)
        .sort((a, b) => {
          return b.rect.left - a.rect.left
        })
      const rightSide = snapshots
        .filter(s => s.rect.left > currentRect.left)
        .sort((a, b) => {
          return a.rect.left - b.rect.left
        })
      if (xOffset >= 0) {
        const [firstSnapshot] = rightSide
        leftSide.forEach(snapshot => {
          snapshot.element.style.transform = ''
          snapshot.element.classList.remove(Reorder.ReorderIncreaseClassName)
        })
        rightSide.forEach((snapshot) => {
          if (currentRect.left + xOffset + currentRect.width >= snapshot.rect.left + snapshot.rect.width / 2) {
            snapshot.element.classList.add(Reorder.ReorderDecreaseClassName)
            snapshot.element.style.transform = `translateX(-${firstSnapshot.rect.left - currentRect.left}px)`
          } else {
            snapshot.element.classList.remove(Reorder.ReorderDecreaseClassName)
            snapshot.element.style.transform = ''
          }
        })
      } else {
        const [firstSnapshot] = leftSide
        rightSide.forEach(snapshot => {
          snapshot.element.style.transform = ''
          snapshot.element.classList.remove(Reorder.ReorderDecreaseClassName)
        })
        leftSide.forEach((snapshot) => {
          if (currentRect.left + xOffset <= snapshot.rect.left + snapshot.rect.width / 2) {
            snapshot.element.classList.add(Reorder.ReorderIncreaseClassName)
            snapshot.element.style.transform = `translateX(${currentRect.left + currentRect.width - firstSnapshot.rect.left - firstSnapshot.rect.width}px)`
          } else {
            snapshot.element.classList.remove(Reorder.ReorderIncreaseClassName)
            snapshot.element.style.transform = ''
          }
        })
      }
    }, 50),
    // getFinalTransform: (changedSnapshots, currentSnapshot) => {
    //   if (changedSnapshots.length == 0) {
    //     return
    //   }
    //   const xOffset = parseFloat(currentSnapshot.element.style.transform.match(/translateX\((.+)px\)/)[1])
    //   if (isNaN(xOffset)) {
    //     return ''
    //   }
    //   const [firstSnapshot] = changedSnapshots
    //   const space = firstSnapshot.rect.left - currentSnapshot.rect.left - currentSnapshot.rect.width
    //   return `translateX(${xOffset - (changedSnapshots.reduce((a, c) => a + c.rect.width, 0) + space) * changedSnapshots.length}px)`
    // },
  },
  vertical: {
    name: 'vertical',
    getMoveTransform: (xOffset, yOffset) => {
      return `translateY(${yOffset}px)`
    },
    setOtherTransform: _.throttle((snapshots: ReorderItemSnapshot[], currentElement, xOffset, yOffset) => {
      if (!currentElement.classList.contains(Reorder.ReorderingClassName)) {
        return
      }
      const currentSnapshot = snapshots.find(s => s.element === currentElement)
      if (!currentSnapshot) {
        return
      }
      const currentRect = currentSnapshot.rect
      const upperSide = snapshots
        .filter(s => s.rect.top < currentRect.top)
        .sort((a, b) => {
          return b.rect.top - a.rect.top
        })
      const lowerSide = snapshots
        .filter(s => s.rect.top > currentRect.top)
        .sort((a, b) => {
          return a.rect.top - b.rect.top
        })
      if (yOffset >= 0) {
        const [firstSnapshot] = lowerSide
        upperSide.forEach(snapshot => {
          snapshot.element.style.transform = ''
          snapshot.element.classList.remove(Reorder.ReorderIncreaseClassName)
        })
        lowerSide.forEach(snapshot => {
          if (currentRect.top + yOffset + currentRect.height >= snapshot.rect.top + snapshot.rect.height / 2) {
            snapshot.element.classList.add(Reorder.ReorderDecreaseClassName)
            snapshot.element.style.transform = `translateY(-${firstSnapshot.rect.top - currentRect.top}px)`
          } else {
            snapshot.element.classList.remove(Reorder.ReorderDecreaseClassName)
            snapshot.element.style.transform = ''
          }
        })
      } else {
        const [firstSnapshot] = upperSide
        lowerSide.forEach(snapshot => {
          snapshot.element.style.transform = ''
          snapshot.element.classList.remove(Reorder.ReorderDecreaseClassName)
        })
        upperSide.forEach(snapshot => {
          if (currentRect.top + yOffset <= snapshot.rect.top + snapshot.rect.height / 2) {
            snapshot.element.classList.add(Reorder.ReorderIncreaseClassName)
            snapshot.element.style.transform = `translateY(${currentRect.top + currentRect.height - firstSnapshot.rect.top - firstSnapshot.rect.height}px)`
          } else {
            snapshot.element.classList.remove(Reorder.ReorderIncreaseClassName)
            snapshot.element.style.transform = ''
          }
        })
      }
    }, 50),
    // getFinalTransform: (changedSnapshots, currentSnapshot) => {
    //   return ''
    // },
  },
}
export class Reorder extends EventTarget {
  orientation = ReorderOrientations.horizontal
  enabled = false
  public static readonly ReorderDecreaseClassName = 'reorder-decrease'
  public static readonly ReorderIncreaseClassName = 'reorder-increase'
  public static readonly ReorderEnabledClassName = 'reorder-enabled'
  public static readonly ReorderingClassName = 'reordering'
  private children: HTMLElement[]
  private snapshots: Map<HTMLElement, ReorderItemSnapshot> = new Map()
  private attachedEvents: (() => void)[] = []
  constructor(public container: HTMLElement) {
    super()
    this.children = [...this.container.children] as HTMLElement[];
    if (this.children.every(e => e.style.order === '')) {
      this.children.forEach((e, i) => {
        e.style.order = (i + 1).toString()
      })
    }
  }
  addEventListener(type: 'reorder', listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
    super.addEventListener(type, listener, options)
  }
  removeEventListener(type: 'reorder', callback: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) {
    super.addEventListener(type, callback, options)
  }
  getOrderMap() {
    return new Map(this.children.map(e => {
      return [e, parseInt(e.style.order!)]
    }) as [HTMLElement, number][])
  }
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
  enable() {
    this.children.forEach(element => {
      let xInit = 0
      let yInit = 0
      let reordering = false
      element.classList.add(Reorder.ReorderEnabledClassName)
      const handleDown = () => {
        const down = (x: number, y: number) => {
          element.classList.add(Reorder.ReorderingClassName)
          element.style.transition = 'none'
          element.style.userSelect = 'none'
          this.generateSnapshots()
          this.children.filter(e => e !== element).forEach(e => e.style.transition = 'transform .2s ease-out')
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
          this.orientation.setOtherTransform([...this.snapshots.values()], element, xOffset, yOffset)
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
          element.classList.remove(Reorder.ReorderingClassName)
          reordering = false
          let orderOffset = 0
          const other = this.children.filter(e => e !== element)
          const changedSnapshots: ReorderItemSnapshot[] = []
          other.forEach(e => {
            e.style.transform = ''
            e.style.transition = ''
            if (e.classList.contains(Reorder.ReorderIncreaseClassName)) {
              orderOffset--
              e.style.order = (parseInt(e.style.order!) + 1).toString()
              e.classList.remove(Reorder.ReorderIncreaseClassName)
              changedSnapshots.push(this.snapshots.get(e)!)
            } else if (e.classList.contains(Reorder.ReorderDecreaseClassName)) {
              orderOffset++
              e.style.order = (parseInt(e.style.order!) - 1).toString()
              e.classList.remove(Reorder.ReorderDecreaseClassName)
              changedSnapshots.push(this.snapshots.get(e)!)
            }
          })
          element.style.userSelect = ''
          element.style.order = (parseInt(element.style.order!) + orderOffset).toString()
          element.style.transform = ''
          element.style.transition = ''
          this.dispatchEvent(new CustomEvent('reorder', {
            detail: this.children.map(c => {
              return {
                element: c,
                order: parseInt(c.style.order!)
              }
            })
          }))
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
  disable() {
    this.attachedEvents.forEach(remove => remove())
    this.children.forEach(e => e.classList.remove(Reorder.ReorderEnabledClassName))
    this.enabled = false
  }
}