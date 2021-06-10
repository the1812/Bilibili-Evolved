import { ComponentMetadata, componentsTags } from '@/components/component'
import { none } from '@/core/utils'
import { toggleStyle } from '@/components/styled-component'

export const component: ComponentMetadata = {
  name: 'simplifyComments',
  displayName: '简化评论区',
  entry: none,
  description: {
    'zh-CN': `
- 删除热评头像下方的关注按钮
- 删除用户的等级标识
- 删除发送源信息(<span>来自安卓客户端</span>这种)
- 删除用户名右边的勋章
- 删除评论区顶部的横幅
- 发送时间移动到右上角
- 位图图标全部换用矢量图标, 高分屏不会模糊
- 投票仅显示链接, 隐藏下面的大框.

> 注: 关注和等级可以通过鼠标停留在头像上, 在弹出的资料卡小窗中查看.`.trim(),
  },
  tags: [
    componentsTags.style,
  ],
  enabledByDefault: true,
  ...toggleStyle(() => import('./comments.scss')),
}
