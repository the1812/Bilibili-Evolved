import { OptionsOfMetadata, defineOptionsMetadata } from '@/components/define'
import { getNumberValidator } from '@/core/utils'

export const ChatPanelFitOptionsMinWidth = 190
export const chatPanelFitOptions = defineOptionsMetadata({
  customWidth: {
    hidden: true,
    defaultValue: 0,
  },
  maxWidth: {
    defaultValue: 1000,
    displayName: '侧边栏最大宽度 (px)',
    validator: getNumberValidator(ChatPanelFitOptionsMinWidth),
  },
})
export type ChatPanelFitOptions = OptionsOfMetadata<typeof chatPanelFitOptions>
