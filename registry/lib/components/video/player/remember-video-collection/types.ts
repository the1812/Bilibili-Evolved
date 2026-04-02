import { UnknownOptions } from '@/components/types'

export interface ComponentMemory {
  bvid: string
  cid: number
  page?: number
  sectionId?: number
  sectionRootId?: number
  timestamp: number
}

export type ComponentHistory = ComponentMemory[]

export type HistoryScope = { type: string } & Partial<
  Pick<ComponentMemory, 'bvid' | 'sectionId' | 'sectionRootId'>
>

export interface MarkingInstruction {
  bvid?: string
  cid?: number
  page?: number
  sectionId?: number
  timestamp: number
  type: 'last-played' | 'watched'
}

export enum SectionMode {
  Split = '分别记忆',
  Unified = '统一记忆',
}
export enum MarkingStyle {
  Default = '不区分',
  Distinguish = '区分',
}

export interface ComponentOptions extends UnknownOptions {
  history: ComponentHistory
  markingStyle: MarkingStyle
  sectionMode: SectionMode
  showPrompt: boolean
}
