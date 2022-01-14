import { ComponentMetadata } from '@/components/types'

const showSideBar = () => {
  const sidebar = dq('.be-settings .sidebar') as HTMLElement
  sidebar.style.transform = 'translateX(calc(-50% * var(--direction))) translateY(-50%)'
}

const hideSideBar = () => {
  const sidebar = dq('.be-settings .sidebar') as HTMLElement
  sidebar.style.transform = ''
}

const mouseLeaveListener = (e: MouseEvent) => {
  // 从左侧离开
  if (e.clientX < 0) {
    showSideBar()
  }
}

const mountListener = () => {
  document.addEventListener('mouseleave', mouseLeaveListener)
  document.addEventListener('mouseenter', hideSideBar)
}

const unMountListener = () => {
  document.removeEventListener('mouseleave', mouseLeaveListener)
  document.removeEventListener('mouseenter', hideSideBar)
}

export const component: ComponentMetadata = {
  name: 'autoHideSidebar',
  entry: () => {
    mountListener()
  },
  reload: () => {
    mountListener()
    hideSideBar()
  },
  unload: () => {
    unMountListener()
    showSideBar()
  },
  displayName: '自动隐藏侧栏',
  instantStyles: [
    {
      name: 'autoHideSidebar',
      style: () => import('./auto-hide-sidebar.scss'),
      important: true,
    },
  ],
  tags: [componentsTags.style, componentsTags.general],
  description: {
    'zh-CN': '自动隐藏脚本的侧栏 (功能和设置图标). 设置面板停靠在右侧时不建议使用, 因为网页的滚动条会占用右边缘的触发区域.',
  },
}
