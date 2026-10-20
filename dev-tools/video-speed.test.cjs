const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

// Exercise the actual shared implementation without starting the player/DOM observers.
const file = path.join(__dirname, '../registry/lib/components/video/player/common/speed/context.ts')
const source = readFileSync(file, 'utf8')
const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
const declaration = ast.statements
  .filter(ts.isVariableStatement)
  .flatMap(statement => [...statement.declarationList.declarations])
  .find(node => node.name.getText(ast) === 'buildMethodPart')
const compiled = ts.transpileModule(`const ${declaration.getText(ast)}; buildMethodPart`, {
  compilerOptions: { target: ts.ScriptTarget.ES2020 },
}).outputText

const openPlayer = ({ click = () => {}, found = true, timerError } = {}) => {
  const video = { playbackRate: 1 }
  const listeners = new Set()
  const events = {
    pipe: () => events,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
  const build = vm.runInNewContext(compiled, {
    delay: ms => new Promise(resolve => setTimeout(() => resolve(), ms)),
    setTimeout: (...args) => {
      if (timerError) throw timerError
      return setTimeout(...args)
    },
    debounceTime: () => {},
    firstValueFrom: stream => new Promise(resolve => stream.subscribe(resolve)),
    formatSpeedText: value => `${value}x`,
    NoSuchSpeedMenuItemElementError: class extends Error {},
  })
  return {
    video,
    listeners,
    methods: build({
      videoElement: video,
      videoSpeedChange$: events,
      query: value => found ? { click: () => click(video, value, listeners) } : null,
    }),
  }
}

test('synchronous custom speed succeeds even with no change event', async () => {
  const { methods, video, listeners } = openPlayer({
    click: (video, value) => { video.playbackRate = value },
  })
  await methods.set(1.7, 5)
  assert.equal(video.playbackRate, 1.7)
  assert.equal(listeners.size, 0, 'no abandoned event subscription after the timeout')
})

test('zero timeout checks the actual speed, not a Promise.all result array', async () => {
  const { methods } = openPlayer({
    click: (video, value, listeners) => {
      video.playbackRate = value
      setTimeout(() => listeners.forEach(listener => listener(value)), 0)
    },
  })
  await methods.set(1.7, 0)
})

test('waits for an asynchronous player update', async () => {
  const { methods, video } = openPlayer({
    click: (video, value) => { setTimeout(() => { video.playbackRate = value }, 5) },
  })
  await methods.set(2.5, 20)
  assert.equal(video.playbackRate, 2.5)
})

test('a speed overwritten by the player still fails validation', async () => {
  const { methods } = openPlayer({
    click: (video, value) => {
      video.playbackRate = value
      setTimeout(() => { video.playbackRate = 1 }, 5)
    },
  })
  await assert.rejects(methods.set(1.7, 20), /failed to set 1.7x/)
})

test('does not call timers through the feature sandbox receiver', async () => {
  const { methods } = openPlayer({
    timerError: new TypeError('Illegal invocation'),
    click: (video, value) => { video.playbackRate = value },
  })
  await methods.set(1.7, 5)
})

test('missing menu items and click errors remain failures', async () => {
  await assert.rejects(openPlayer({ found: false }).methods.set(1.7, 0))
  const error = new Error('click failed')
  await assert.rejects(openPlayer({ click: () => { throw error } }).methods.set(1.7), error)
})

test('failure reports unreadable playbackRate separately from a real speed mismatch', async () => {
  const { methods, video } = openPlayer()
  Object.assign(video, { playbackRate: undefined, tagName: 'BWP-VIDEO', isConnected: true })
  await assert.rejects(
    methods.set(1, 0),
    /actual: undefined, type: undefined, element: BWP-VIDEO, connected: true/,
  )
  Object.assign(video, { playbackRate: 1.5, isConnected: false })
  await assert.rejects(
    methods.set(1, 0),
    /actual: 1.5, type: number, element: BWP-VIDEO, connected: false/,
  )
})
