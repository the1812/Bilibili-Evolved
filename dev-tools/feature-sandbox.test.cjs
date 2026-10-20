const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

const compiled = ts.transpileModule(
  readFileSync(path.join(__dirname, '../src/core/external-input/load-feature-code.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText

const openSandbox = (manager = 'AdGuard') => {
  const context = vm.createContext({ exports: {}, GM_info: { scriptHandler: manager } })
  vm.runInContext(
    `
    const calls = [];
    const window = { eval, Symbol, Array, Object };
    window.window = window;
    const unsafeWindow = { marker: 'page' };
    for (const name of ['requestIdleCallback', 'cancelIdleCallback',
                        'requestAnimationFrame', 'cancelAnimationFrame',
                        'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval']) {
      window[name] = function (...args) {
        if (this !== window) throw new TypeError('Illegal invocation');
        calls.push({ name, args });
        return 42;
      };
    }
  `,
    context,
  )
  vm.runInContext(compiled, context)
  return { context, load: context.exports.loadFeatureCode }
}

test('AdGuard scheduling APIs receive the manager window, not the with-scope proxy', () => {
  const { context, load } = openSandbox()
  assert.throws(
    () =>
      vm.runInContext(
        `
    const proxy = new Proxy({}, { get: (_, key) => window[key] });
    proxy.requestIdleCallback(() => {});
  `,
        context,
      ),
    /Illegal invocation/,
  )
  const feature = load(`exports.component = {
    entry() {
      const idle = requestIdleCallback(() => {}, { timeout: 1000 });
      cancelIdleCallback(idle);
      const frame = requestAnimationFrame(() => {});
      cancelAnimationFrame(frame);
      return [idle, frame];
    }
  }`)
  assert.deepEqual(Array.from(feature.entry()), [42, 42])
  assert.equal(vm.runInContext('calls.length', context), 4)
  assert.equal(vm.runInContext('calls[0].args[1].timeout', context), 1000)
  assert.equal(vm.runInContext('calls[1].args[0]', context), 42)
})

test('direct eval, exports, page access and constructors keep their existing behavior', () => {
  const { load } = openSandbox()
  assert.equal(load('exports.component = { name: "first" }').name, 'first')
  assert.equal(load('({ name: "second" })').name, 'second')
  assert.equal(load('unsafeWindow.marker'), 'page')
  assert.equal(load('new Array(3).length'), 3)
  assert.equal(load('requestIdleCallback === requestIdleCallback'), true)
  assert.equal(load('window.requestIdleCallback(() => {})'), 42)
  assert.throws(() => load('invalid syntax !'), { name: 'Error' })
})

test('other managers retain their original API references', () => {
  const { context, load } = openSandbox('Tampermonkey')
  assert.equal(load('requestIdleCallback'), vm.runInContext('window.requestIdleCallback', context))
})

test('missing optional scheduling APIs are not injected', () => {
  const { context, load } = openSandbox()
  vm.runInContext('delete window.requestIdleCallback', context)
  assert.equal(load('typeof requestIdleCallback'), 'undefined')
})

test('timer APIs in installed feature code use the manager window and preserve arguments', () => {
  const { context, load } = openSandbox()
  const feature = load(`exports.component = {
    entry() {
      const timeout = setTimeout(() => {}, 1000, 'argument');
      clearTimeout(timeout);
      const interval = setInterval(() => {}, 200);
      clearInterval(interval);
      return [timeout, interval];
    }
  }`)
  assert.deepEqual(Array.from(feature.entry()), [42, 42])
  assert.equal(vm.runInContext('calls[0].args[1]', context), 1000)
  assert.equal(vm.runInContext('calls[0].args[2]', context), 'argument')
  assert.equal(vm.runInContext('calls[1].args[0]', context), 42)
  assert.equal(vm.runInContext('calls[2].args[1]', context), 200)
  assert.equal(vm.runInContext('calls[3].args[0]', context), 42)
})

test('other managers keep timer API identity', () => {
  const { context, load } = openSandbox('Tampermonkey')
  assert.equal(load('setTimeout'), vm.runInContext('window.setTimeout', context))
  assert.equal(load('clearInterval'), vm.runInContext('window.clearInterval', context))
})

test('legacy speed restoration does not mask a timer receiver error as failed speed', async () => {
  const { context, load } = openSandbox()
  context.nativeSetTimeout = setTimeout
  vm.runInContext(
    `
    window.Promise = Promise;
    window.Error = Error;
    window.setTimeout = function (...args) {
      if (this !== window) throw new TypeError('Illegal invocation');
      return nativeSetTimeout(...args);
    };
  `,
    context,
  )
  const restore = load(`exports.component = async function (actualSpeed) {
    const check = result => {
      if ((result ?? actualSpeed) !== 1) throw new Error('failed to set 1.0x video speed.');
    };
    await Promise.all([
      new Promise(() => {}),
      new Promise((resolve, reject) => setTimeout(() => setTimeout(reject, 5)))
    ]).then(check).catch(check);
  }`)
  await restore(1)
  await assert.rejects(restore(1.7), /failed to set 1.0x/)
})

test('CSS source maps can use Base64 APIs through the AdGuard feature sandbox', () => {
  const { context, load } = openSandbox()
  context.encodeBase64 = btoa
  context.decodeBase64 = atob
  vm.runInContext(
    `
    window.JSON = JSON;
    window.encodeURIComponent = encodeURIComponent;
    window.unescape = unescape;
    window.btoa = function (value) {
      if (this !== window) throw new TypeError('Illegal invocation');
      return encodeBase64(value);
    };
    window.atob = function (value) {
      if (this !== window) throw new TypeError('Illegal invocation');
      return decodeBase64(value);
    };
  `,
    context,
  )
  const feature = load(`exports.component = {
    entry() {
      const map = JSON.stringify({ version: 3, sources: ['style.scss'], mappings: '' });
      const css = '/*# sourceMappingURL=data:application/json;base64,' + btoa(map) + ' */';
      return { css, decoded: atob(btoa(map)) };
    }
  }`)
  const result = feature.entry()
  const map = JSON.stringify({ version: 3, sources: ['style.scss'], mappings: '' })
  assert.equal(result.css, `/*# sourceMappingURL=data:application/json;base64,${btoa(map)} */`)
  assert.equal(result.decoded, map)
  assert.equal(load('btoa === btoa'), true)
  assert.throws(() => load('btoa("中文")'), error =>
    error.cause?.name === 'InvalidCharacterError',
  )

  // Exercise the actual css-loader runtime used by installed component styles.
  const cssLoaderRuntime = readFileSync(
    require.resolve('css-loader/dist/runtime/cssWithMappingToString'),
    'utf8',
  )
  const stringify = load(`(() => {
    const module = { exports: {} };
    ${cssLoaderRuntime}
    return module.exports;
  })()`)
  const cssMap = { version: 3, sources: ['样式.scss'], mappings: '' }
  const css = stringify([0, '.example { color: red; }', '', cssMap])
  assert.ok(css.startsWith('.example { color: red; }'))
  assert.ok(css.includes(Buffer.from(JSON.stringify(cssMap)).toString('base64')))
})

test('other managers keep Base64 API identity', () => {
  const { context, load } = openSandbox('Tampermonkey')
  context.encodeBase64 = btoa
  context.decodeBase64 = atob
  vm.runInContext('window.btoa = encodeBase64; window.atob = decodeBase64', context)
  assert.equal(load('btoa'), btoa)
  assert.equal(load('atob'), atob)
})

test('download click handlers preserve the fetch receiver, arguments and response stream', async () => {
  const { context, load } = openSandbox()
  const response = { body: { marker: 'original stream' } }
  const failure = new Error('network failure')
  Object.assign(context, { response, failure })
  vm.runInContext(`
    window.fetch = function (...args) {
      if (this !== window) throw new TypeError('Illegal invocation');
      calls.push({ name: 'fetch', args });
      return args[0] === 'fail' ? Promise.reject(failure) : Promise.resolve(response);
    };
  `, context)
  const click = load(`exports.component = async function (url, options) {
    const response = await fetch(url, options);
    return response.body;
  }`)
  const options = { credentials: 'omit', headers: { Range: 'bytes=0-1023' } }
  assert.equal(await click('https://example.com/video.flv', options), response.body)
  assert.equal(vm.runInContext('calls[0].args[0]', context), 'https://example.com/video.flv')
  assert.equal(vm.runInContext('calls[0].args[1]', context), options)
  await assert.rejects(click('fail'), error => error === failure)
})

test('other managers retain fetch identity', () => {
  const { context, load } = openSandbox('Tampermonkey')
  vm.runInContext('window.fetch = function () {}', context)
  assert.equal(load('fetch'), vm.runInContext('window.fetch', context))
})
