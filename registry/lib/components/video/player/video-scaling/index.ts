import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { componentsTags } from '@/components/types'
import { addStyle } from '@/core/style'
import { addMenuItem } from '@/components/video/video-context-menu'
import { addControlBarButton } from '@/components/video/video-control-bar'
import { ScalingMode, DropdownItem } from './types'

// 导入样式
import './styles.scss'

const options = defineOptionsMetadata({
  scalingMode: {
    defaultValue: 'none' as ScalingMode,
    displayName: '缩放模式',
    dropdownEnum: [
      { label: '默认', value: 'none' },
      { label: '拉伸填充', value: 'fill' },
      { label: '保持比例填充', value: 'cover' },
      { label: '保持比例显示', value: 'contain' },
      { label: '自定义缩放', value: 'custom' },
    ],
  },
  customScale: {
    defaultValue: 1.2,
    displayName: '自定义缩放比例',
    hidden: false,
    slider: {
      min: 1,
      max: 2,
      step: 0.05,
    },
  },
})

export type Options = OptionsOfMetadata<typeof options>

// 全局变量存储当前缩放模式
let currentScalingMode: ScalingMode = 'none'
let cleanupMenuItems: HTMLElement[] = []

export const component = defineComponentMetadata({
  name: 'videoScaling',
  displayName: '视频内容缩放',
  description: '调整视频显示比例，去除黑边，提供多种缩放模式',
  tags: [componentsTags.video],
  author: { name: 'weedy233', link: 'https://github.com/weedy233' },
  entry: async () => {
    // 获取当前设置
    currentScalingMode = component.options.scalingMode.defaultValue

    // 获取缩放样式
    function getScalingStyles(mode: ScalingMode): string {
      switch (mode) {
        case 'fill':
          return `
            .bilibili-player-video video,
            video[class^="bpx-player-video-element"],
            .bilibili-player-video .bpx-player-video-element {
              object-fit: fill !important;
            }
          `
        case 'cover':
          return `
            .bilibili-player-video video,
            video[class^="bpx-player-video-element"],
            .bilibili-player-video .bpx-player-video-element {
              object-fit: cover !important;
            }
          `
        case 'contain':
          return `
            .bilibili-player-video video,
            video[class^="bpx-player-video-element"],
            .bilibili-player-video .bpx-player-video-element {
              object-fit: contain !important;
            }
          `
        case 'custom':
          return `
            .bilibili-player-video video,
            video[class^="bpx-player-video-element"],
            .bilibili-player-video .bpx-player-video-element {
              object-fit: fill !important;
              transform: scale(${component.options.customScale.defaultValue}) !important;
              transform-origin: center !important;
            }
          `
        default:
          return ''
      }
    }

    // 应用缩放样式
    function applyScaling(mode: ScalingMode) {
      // 移除之前的样式
      document.head.querySelector('[data-id="video-scaling"]')?.remove()

      if (mode === 'none') {
        return
      }

      const styles = getScalingStyles(mode)
      addStyle(styles, 'video-scaling')
    }

    // 切换缩放模式
    function switchScalingMode(mode: ScalingMode) {
      currentScalingMode = mode
      applyScaling(mode)
    }

    // 下拉菜单项配置
    const dropdownItems: DropdownItem[] = [
      { id: 'none', text: '默认', onClick: () => switchScalingMode('none') },
      { id: 'fill', text: '拉伸填充', onClick: () => switchScalingMode('fill') },
      { id: 'cover', text: '保持比例填充', onClick: () => switchScalingMode('cover') },
      { id: 'contain', text: '保持比例显示', onClick: () => switchScalingMode('contain') },
      { id: 'custom', text: '自定义缩放', onClick: () => switchScalingMode('custom') },
    ]

    // 注册控制栏按钮
    await addControlBarButton({
      name: 'video-scaling',
      displayName: '缩放',
      icon: '\u{ea42}', // 缩放图标
      order: 900,
      action: () => {
        // 在实际实现中，这里会打开下拉菜单
        console.log('缩放按钮被点击')
      },
    })

    // 添加右键菜单
    const scalingMenuDiv = document.createElement('div')
    scalingMenuDiv.textContent = '视频缩放'
    cleanupMenuItems = []

    await addMenuItem(scalingMenuDiv, menu => {
      // 清理之前添加的菜单项
      cleanupMenuItems.forEach(item => item.remove())
      cleanupMenuItems.length = 0

      if (!menu.isOpen) {
        return
      }

      // 添加子菜单项
      dropdownItems.forEach((item, index) => {
        const subMenuItem = document.createElement('li')
        subMenuItem.classList.add('context-line', 'context-menu-function')
        subMenuItem.setAttribute('data-append', '1')
        subMenuItem.style.paddingLeft = '40px'

        const linkWrapper = document.createElement('a')
        linkWrapper.classList.add('context-menu-a', 'js-action')
        linkWrapper.href = 'javascript:void(0);'
        linkWrapper.textContent = item.text
        linkWrapper.addEventListener('click', e => {
          e.preventDefault()
          e.stopPropagation()
          item.onClick()
          // 关闭菜单
          menu.containerElement.classList.remove('active')
        })

        subMenuItem.appendChild(linkWrapper)
        menu.listElement.insertBefore(
          subMenuItem,
          menu.listElement.children[menu.itemElements.length + index],
        )
        cleanupMenuItems.push(subMenuItem)
      })
    })

    // 准备清理函数
    const cleanup = () => {
      // 移除样式
      document.head.querySelector('[data-id="video-scaling"]')?.remove()
      scalingMenuDiv.remove()
      cleanupMenuItems.forEach(item => item.remove())
    }

    // 初始应用缩放
    applyScaling(currentScalingMode)

    return cleanup
  },
  options,
})
