import { wrapSwitchOptions } from '@/components/switch-options'

const name = 'simplifyComments'
export const component = wrapSwitchOptions({
  name: 'simplifyOptions',
  switchProps: {
    checkedIcon: 'mdi-checkbox-marked-circle',
    notCheckedIcon: 'mdi-checkbox-blank-circle-outline',
  },
  dimAt: false,
  switches: {
    userLevel: {
      defaultValue: true,
      displayName: '用户等级',
    },
    decorateAndTime: {
      defaultValue: true,
      displayName: '装扮 & 时间',
    },
    userPendent: {
      defaultValue: false,
      displayName: '头像框',
    },
    subReplyNewLine: {
      defaultValue: true,
      displayName: '回复换行',
    },
    replyEditor: {
      defaultValue: true,
      displayName: '编辑框',
    },
    fansMedal: {
      defaultValue: false,
      displayName: '粉丝勋章',
    },
    eventBanner: {
      defaultValue: true,
      displayName: '活动横幅',
    },
  },
})({
  name,
  displayName: '简化评论区',
  entry: async ({ metadata }) => {
    const { addComponentListener } = await import('@/core/settings')
    addComponentListener(
      metadata.name,
      (value: boolean) => {
        document.body.classList.toggle('simplify-comment', value)
      },
      true,
    )
  },
  instantStyles: [
    {
      name,
      style: () => import('./comments.scss'),
    },
    {
      name,
      style: () => import('./comments-v2.scss'),
    },
  ],
  tags: [componentsTags.style],
})
