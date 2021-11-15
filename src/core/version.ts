export enum CompareResult {
  Less = -1,
  Equal = 0,
  Greater = 1,
  Incomparable = NaN
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
        return CompareResult.Greater
      }
      if (this.parts[i] === other.parts[i]) {
        continue
      }
      if (this.parts[i] > other.parts[i]) {
        return CompareResult.Greater
      }
      return CompareResult.Less
    }
    if (this.parts.length !== other.parts.length) {
      return CompareResult.Less
    }
    return CompareResult.Equal
  }
  greaterThan(other: Version) {
    return this.compareTo(other) === CompareResult.Greater
  }
  lessThan(other: Version) {
    return this.compareTo(other) === CompareResult.Less
  }
  equals(other: Version) {
    return this.compareTo(other) === CompareResult.Equal
  }
}
