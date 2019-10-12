let scriptBlocker
export const getScriptBlocker = async () => {
  if (scriptBlocker) {
    return scriptBlocker
  }
  let blockPatterns = (await GM.getValue('scriptBlockPatterns')) || []
  // 开启简化首页时, 阻断所有其他的<script>
  if (await GM.getValue('simplifyHome') && document.URL.replace(window.location.search, '') === 'https://www.bilibili.com/') {
    blockPatterns = [/./]
    // 加个空函数避免一些图片 onload 里调用 reportfs 报错
    unsafeWindow.reportfs = () => { }
  }
  const getNodeSrc = node => {
    if (node.src) {
      return node.src
    } else if (node.href) {
      return node.href
    } else {
      return '<inline>'
    }
  }
  const patternFilter = node => {
    if (!blockPatterns.some(p => {
      const src = getNodeSrc(node)
      if (!src) {
        return false
      }
      if (p instanceof RegExp) {
        return src.match(p)
      } else {
        return src.includes(p)
      }
    })) {
      return false
    }
    return true
  }
  const scriptFilter = node => {
    const name = node.nodeName.toLowerCase()
    if (name === 'script') {
      return true
    }
    if (name === 'link' && node.getAttribute('rel') === 'prefetch' && node.getAttribute('as') === 'script') {
      return true
    }
    return false
  }
  const removeNode = (node, onRemove) => {
    console.log(`Blocked script: `, node)
    node.type = 'text/blocked'
    node.remove()
    typeof onRemove === 'function' && onRemove(node)
  }
  const removeNodes = (nodeList, onRemove) => {
    [...nodeList].filter(scriptFilter).filter(patternFilter).forEach(node => removeNode(node, onRemove))
  }
  class ScriptBlocker extends EventTarget {
    constructor () {
      super()
      this.started = false
    }
    start () {
      if (this.started) {
        return
      }
      this.started = true
      const blockEvent = node => this.dispatchEvent(new CustomEvent('block', {
        detail: node
      }))
      const blocker = Observer.childList(document.head, records => {
        records.forEach(r => {
          removeNodes(r.addedNodes, blockEvent)
        })
      })
      const bodyObserver = Observer.childList(document.documentElement, records => {
        records.forEach(r => {
          r.addedNodes.forEach(node => {
            if (node === document.body) {
              bodyObserver.stop()
              removeNodes(document.body.childNodes, blockEvent)
              blocker.add(document.body)
            }
          })
        })
      })
    }
  }
  scriptBlocker = new ScriptBlocker()
  return scriptBlocker
}
