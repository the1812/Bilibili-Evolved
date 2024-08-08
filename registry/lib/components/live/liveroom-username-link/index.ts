import { defineComponentMetadata } from '@/components/define'
import { select } from '@/core/spin-query'
import { delay } from '@/core/utils'

const processed = new WeakSet()

const entry = async () => {
  const userInfoBar = await select('#rank-list-ctnr-box', {
    queryInterval: 500,
  })

  const observer = new MutationObserver(async () => {
    // 舰长列表
    const guardNodes = [...document.querySelectorAll('webcomponent-userinfo')]
    let subtreeLoaded = false

    for (const node of guardNodes) {
      if (processed.has(node)) {
        continue
      }

      // eslint-disable-next-line no-underscore-dangle
      const { uid } = (node as any).__vue__.source.uinfo

      if (!subtreeLoaded) {
        // 等待子节点创建
        while (
          node.shadowRoot.querySelector('a') === null ||
          node.shadowRoot.querySelector('.faceBox') === null
        ) {
          await delay(100)
        }
        subtreeLoaded = true
      }

      const aNode = node.shadowRoot.querySelector('a')
      const avatarNode: HTMLDivElement = node.shadowRoot.querySelector('.faceBox')

      aNode.href = `https://space.bilibili.com/${uid}`
      aNode.style.textDecoration = 'none'

      avatarNode.style.cursor = 'pointer'
      avatarNode.addEventListener('click', () => {
        window.open(`https://space.bilibili.com/${uid}`)
      })
      processed.add(node)

      // const name = a.innerText
      // console.log(`已为舰长${name}(UID: ${uid})添加超链接`)
    }

    // 观众列表
    const spectorNodes = [...document.querySelectorAll('.gift-rank-list-item')]
    for (const node of spectorNodes) {
      if (processed.has(node)) {
        continue
      }

      // 观众列表元素似乎会原地更新，不能直接预先获取UID并绑定，这里通过点击时获取父元素动态读取UID

      // 名称
      const nameNode: HTMLDivElement = node.querySelector('.common-nickname-wrapper .name')
      nameNode.style.cursor = 'pointer'
      nameNode.addEventListener('click', () => {
        // eslint-disable-next-line no-underscore-dangle
        const { uid } = (nameNode as any).parentNode.parentNode.parentNode.parentNode.__vue__.source
        window.open(`https://space.bilibili.com/${uid}`)
      })

      // 头像
      const avatarNode: HTMLDivElement = node.querySelector('.face')
      avatarNode.style.cursor = 'pointer'
      avatarNode.addEventListener('click', () => {
        // eslint-disable-next-line no-underscore-dangle
        const { uid } = (avatarNode as any).parentNode.parentNode.__vue__.source
        window.open(`https://space.bilibili.com/${uid}`)
      })
      processed.add(node)

      // const name = nameNode.innerText
      // console.log(`已为观众${name}(UID: ${uid})添加超链接`)
    }
  })

  observer.observe(userInfoBar, {
    childList: true,
    subtree: true,
  })
}

export const component = defineComponentMetadata({
  name: 'liveroomUsernameLink',
  author: {
    name: 'Light_Quanta',
    link: 'https://github.com/LightQuanta',
  },
  displayName: '添加直播间用户超链接',
  entry,
  tags: [componentsTags.live],
  urlInclude: [/^https:\/\/live\.bilibili\.com\/\d+/],
  description: {
    'zh-CN': '为直播间的房间观众和大航海界面的用户列表添加可以点击的超链接',
  },
})
