import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'
import { AIProviderConfig } from '@/core/ai/types'

export const options = defineOptionsMetadata({
  providers: {
    defaultValue: [] as AIProviderConfig[],
    hidden: true,
  },
})

export type AIProviderOptions = OptionsOfMetadata<typeof options>
