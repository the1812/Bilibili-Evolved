import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'

export const commentContentReplaceOptions = defineOptionsMetadata({
  replaceMap: {
    defaultValue: {} as Record<string, string>,
    hidden: true,
  },
})

export type CommentContentReplaceOptions = OptionsOfMetadata<typeof commentContentReplaceOptions>
