export class FocusTarget extends EventTarget {
  /**
   * -1: Input Focus
   * > -1: Item Focus
   */
  private itemIndex = -1
  private itemLength = 0

  constructor(length: number, index = -1) {
    super()
    this.itemLength = length
    this.index = index
  }

  get index() {
    return this.itemIndex
  }
  private set index(value: number) {
    const newIndex = lodash.clamp(value, -1, this.itemLength - 1)
    if (this.itemIndex !== newIndex) {
      this.itemIndex = newIndex
      this.dispatchEvent(new CustomEvent('index-change', { detail: this }))
    }
  }
  get hasFocus() {
    return this.itemIndex > -1
  }

  setFocus(index: number) {
    this.index = index
  }
  reset(length: number, index = this.index) {
    this.itemLength = length
    this.index = index
  }
  next() {
    this.index += 1
    console.log(this.index)
  }
  previous() {
    this.index -= 1
    console.log(this.index)
  }
}
