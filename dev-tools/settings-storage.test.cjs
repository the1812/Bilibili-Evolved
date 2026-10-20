const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

const source = readFileSync(path.join(__dirname, '../src/core/settings/storage.ts'), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const clone = value => (value === undefined ? value : JSON.parse(JSON.stringify(value)))
const prefix = '__bilibiliEvolvedSettings_v1__'
const limit = 60 * 1024
const component = name => ({
  code: `function ${name}() { return "中文、引号与空格 😀"; }\n`.repeat(1800),
  metadata: { name },
  settings: { enabled: true, options: { speed: 1.5 } },
})

// Model AdGuard's page-local cache updating even when the native write is dropped.
const openPage = (disk, { manager = 'AdGuard', drop = () => false, pending } = {}) => {
  const cache = new Map([...disk].map(([key, value]) => [key, clone(value)]))
  const writes = []
  const warnings = []
  const exports = {}
  const get = (key, fallback) => (cache.has(key) ? clone(cache.get(key)) : fallback)
  const set = (key, value) => {
    const copied = clone(value)
    const encodedSize = encodeURIComponent(JSON.stringify({ key, value: copied })).length
    cache.set(key, copied)
    writes.push({ key, value: copied, encodedSize })
    if (encodedSize <= limit && !drop(key, copied)) {
      if (pending) pending.push([key, copied])
      else disk.set(key, copied)
    }
  }
  vm.runInNewContext(compiled, {
    exports,
    GM_info: { scriptHandler: manager },
    GM_getValue: get,
    GM_setValue: set,
    GM_listValues: () => [...cache.keys()],
    console: { warn: (...args) => warnings.push(args) },
  })
  return { ...exports, get, set, writes, warnings }
}

test('large writes reproduce the old failure and survive reload through the adapter', () => {
  const oldValue = { first: { code: 'old', settings: { enabled: true } } }
  const disk = new Map([['userComponents', oldValue]])
  const native = openPage(disk)
  const value = { first: component('first'), second: component('second') }
  native.set('userComponents', value)
  assert.deepEqual(native.get('userComponents'), value)
  assert.deepEqual(openPage(disk).get('userComponents'), oldValue)

  const page = openPage(disk)
  page.writeSetting('userComponents', new Proxy(value, {}))
  assert.ok(page.writes.every(write => write.encodedSize < 32 * 1024))
  assert.deepEqual(clone(openPage(disk).readSetting('userComponents')), value)
  assert.deepEqual(disk.get('userComponents'), oldValue, 'legacy data is retained')
})

test('late older chunks and commit records cannot replace a newer installation', () => {
  const disk = new Map()
  const original = { first: component('first') }
  openPage(disk).writeSetting('userComponents', original)
  const pending = []
  const page = openPage(disk, { pending })
  const second = { ...original, second: component('second') }
  const third = { ...second, third: component('third') }
  page.writeSetting('userComponents', second)
  page.writeSetting('userComponents', third)
  // Native asynchronous transport finishes the oldest writes last.
  pending.reverse().forEach(([key, value]) => disk.set(key, value))
  const reloaded = clone(openPage(disk).readSetting('userComponents'))
  assert.deepEqual(Object.keys(reloaded), Object.keys(third))
  assert.deepEqual(reloaded, third)
})

test('sequential installs, nested settings, updates and removal survive new pages', () => {
  const disk = new Map()
  let page = openPage(disk)
  const value = { first: component('first') }
  page.writeSetting('userComponents', value)
  value.second = component('second')
  page.writeSetting('userComponents', value)
  page = openPage(disk)
  const loaded = page.readSetting('userComponents')
  assert.deepEqual(clone(loaded), value)
  loaded.second.settings.options.speed = 2
  loaded.first.code = 'updated'
  page.writeSetting('userComponents', loaded)
  assert.deepEqual(clone(openPage(disk).readSetting('userComponents')), clone(loaded))
  delete loaded.first
  page.writeSetting('userComponents', loaded)
  assert.deepEqual(clone(openPage(disk).readSetting('userComponents')), clone(loaded))
})

test('missing new chunks restore the previous complete commit', () => {
  const disk = new Map()
  const original = { first: component('first') }
  openPage(disk).writeSetting('userComponents', original)
  const page = openPage(disk, { drop: key => key.includes(':chunk:') })
  assert.deepEqual(clone(page.readSetting('userComponents')), original)
  const changed = { ...original, second: component('second') }
  page.writeSetting('userComponents', changed)
  page.writeSetting('userComponents', { ...changed, third: component('third') })
  const reloaded = openPage(disk)
  const recovered = reloaded.readSetting('userComponents')
  assert.deepEqual(clone(recovered), original)
  assert.equal(reloaded.warnings.length, 1)
  reloaded.writeSetting('userComponents', recovered)
  assert.equal(reloaded.writes.length, 0, 'initialization must not overwrite recovery data')
})

test('a failed first migration falls back to legacy data', () => {
  const legacy = { first: { code: 'original' } }
  const disk = new Map([['userComponents', legacy]])
  openPage(disk, { drop: key => key.includes(':chunk:') }).writeSetting('userComponents', {
    first: component('first'),
  })
  assert.deepEqual(clone(openPage(disk).readSetting('userComponents')), legacy)
})

test('unrecoverable data or invalid manifests fail without replacing storage', () => {
  const disk = new Map()
  openPage(disk, { drop: key => key.includes(':chunk:') }).writeSetting('userComponents', {
    first: component('first'),
  })
  const page = openPage(disk)
  assert.throws(() => page.readSetting('userComponents', {}), /分块数据不完整/)
  assert.equal(page.writes.length, 0)
  disk.set(`${prefix}userComponents`, { version: 2 })
  assert.throws(() => openPage(disk).readSetting('userComponents', {}), /索引无效/)
})

test('unicode and escaping survive, identical values do not add journal entries', () => {
  const disk = new Map()
  const page = openPage(disk)
  const value = { text: '中文😀\ud800\u0000%\\" '.repeat(4000), array: [null, true, 1.5] }
  page.writeSetting('userStyles', value)
  assert.deepEqual(clone(openPage(disk).readSetting('userStyles')), value)
  for (let index = 0; index < 10; index++) {
    page.writeSetting('userStyles', { text: `smaller-${index}` })
  }
  assert.deepEqual(clone(openPage(disk).readSetting('userStyles')), { text: 'smaller-9' })
  const writeCount = page.writes.length
  page.writeSetting('userStyles', { text: 'smaller-9' })
  assert.equal(page.writes.length, writeCount)
})

test('unchanged chunks are reused rather than rewritten during consecutive installs', () => {
  const disk = new Map()
  const page = openPage(disk)
  const first = { first: component('first') }
  page.writeSetting('userComponents', first)
  const before = page.writes.length
  page.writeSetting('userComponents', { ...first, second: { code: 'small' } })
  const added = page.writes.slice(before)
  assert.equal(added.filter(write => write.key.includes(':chunk:')).length, 1)
  assert.equal(added.filter(write => write.key.includes(':commit:')).length, 1)
})

test("a stale tab changing one component does not remove another tab's installation", () => {
  const disk = new Map()
  const initial = { first: { code: 'first', settings: { speed: 1 } } }
  openPage(disk).writeSetting('userComponents', initial)
  const installer = openPage(disk)
  const staleTab = openPage(disk)
  staleTab.readSetting('userComponents')
  installer.writeSetting('userComponents', { ...initial, second: { code: 'second' } })
  staleTab.writeSetting('userComponents', {
    first: { code: 'first', settings: { speed: 1.7 } },
  })
  assert.deepEqual(clone(openPage(disk).readSetting('userComponents')), {
    first: { code: 'first', settings: { speed: 1.7 } },
    second: { code: 'second' },
  })
  const remover = openPage(disk)
  const loaded = remover.readSetting('userComponents')
  delete loaded.second
  remover.writeSetting('userComponents', loaded)
  assert.deepEqual(Object.keys(openPage(disk).readSetting('userComponents')), ['first'])
})

test('v1 data remains readable and is not overwritten when migrating to the journal', () => {
  const old = { first: { code: 'old' } }
  const encoded = encodeURIComponent(JSON.stringify(old))
  const disk = new Map([
    [
      `${prefix}userComponents`,
      {
        version: 1,
        current: { bank: 0, revision: 'legacy', length: encoded.length, parts: 1 },
      },
    ],
    [`${prefix}userComponents:0:0`, { revision: 'legacy', data: encoded }],
  ])
  const page = openPage(disk)
  assert.deepEqual(clone(page.readSetting('userComponents')), old)
  const updated = { ...old, second: component('second') }
  page.writeSetting('userComponents', updated)
  assert.deepEqual(clone(openPage(disk).readSetting('userComponents')), updated)
  assert.equal(disk.get(`${prefix}userComponents:0:0`).data, encoded)
})

test('later complete snapshots recover installs whose commit was dropped', () => {
  const disk = new Map()
  const page = openPage(disk)
  const first = { first: { code: 'first' } }
  page.writeSetting('userComponents', first)
  const second = { ...first, second: { code: 'second' } }
  page.writeSetting('userComponents', second)
  const secondCommit = page.writes.at(-1).key
  const third = { ...second, third: { code: 'third' } }
  page.writeSetting('userComponents', third)
  disk.delete(secondCommit)
  assert.deepEqual(clone(openPage(disk).readSetting('userComponents')), third)
})

test('a commit arriving before its chunks is ignored until the snapshot is complete', () => {
  const disk = new Map()
  const old = { first: { code: 'old' } }
  openPage(disk).writeSetting('userComponents', old)
  const pending = []
  const updated = { ...old, second: component('second') }
  openPage(disk, { pending }).writeSetting('userComponents', updated)
  const commit = pending.pop()
  disk.set(...commit)
  assert.deepEqual(clone(openPage(disk).readSetting('userComponents')), old)
  pending.forEach(entry => disk.set(...entry))
  assert.deepEqual(clone(openPage(disk).readSetting('userComponents')), updated)
})

test('all settings keys can be imported and exported without internal storage metadata', () => {
  const settings = {
    components: { autoUpdate: { enabled: true, options: {} } },
    userComponents: { first: component('first'), second: component('second') },
    userPlugins: { plugin: { code: 'x'.repeat(100000) } },
    userStyles: { style: { style: ' '.repeat(50000) } },
    plugins: { idSearch: true },
  }
  const disk = new Map()
  const writer = openPage(disk)
  Object.entries(settings).forEach(([key, value]) => writer.writeSetting(key, value))
  const reader = openPage(disk)
  const exported = Object.fromEntries(
    Object.keys(settings).map(key => [key, reader.readSetting(key)]),
  )
  assert.deepEqual(clone(exported), settings)
})

test('other userscript managers keep their native storage format', () => {
  const disk = new Map()
  const page = openPage(disk, { manager: 'Tampermonkey' })
  page.writeSetting('userComponents', { first: { code: 'hello' } })
  assert.deepEqual(page.readSetting('userComponents'), { first: { code: 'hello' } })
  assert.deepEqual([...disk.keys()], ['userComponents'])
})
