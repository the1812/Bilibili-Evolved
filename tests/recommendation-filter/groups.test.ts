import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  findKeywordGroups,
  groupPageSize,
  parseKeywordGroups,
  prepareKeywordGroups,
  uniqueKeywords,
} from '../../registry/lib/components/utils/recommendation-filter/groups'
import { generalGroupId } from '../../registry/lib/components/utils/recommendation-filter/rules'

test('migration consolidates enabled unnamed single words and preserves other groups', () => {
  const single = { id: 'single', enabled: true, keywords: [' ＡＢＣ ', ' '] }
  const duplicate = { id: 'duplicate', enabled: true, keywords: ['abc'] }
  const combined = { id: 'combined', enabled: true, keywords: ['游戏', '抽卡'] }
  const named = { id: 'named', name: '保留名称', enabled: true, keywords: ['测试'] }
  const disabled = { id: 'disabled', enabled: false, keywords: ['暂停'] }
  const result = prepareKeywordGroups([single, duplicate, combined, named, disabled])
  assert.equal(result[0].id, generalGroupId)
  assert.deepEqual(result[0].keywords, ['ＡＢＣ'])
  assert.deepEqual(result.slice(1), [combined, named, disabled])
  assert.equal(prepareKeywordGroups(result), result)
  assert.deepEqual(uniqueKeywords(['abc', ' ABC ', '', '测试']), ['abc', '测试'])
  assert.deepEqual(single.keywords, [' ＡＢＣ ', ' '])
})

test('bulk input creates AND groups, handles whitespace and blank lines', () => {
  assert.deepEqual(parseKeywordGroups(' 游戏 | 抽卡 \r\n\r\n影视 | 解说\n单词\n||\n'), [
    ['游戏', '抽卡'],
    ['影视', '解说'],
    ['单词'],
  ])
  assert.deepEqual(parseKeywordGroups(' \n | '), [])
})
test('legacy groups, names, case and width work with state filters', () => {
  const groups = [
    { id: 'old', enabled: true, keywords: ['ＡＢＣ', '抽卡'] },
    { id: 'new', name: '影视', enabled: false, keywords: ['解说'] },
  ]
  assert.equal(findKeywordGroups(groups, 'abc', 'all')[0].group.id, 'old')
  assert.equal(findKeywordGroups(groups, '影视', 'all')[0].group.id, 'new')
  assert.equal(findKeywordGroups(groups, '', 'enabled').length, 1)
  assert.equal(findKeywordGroups(groups, '', 'disabled')[0].group.id, 'new')
  assert.equal(findKeywordGroups(groups, 'no match', 'all').length, 0)
})
test('large lists preserve original numbering and paginate to 20 rows', () => {
  const groups = Array.from({ length: 503 }, (_, i) => ({
    id: String(i),
    enabled: i % 2 === 0,
    keywords: [`keyword ${i}`],
  }))
  const filtered = findKeywordGroups(groups, '', 'disabled')
  assert.equal(filtered.length, 251)
  assert.equal(filtered[0].index, 1)
  assert.equal(groupPageSize, 20)
  assert.equal(filtered.slice(0, groupPageSize).length, 20)
  assert.equal(filtered.slice(12 * groupPageSize).length, 11)
  assert.equal(groups.length, 503)
})
