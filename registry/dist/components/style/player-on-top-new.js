!(function (e, t) {
  'object' == typeof exports && 'object' == typeof module
    ? (module.exports = t())
    : 'function' == typeof define && define.amd
    ? define([], t)
    : 'object' == typeof exports
    ? (exports['style/player-on-top-new'] = t())
    : (e['style/player-on-top-new'] = t())
})(globalThis, () =>
  (() => {
    'use strict'
    var e = {
        d: (t, o) => {
          for (var n in o)
            e.o(o, n) && !e.o(t, n) && Object.defineProperty(t, n, { enumerable: !0, get: o[n] })
        },
        o: (e, t) => Object.prototype.hasOwnProperty.call(e, t),
      },
      t = {}
    e.d(t, { component: () => s })
    const o = coreApis.componentApis.define,
      n = coreApis.settings,
      r = coreApis.utils,
      i = coreApis.utils.urls
    function p(e, t) {
      const o = e.parentElement
      o && (o.removeChild(e), o.insertBefore(e, t.nextSibling))
    }
    const a = async e => {
        let {
          settings: { options: t },
        } = e
        await (0, r.playerReady)()
        p(document.querySelector('#viewbox_report'), document.querySelector('#arc_toolbar_report'))
        p(document.querySelector('#v_upinfo').parentElement, document.querySelector('#danmukuBox'))
        document.querySelector('#playerWrap').style.marginTop = `${t.marginTop}px`
      },
      s = (0, o.defineComponentMetadata)({
        name: 'playerOnTopNew',
        author: [
          { name: 'RieN7', link: 'https://github.com/rien7' },
          { name: 'ZiuChen', link: 'https://github.com/ZiuChen' },
        ],
        tags: [componentsTags.style, componentsTags.video],
        options: {
          marginTop: {
            displayName: '顶部留白 (px)',
            defaultValue: 20,
            validator: (0, r.getNumberValidator)(0, 1 / 0),
          },
        },
        urlInclude: i.videoUrls,
        displayName: '播放器置顶（新）',
        description:
          '原来的播放器置顶插件，现在已经不可用了，这是一个新的版本，可以在视频页面中将播放器放在页面最上方.',
        entry: a,
        reload: () => a({ settings: (0, n.getComponentSettings)('playerOnTopNew') }),
        commitHash: '8f10496200ab80dba32fa89e9beb48e96cff20fb',
        coreVersion: '2.7.1',
      })
    return (t = t.component)
  })(),
)
