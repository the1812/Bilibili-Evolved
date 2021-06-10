// export class Range<T = number> {
//   includeStart = true
//   includeEnd = false
//   compareTarget: (item: T) => any = it => it
//   constructor(
//     public readonly start: T,
//     public readonly end: T,
//   ) {
//     if (this.compareTarget(this.start) > this.compareTarget(this.end)) {
//       [this.start, this.end] = [this.end, this.start]
//     }
//   }
//   isInside(value: T) {
//     const start = this.compareTarget(this.start)
//     const end = this.compareTarget(this.end)
//     return value >= start
//       && (!this.includeStart && start !== value)
//       && value <= end
//       && (!this.includeEnd && end !== value)
//   }
// }
export interface Range<T = number> {
  start: T
  end: T
}
