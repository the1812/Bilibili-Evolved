import { expect } from 'chai'
import {
  SpinQueryConfig, sq, count, select, selectAll,
} from '@/core/spin-query'

describe('SpinQuery', () => {
  const config: SpinQueryConfig = {
    maxRetry: 5,
    queryInterval: 1,
  }
  it('condition query', async () => {
    const testObj = {
      a: 1,
    }
    setTimeout(() => (testObj.a = 2), 3)
    const result = await sq(() => testObj, o => o.a === 2, config)
    expect(result).not.null
    expect(result).property('a').equal(2)
  })
  it('condition failing', async () => {
    const testObj = {
      a: 1,
    }
    const result = await sq(() => testObj, o => o.a === 2, config)
    expect(result).to.be.null
  })
  it('stop', async () => {
    const testObj = {
      a: 1,
    }
    setTimeout(() => (testObj.a = 2), 3)
    const result = await sq(() => testObj, (o, stop) => {
      if (o.a === 3) {
        return true
      } if (o.a === 2) {
        stop()
      }
      return false
    }, config)
    expect(result).not.null
    expect(result).property('a').equal(2)
  })
  it('count', async () => {
    const testArray = [1, 2]
    setTimeout(() => testArray.push(3), 3)
    const result = await count(() => testArray, 3, config)
    expect(result).not.null
    expect(result).length(3)
  })
  before(() => {
    window.unsafeWindow = window
  })
  it('select', async () => {
    setTimeout(() => {
      const div = document.createElement('div')
      div.classList.add('select-target')
      document.body.insertAdjacentElement('afterbegin', div)
    }, 3)
    const result = await select('.select-target', config)
    expect(result).not.null
    expect(result.classList.contains('select-target')).to.be.true
  })
  it('selectAll', async () => {
    setTimeout(() => {
      const fragment = document.createDocumentFragment()
      const div = document.createElement('div')
      div.classList.add('select-all-target')
      fragment.appendChild(div)
      fragment.appendChild(div.cloneNode())
      document.body.appendChild(fragment)
    }, 3)
    const result = await selectAll('.select-all-target', config)
    expect(result).not.null
    expect(result).length(2)
    expect(result.every(e => e.classList.contains('select-all-target'))).to.be.true
  })
  it('reuse select & selectAll', async () => {
    const p1 = select('.reuse-select-target', config)
    const p2 = select('.reuse-select-target', config)
    const p3 = selectAll('.reuse-select-target', config)
    const p4 = selectAll('.reuse-select-target', config)
    expect(p1 === p2).to.be.true
    expect(p3 === p4).to.be.true
    expect(p1 as any === p3).to.be.false
  })
  it('selectAll failing', async () => {
    const result = await selectAll('.select-all-failing', config)
    expect(result).not.null
    expect(result).length(0)
  })
})
