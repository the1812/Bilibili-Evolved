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
    // #region 局部定义
    /**
     * 切换预览按钮图标
     * @param show 是否显示预览
     * @param btn 预览按钮实例
     */
    const toggleButtonIcon = (show: boolean, btn: any) => {
      btn.enlarged = show
    }

    /**
     * 鼠标移出事件处理函数
     * @param {MouseEvent} event - 鼠标事件
     */
    const onMouseExitHandler = (event: MouseEvent) => {
      event.stopPropagation()
    }

    /**
     * 切换鼠标移出事件监听
     * @param {boolean} show - 是否显示预览
     * @param {Element} movingDom - 预览元素的 DOM
     */
    const toggleMouseExitHandler = (show: boolean, movingDom: Element) => {
      if (show) {
        movingDom.addEventListener('mouseleave', onMouseExitHandler, true)
      } else {
        movingDom.removeEventListener('mouseleave', onMouseExitHandler, true)
        // 触发mouseleave事件停止预览
        const mouseLeaveEvent = new MouseEvent('mouseleave')
        movingDom.dispatchEvent(mouseLeaveEvent)
      }
    }

    /**
     * 切换视频控件显示
     * @param {Element} movingDom - 预览元素的 DOM
     * @param {boolean} show - 是否显示控件
     */
    const toggleVideoControls = (movingDom: Element, show: boolean) => {
      const video = movingDom.querySelector('video')
      if (video) {
        video.controls = show
      }
    }

    // 提升 popupChangeHandler 到外部作用域，确保引用一致
    let popupChangeHandler: (show: boolean) => void
    // #endregion

    // 创建 Vue 实例
    const ComponentClass = Vue.extend(PreviewButton)
    const instance = new ComponentClass({
      propsData: {
        btnClass: className,
        btnOnClickCallback: (e: MouseEvent) => {
          e.preventDefault()

          if (!videoContainer) {
            return
          }

          const movingDom = instance.$el.parentElement.closest('.bili-video-card__image,.pic-box')

          // 监听弹窗状态变化事件
          if (!popupChangeHandler) {
            popupChangeHandler = (show: boolean) => {
              // 切换按钮图标
              toggleButtonIcon(show, instance)

              // 切换鼠标移出事件监听
              toggleMouseExitHandler(show, movingDom)

              // 切换视频控件显示
              toggleVideoControls(movingDom, show)

              if (!show) {
                videoContainer.$off('popup-change', popupChangeHandler)
              }
            }
          }

          // 根据当前状态切换预览
          if (instance.enlarged) {
            videoContainer.closePopup()
          } else {
            videoContainer.$off('popup-change', popupChangeHandler)
            videoContainer.$on('popup-change', popupChangeHandler)
            videoContainer.openPopup(movingDom)
          }
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
      // 检查父元素下是否已经有该按钮，避免重复插入
      if (it.parentElement.querySelector(`.${className}`)) {
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
