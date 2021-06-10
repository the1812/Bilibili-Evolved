export enum CompareResult {
  less = -1,
  equal = 0,
  greater = 1,
  incomparable = NaN
}
export class Version {
  parts: number[]
  constructor(public versionString: string) {
    if (!/^[\d\.]+$/.test(versionString)) {
      throw new Error('Invalid version string')
    }
    this.parts = versionString.split('.').map(it => parseInt(it))
  }
  compareTo(other: Version) {
    for (let i = 0; i < this.parts.length; ++i) {
      if (other.parts.length === i) {
        return CompareResult.greater
      }
      if (this.parts[i] === other.parts[i]) {
        continue
      }
      if (this.parts[i] > other.parts[i]) {
        return CompareResult.greater
      }
      return CompareResult.less
    }
    if (this.parts.length !== other.parts.length) {
      return CompareResult.less
    }
    return CompareResult.equal
  }
  greaterThan(other: Version) {
    return this.compareTo(other) === CompareResult.greater
  }
  lessThan(other: Version) {
    return this.compareTo(other) === CompareResult.less
  }
  equals(other: Version) {
    return this.compareTo(other) === CompareResult.equal
  }
}
