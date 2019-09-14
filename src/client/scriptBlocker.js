export const scriptBlocker = (() => {
  let blockPatterns = GM_getValue('scriptBlockPatterns') || []
  // 开启简化首页时, 阻断所有其他的<script>
  if (GM_getValue('simplifyHome') && document.URL.replace(window.location.search, '') === 'https://www.bilibili.com/') {
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
  const removeNode = node => {
    console.log(`Blocked script: `, node)
    node.type = 'text/blocked'
    node.remove()
  }
  const removeNodes = nodeList => {
    [...nodeList].filter(scriptFilter).filter(patternFilter).forEach(removeNode)
  }
  return {
    start () {
      const blocker = Observer.childList(document.head, records => {
        records.forEach(r => {
          removeNodes(r.addedNodes)
        })
      })
      const bodyObserver = Observer.childList(document.documentElement, records => {
        records.forEach(r => {
          r.addedNodes.forEach(node => {
            if (node === document.body) {
              bodyObserver.stop()
              removeNodes(document.body.childNodes)
              blocker.add(document.body)
            }
          })
        })
      })
    }
  }
})()