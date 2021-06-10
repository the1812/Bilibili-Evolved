import { Version, CompareResult } from '@/core/version'
import { expect } from 'chai'

describe('Version compare', () => {
  const version = new Version('1.7.3')
  it('greater', () => {
    const greater = new Version('1.11.9')
    expect(greater.compareTo(version)).equal(CompareResult.greater)
  })
  it('equal', () => {
    expect(version.compareTo(version)).equal(CompareResult.equal)
  })
  it('less', () => {
    const less = new Version('1.7.2')
    expect(less.compareTo(version)).equal(CompareResult.less)
  })
})
