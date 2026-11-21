import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  generalGroupId,
  matchRecommendation,
  parseDuration,
} from '../../registry/lib/components/utils/recommendation-filter/rules'

const now = Date.UTC(2026, 10, 1)
const base = {
  keywordGroups: [],
  durationEnabled: false,
  minimumMinutes: 1,
  minimumSeconds: 0,
  viewsEnabled: false,
  minimumViews: 12300,
  followedExempt: true,
  ageEnabled: false,
  maximumAgeDays: 30,
}
const video = {
  bvid: 'BV1test',
  title: 'ＡＢＣ 甜品 探店',
  duration: 60,
  views: 12345,
  publishedAt: now / 1000 - 30 * 86400,
}
const match = (v = {}, o = {}, home = true, time = now) =>
  matchRecommendation({ ...video, ...v }, { ...base, ...o }, home, time)
test('general group matches any word while custom groups still require every word', () => {
  const general = { id: generalGroupId, enabled: true, keywords: ['不存在', 'ABC', '   '] }
  const custom = { id: 'custom', enabled: true, keywords: ['甜品', 'missing'] }
  assert.deepEqual(match({}, { keywordGroups: [general, custom] }), ['标题：abc'])
  assert.equal(match({}, { keywordGroups: [{ ...general, enabled: false }, custom] }).length, 0)
  assert.equal(match({}, { keywordGroups: [{ ...general, keywords: ['   '] }, custom] }).length, 0)
  assert.equal(
    match(
      {},
      {
        keywordGroups: [
          { ...general, keywords: ['missing'] },
          { ...custom, keywords: ['甜品', '探店'] },
        ],
      },
    ).length,
    1,
  )
  assert.equal(match({ followed: true }, { keywordGroups: [general, custom] }).length, 0)
})
test('keyword AND, group OR, case/width, literal text, empty and disabled groups', () => {
  const group = { id: '1', enabled: true, keywords: ['abc', '探店'] }
  assert.equal(match({}, { keywordGroups: [group] }).length, 1)
  assert.equal(match({}, { keywordGroups: [{ ...group, keywords: ['ABC', 'missing'] }] }).length, 0)
  assert.equal(match({}, { keywordGroups: [{ ...group, keywords: ['missing'] }, group] }).length, 1)
  assert.equal(
    match(
      {},
      {
        keywordGroups: [
          { ...group, keywords: ['  '] },
          { ...group, enabled: false },
        ],
      },
    ).length,
    0,
  )
  assert.equal(match({}, { keywordGroups: [{ ...group, keywords: ['.*'] }] }).length, 0)
})
test('exact views and strict numeric boundaries, missing and invalid values', () => {
  assert.equal(match({}, { viewsEnabled: true }).length, 0)
  assert.equal(match({ views: 12300 }, { viewsEnabled: true }).length, 0)
  assert.equal(match({ views: 12299 }, { viewsEnabled: true }).length, 1)
  for (const views of [undefined, NaN, Infinity, -1]) {
    assert.equal(match({ views }, { viewsEnabled: true }).length, 0)
  }
  assert.equal(match({ views: 0 }, { viewsEnabled: true }).length, 1)
  assert.equal(match({}, { durationEnabled: true }).length, 0)
  assert.equal(match({ duration: 59 }, { durationEnabled: true }).length, 1)
  assert.equal(match({ duration: 61 }, { durationEnabled: true }).length, 0)
})
test('followed exemption wins over all filters, only on homepage', () => {
  const o = {
    keywordGroups: [{ id: '1', enabled: true, keywords: ['ABC'] }],
    durationEnabled: true,
    minimumMinutes: 10,
    viewsEnabled: true,
    minimumViews: 999999,
    ageEnabled: true,
    maximumAgeDays: 1,
  }
  assert.equal(match({ followed: true }, o).length, 0)
  assert.equal(match({ followed: true }, { ...o, followedExempt: false }).length, 4)
  assert.equal(match({ followed: true }, o, false).length, 3)
  assert.equal(match({ followed: undefined }, o).length, 4)
})
test('age boundary, missing/invalid/future dates and minute rollover', () => {
  assert.equal(match({}, { ageEnabled: true }).length, 0)
  assert.equal(match({ publishedAt: video.publishedAt - 1 }, { ageEnabled: true }).length, 1)
  assert.equal(match({ publishedAt: video.publishedAt + 1 }, { ageEnabled: true }).length, 0)
  for (const publishedAt of [undefined, 0, -1, NaN, Infinity, now / 1000 + 86400]) {
    assert.equal(match({ publishedAt }, { ageEnabled: true }).length, 0)
  }
  assert.equal(match({ publishedAt: video.publishedAt - 1 }, { ageEnabled: true }, false).length, 0)
  assert.equal(match({}, { ageEnabled: true }, true, now + 60000).length, 1)
})
test('duration text is exact; abbreviated counts are never parsed', () => {
  assert.equal(parseDuration('01:24:30'), 5070)
  assert.equal(parseDuration('84:30'), 5070)
  assert.equal(parseDuration('00:00'), 0)
  for (const v of ['1.2万', '--', '1:60', '1:2:3:4', '']) {
    assert.equal(parseDuration(v), undefined)
  }
})
