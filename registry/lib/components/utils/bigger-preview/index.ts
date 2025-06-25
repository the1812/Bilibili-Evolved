import Vue from 'vue'
import { ComponentEntry } from '@/components/types'
import { defineComponentMetadata } from '@/components/define'
import { childListSubtree } from '@/core/observer'
import { select } from '@/core/spin-query'
import { useScopedConsole } from '@/core/utils/log'
import PreviewButton from './PreviewButton.vue'

const logger = useScopedConsole('biggerPreview')

const entry: ComponentEntry = async () => {
  // 预览容器
  let videoContainer = null

  // #region functions
  /**
   * 初始化预览容器
   */
  async function initPreviewContainer() {
    const VideoContainerModule = await import('./VideoContainer.vue')
    const VideoContainer = VideoContainerModule.default

    const ModalClass = Vue.extend(VideoContainer)
    videoContainer = new ModalClass()
    videoContainer.$mount()
    document.body.appendChild(videoContainer.$el)
  }

  /**
   *  创建预览按钮的容器元素（由 Vue 渲染）
   *  @param {string} className - 按钮的类名
   * @returns {HTMLElement} 预览按钮的容器元素
   */
  function createPreviewButton(className: string): HTMLElement {
    const ComponentClass = Vue.extend(PreviewButton)

    const instance = new ComponentClass({
      propsData: {
        btnClass: className,
        btnOnClickCallback: (e: MouseEvent) => {
          e.preventDefault()

          const video = instance.$el.parentElement.closest('.pic-box')
          videoContainer?.openPopup(video)
        },
      },
    })

    instance.$mount()

    return instance.$el as HTMLElement
  }

  /**
   * 插入预览放大按钮
   * @param {HTMLElement} node - 要插入按钮的节点
   * @param {string} className - 按钮的类名
   */
  function insertPreviewButton(node: HTMLElement, className: string) {
    const wrap = node.querySelectorAll('.v-inline-player,.v-recommend-inline-player')
    wrap.forEach(it => {
      if (it.querySelector(`.${className}`)) {
        return
      }

      const div = createPreviewButton(className)
      it.parentElement.appendChild(div)
    })
  }

  /**
   * 初始化预览放大按钮（通用）
   * @param btnClassName 按钮类名
   * @param videoClassName 视频卡片类名
   * @param containerSelector 容器选择器
   * @param getInsertNode 获取插入按钮的节点
   */
  async function initPreviewButton(
    btnClassName: string,
    videoClassName: string,
    containerSelector: string,
    getInsertNode: (element: HTMLElement) => HTMLElement,
  ) {
    const containerNode = (await select(containerSelector)) as HTMLElement
    if (!containerNode) {
      logger.warn('未找到容器节点:', containerSelector)
      return
    }
    const wrap = containerNode.querySelectorAll(`.${videoClassName}`)
    logger.debug(`初始化已有卡片: `, wrap.length)
    // 初始化已有卡片
    insertPreviewButton(containerNode, btnClassName)

    // 监听容器变化
    childListSubtree(containerNode, records => {
      records.forEach(record => {
        record.addedNodes.forEach(n => {
          if (n.nodeType !== Node.ELEMENT_NODE) {
            return
          }
          const element = n as HTMLElement
          if (
            !element.classList.contains(videoClassName) &&
            element.querySelector(`.${videoClassName}`) === null
          ) {
            return
          }
          logger.debug('初始化卡片')
          // 初始化卡片
          insertPreviewButton(getInsertNode(element), btnClassName)
        })
      })
    })
  }
  // #endregion

  // 初始化预览容器
  logger.debug('初始化预览容器')
  await initPreviewContainer()

  // 初始化预览放大按钮
  if (document.URL.replace(window.location.search, '') === 'https://www.bilibili.com/') {
    logger.debug('初始化首页预览放大按钮')
    // 首页
    initPreviewButton(
      'bigger-preview-button-index',
      'v-inline-player',
      '.container',
      element => element,
    )
  } else if (document.URL.startsWith('https://www.bilibili.com/video/')) {
    logger.debug('初始化视频页预览放大按钮')
    // 视频页
    initPreviewButton(
      'bigger-preview-button-video',
      'v-recommend-inline-player',
      '.recommend-list-v1',
      element => element.parentElement,
    )
  }
}

export const component = defineComponentMetadata({
  name: 'biggerPreview',
  displayName: '预览放大',
  entry,
  tags: [componentsTags.utils],
})
