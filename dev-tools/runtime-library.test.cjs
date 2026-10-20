const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { createHash, webcrypto } = require('node:crypto')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

const compile = name => ts.transpileModule(
  readFileSync(path.join(__dirname, '../src/core', name), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText
const ajaxCode = compile('ajax.ts')
const runtimeCode = compile('runtime-library.ts')
const source = 'this.streamSaver = { createWriteStream() { return "stream"; } };'
const library = {
  url: 'https://example.test/stream-saver.js',
  sha256: createHash('sha256').update(source).digest('hex'),
}
const setup = respond => {
  const requests = []
  const ajax = { exports: {} }
  vm.runInNewContext(ajaxCode, {
    exports: ajax.exports,
    require: () => ({ logError() {} }),
    GM_xmlhttpRequest(details) {
      requests.push(details)
      queueMicrotask(() => details.onload(respond(requests.length)))
    },
  })
  const window = { crypto: webcrypto }
  const runtime = { exports: {} }
  vm.runInNewContext(runtimeCode, {
    exports: runtime.exports,
    require: name => name === './ajax' ? ajax.exports : {
      meta: { compilationInfo: { altCdn: { library: {
        protobuf: library, fflate: library, sortable: library, streamsaver: library,
      } } } },
    },
    window, TextEncoder, Uint8Array,
    console: { log() {} },
  })
  return { ...ajax.exports, ...runtime.exports, requests, window }
}

test('runtime library loads a text-only GM response and caches successful execution', async () => {
  const { StreamSaverLibrary, requests } = setup(() => ({ responseText: source }))
  const [first, second] = await Promise.all([StreamSaverLibrary, StreamSaverLibrary])
  assert.equal(first.createWriteStream(), 'stream')
  assert.equal(first, second)
  assert.equal(await StreamSaverLibrary, first)
  assert.equal(requests.length, 1)
  assert.equal(requests[0].responseType, 'text')
})

test('monkey preserves defined responses and only reads responseText for text requests', async () => {
  for (const response of ['', 0, false, null, { ok: true }, new ArrayBuffer(2)]) {
    const { monkey } = setup(() => ({
      response,
      get responseText() { throw new Error('responseText must not be accessed') },
    }))
    assert.equal(await monkey({ url: library.url, responseType: 'json' }), response)
  }
  const { monkey } = setup(() => ({
    get responseText() { throw new Error('binary responseText must not be accessed') },
  }))
  assert.equal(await monkey({ url: library.url, responseType: 'arraybuffer' }), undefined)
})

test('empty text responses remain valid for generic requests', async () => {
  const { monkey } = setup(() => ({ responseText: '' }))
  assert.equal(await monkey({ url: library.url }), '')
})

test('missing runtime code gives a useful error and the next attempt can recover', async () => {
  const { StreamSaverLibrary, requests } = setup(n => n === 1 ? {} : { response: source })
  await assert.rejects(Promise.resolve(StreamSaverLibrary), /RuntimeLibrary.*text.*example\.test/)
  assert.equal((await StreamSaverLibrary).createWriteStream(), 'stream')
  assert.equal(requests.length, 2)
})

test('integrity failures never execute the downloaded script', async () => {
  const { StreamSaverLibrary, window } = setup(() => ({ response: 'this.executed = true' }))
  await assert.rejects(Promise.resolve(StreamSaverLibrary), /Check integrity failed/)
  assert.equal(window.executed, undefined)
})

test('then supports omitted handlers and rejection recovery without a second rejection', async () => {
  const success = setup(() => ({ response: source })).StreamSaverLibrary
  assert.equal((await success.then()).createWriteStream(), 'stream')
  await assert.rejects(success.then(() => { throw new Error('consumer failed') }), /consumer failed/)
  const failure = setup(() => ({})).StreamSaverLibrary
  assert.equal(await failure.then(undefined, () => 'recovered'), 'recovered')
})
