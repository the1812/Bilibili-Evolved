import { expect } from 'chai'
import {
  getDefaultStyleID, addStyle, addImportantStyle, removeStyle,
} from '@/core/style'

describe('Style API', () => {
  it('getDefaultStyleID', () => {
    const result = 'dark-mode'
    const id1 = 'darkMode'
    expect(getDefaultStyleID(id1)).equal(result)
    const id2 = 'dark-mode'
    expect(getDefaultStyleID(id2)).equal(result)
  })
  it('addStyle', () => {
    addStyle('a{color:black}', 'darkStyle')
    addStyle('a{color:red}', 'darkStyle')
    const element = document.getElementById('dark-style') as HTMLElement
    expect(document.querySelectorAll('#dark-style').length).equal(1)
    expect(element).not.equal(null)
    expect(element.parentElement).equal(document.head)
    expect(element.innerHTML.trim()).equal('a{color:black}')
    removeStyle('darkStyle')
  })
  it('addImportantStyle', () => {
    addImportantStyle('a{color:black}', 'darkStyleImportant')
    const element = document.getElementById('dark-style-important') as HTMLElement
    expect(element).not.equal(null)
    expect(element.parentElement).equal(document.body)
    removeStyle('darkStyleImportant')
  })
  it('removeStyle', () => {
    addStyle('a{color:black}', 'testStyle')
    addStyle('a{color:red}', 'testStyle2')
    removeStyle('testStyle', 'testStyle2')
    const elements = document.querySelectorAll('#test-style, #test-style2')
    expect(elements.length).equal(0)
  })
})
