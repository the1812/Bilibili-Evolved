/*
  This is an ESM version of [Magic Grid](https://github.com/e-oj/Magic-Grid)
  Modified by Grant Howard
*/

/**
 * @author emmanuelolaojo
 * @since 11/11/18
 */

/**
 * Validates the configuration object.
 *
 * @param config - configuration object
 */
const checkParams = function (config) {
  const DEFAULT_GUTTER = 25

  if (!config) {
    throw new Error('No config object has been provided.')
  }

  if (typeof config.useTransform !== 'boolean') {
    config.useTransform = true
  }

  if (typeof config.gutter !== 'number') {
    config.gutter = DEFAULT_GUTTER
  }

  if (!config.container) { error('container') }
  if (!config.items && !config.static) { error('items or static') }
}

/**
 * Handles invalid configuration object
 * errors.
 *
 * @param prop - a property with a missing value
 */
const error = function (prop) {
  throw new Error(("Missing property '" + prop + "' in MagicGrid config"))
}

/**
 * Finds the shortest column in
 * a column list.
 *
 * @param cols - list of columns
 *
 * @return shortest column
 */
const getMin = function (cols) {
  let min = cols[0]

  for (const col of cols) {
    if (col.height < min.height) { min = col }
  }

  return min
}

/**
 * @author emmanuelolaojo
 * @since 11/10/18
 *
 * The MagicGrid class is an
 * implementation of a flexible
 * grid layout.
 */

export class MagicGrid {
  constructor (config) {
    checkParams(config)

    if (config.container instanceof HTMLElement) {
      this.container = config.container
      this.containerClass = config.container.className
    } else {
      this.containerClass = config.container
      this.container = document.querySelector(config.container)
    }

    this.items = this.container.children
    this.static = config.static || false
    this.size = config.items
    this.gutter = config.gutter
    this.maxColumns = config.maxColumns || false
    this.useMin = config.useMin || false
    this.useTransform = config.useTransform
    this.animate = config.animate || false
    this.started = false

    this.init()
  }
  /**
   * Initializes styles
   *
   * @private
   */
  init () {
    if (!this.ready() || this.started) { return }

    this.container.style.position = 'relative'

    for (let i = 0; i < this.items.length; i++) {
      const style = this.items[i].style

      style.position = 'absolute'

      if (this.animate) {
        style.transition = (this.useTransform ? 'transform' : 'top, left') + ' 0.2s ease'
      }
    }

    this.started = true
  }
  /**
   * Calculates the width of a column.
   *
   * @return width of a column in the grid
   * @private
   */
  colWidth () {
    return this.items[0].getBoundingClientRect().width + this.gutter
  }

  /**
   * Initializes an array of empty columns
   * and calculates the leftover whitespace.
   *
   * @return {{cols: Array, wSpace: number}}
   * @private
   */
  setup () {
    const width = this.container.getBoundingClientRect().width
    const colWidth = this.colWidth()
    let numCols = Math.floor(width / colWidth) || 1
    const cols = []

    if (this.maxColumns && numCols > this.maxColumns) {
      numCols = this.maxColumns
    }

    for (let i = 0; i < numCols; i++) {
      cols[i] = { height: 0, index: i }
    }

    const wSpace = width - numCols * colWidth + this.gutter

    return { cols, wSpace }
  }

  /**
   * Gets the next available column.
   *
   * @param cols list of columns
   * @param i index of dom element
   *
   * @return {*} next available column
   * @private
   */
  nextCol (cols, i) {
    if (this.useMin) {
      return getMin(cols)
    }

    return cols[i % cols.length]
  }

  /**
   * Positions each item in the grid, based
   * on their corresponding column's height
   * and index then stretches the container to
   * the height of the grid.
   */
  positionItems () {
    const ref = this.setup()
    const cols = ref.cols
    let wSpace = ref.wSpace
    let maxHeight = 0
    const colWidth = this.colWidth()

    wSpace = Math.floor(wSpace / 2)

    for (let i = 0; i < this.items.length; i++) {
      const col = this.nextCol(cols, i)
      const item = this.items[i]
      const topGutter = col.height ? this.gutter : 0
      const left = col.index * colWidth + wSpace + 'px'
      const top = col.height + topGutter + 'px'

      if (this.useTransform) {
        item.style.transform = 'translate(' + left + ', ' + top + ')'
      } else {
        item.style.top = top
        item.style.left = left
      }

      col.height += item.getBoundingClientRect().height + topGutter

      if (col.height > maxHeight) {
        maxHeight = col.height
      }
    }

    this.container.style.height = maxHeight + 'px'
  }

  /**
   * Checks if every item has been loaded
   * in the dom.
   *
   * @return {Boolean} true if every item is present
   */
  ready () {
    if (this.static) { return true }
    return this.items.length >= this.size
  }

  /**
   * Periodically checks that all items
   * have been loaded in the dom. Calls
   * this.listen() once all the items are
   * present.
   *
   * @private
   */
  getReady () {
    const interval = setInterval(() => {
      this.container = document.querySelector(this.containerClass)
      this.items = this.container.children

      if (this.ready()) {
        clearInterval(interval)

        this.init()
        this.listen()
      }
    }, 100)
  }

  /**
   * Positions all the items and
   * repositions them whenever the
   * window size changes.
   */
  listen () {
    if (this.ready()) {
      let timeout
      window.addEventListener('resize', () => {
        if (!timeout) {
          timeout = setTimeout(() => {
            this.positionItems()
            timeout = null
          }, 200)
        }
      })

      this.positionItems()
    } else { this.getReady() }
  }
}

export default {
  export: {
    MagicGrid
  }
}
