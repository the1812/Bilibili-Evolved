import { fixed, matchPattern } from '@/core/utils'
import { formatCount } from '@/core/utils/formatters'
import { expect } from 'chai'

describe('Utils API', () => {
  it('formatters', () => {
    expect(formatCount(0.1)).equal('0.1')
    expect(formatCount(-0.1)).equal('-0.1')
    expect(formatCount(10)).equal('10')
    expect(formatCount(10000)).equal('1万')
    expect(formatCount(12340)).equal('1.2万')
    expect(formatCount(1.45e8)).equal('1.5亿')
    expect(formatCount(1000e8)).equal('1000亿')
    expect(formatCount(1, 2)).equal('01')
    expect(formatCount(100, 5)).equal('00100')
  })
  it('fixed', () => {
    const v1Fixed = (number: number, precision = 1) => {
      const str = number.toString()
      const index = str.indexOf('.')
      if (index !== -1) {
        if (str.length - index > precision + 1) {
          return str.substring(0, index + precision + 1)
        }
        return str
      }
      return `${str}.0`
    }
    [0, 0.4, 0.5, 0.9, 1, 1.1].forEach(num => {
      expect(fixed(num), num.toString()).equal(v1Fixed(num))
    });
    [0.4567, 1.8976, 2.2134, 3.5555].forEach(num => {
      expect(fixed(num, 2), num.toString()).equal(v1Fixed(num, 2))
    })
    expect(fixed(1, 3)).equal('1.000')
    expect(fixed(1.1, 3)).equal('1.100')
    expect(fixed(1.12, 3)).equal('1.120');
    // v1 fixed() 的bug: 无论精度多少, 添加0的时候都只添加一个
    [0, 1.2, 1.12].forEach(num => {
      expect(fixed(num, 3), num.toString()).not.equal(v1Fixed(num, 3))
    })
  })
  it('matchPattern', () => {
    const str = 'https://www.bilibili.com/video/av85179902';
    ['bilibili', '/video/', 'https://www', /^https:\/\/www/, /av(\d+)$/].forEach(p => {
      expect(matchPattern(str, p), p.toString()).true
    })
  })
})
