import { Toast } from '@/core/toast'
import type { VideoDataChangeDetail } from '@/core/observer'
import { SectionMode, type ComponentMemory, type MarkingInstruction } from './types'
import { jumpToInstruction, resolveJumpTargets, type JumpInstruction } from './navigation'
import { isSameAsLastPlayedInstruction } from './marking'

const firstLoadPromptDuration = 10e3

const promptJumpToLastPlayed = async (
  instruction: MarkingInstruction,
  currentMemory: ComponentMemory,
  detail: VideoDataChangeDetail,
  title: string,
  signal?: AbortSignal,
) => {
  if (signal?.aborted) {
    return 'ignore' as const
  }
  const promptId = lodash.uniqueId('remember-video-collection-')
  const { nextLabel, canJumpNext, lastPlayedLabel } = resolveJumpTargets({
    currentInstructions: [instruction],
    currentMemory,
    currentDetail: detail,
    sectionMode: SectionMode.Unified,
  })
  const labelHtml = lastPlayedLabel
    ? `<button type="button" class="be-rvc-prompt-target be-rvc-prompt-target-primary" data-rvc-action="jump-${promptId}">
        <span class="be-rvc-prompt-target-caption">上次播放</span>
        <span class="be-rvc-prompt-target-text"><strong>${lodash.escape(
          lastPlayedLabel,
        )}</strong></span>
      </button>`
    : ''
  const nextLabelHtml =
    canJumpNext && nextLabel
      ? `<button type="button" class="be-rvc-prompt-target be-rvc-prompt-target-secondary" data-rvc-action="jump-next-${promptId}">
          <span class="be-rvc-prompt-target-caption">下一个</span>
          <span class="be-rvc-prompt-target-text"><strong>${lodash.escape(
            nextLabel,
          )}</strong></span>
        </button>`
      : ''
  const toast = Toast.info(
    `<div class="be-rvc-prompt">
      <div class="be-rvc-prompt-summary">检测到上次播放位置与当前不一致，点击下方卡片即可跳转：</div>
      <div class="be-rvc-prompt-targets">
        ${labelHtml}
        ${nextLabelHtml}
      </div>
    </div>`,
    title,
    firstLoadPromptDuration,
  )
  return new Promise<'jump' | 'jump-next' | 'ignore'>(resolve => {
    let settled = false
    const cleanups: Array<() => void> = []
    const finish = (result: 'jump' | 'jump-next' | 'ignore') => {
      if (settled) {
        return
      }
      settled = true
      cleanups.forEach(cleanup => cleanup())
      toast.close()
      resolve(result)
    }
    const timer = window.setTimeout(() => finish('ignore'), firstLoadPromptDuration)
    cleanups.push(() => clearTimeout(timer))
    if (signal) {
      const abortHandler = () => finish('ignore')
      signal.addEventListener('abort', abortHandler, { once: true })
      cleanups.push(() => signal.removeEventListener('abort', abortHandler))
    }
    toast.element.then(element => {
      if (settled || !(element instanceof HTMLElement)) {
        return
      }
      const bindAction = (selector: string, result: 'jump' | 'jump-next' | 'ignore') => {
        const node = element.querySelector(selector)
        if (!(node instanceof HTMLElement)) {
          return
        }
        const handler = (event: Event) => {
          event.preventDefault()
          event.stopPropagation()
          finish(result)
        }
        node.addEventListener('click', handler)
        cleanups.push(() => node.removeEventListener('click', handler))
      }
      bindAction(`[data-rvc-action="jump-${promptId}"]`, 'jump')
      if (canJumpNext) {
        bindAction(`[data-rvc-action="jump-next-${promptId}"]`, 'jump-next')
      }
      const closeButton = element.querySelector('.toast-card-close')
      if (closeButton instanceof HTMLElement) {
        const handler = () => finish('ignore')
        closeButton.addEventListener('click', handler)
        cleanups.push(() => closeButton.removeEventListener('click', handler))
      }
    })
  })
}

export const handleFirstLoadPrompt = async ({
  currentInstructions,
  currentMemory,
  currentDetail,
  enabled,
  signal,
  title,
  sectionMode,
}: {
  currentInstructions: MarkingInstruction[]
  currentMemory: ComponentMemory
  currentDetail: VideoDataChangeDetail
  enabled: boolean
  signal?: AbortSignal
  title: string
  sectionMode: SectionMode
}) => {
  const { lastPlayedInstruction, nextInstruction, canJumpNext } = resolveJumpTargets({
    currentInstructions,
    currentMemory,
    currentDetail,
    sectionMode,
  })
  if (
    !enabled ||
    signal?.aborted ||
    !lastPlayedInstruction ||
    isSameAsLastPlayedInstruction(currentMemory, lastPlayedInstruction)
  ) {
    return {
      action: 'continue' as const,
      lastPlayedInstruction,
    }
  }
  const action = await promptJumpToLastPlayed(
    lastPlayedInstruction,
    currentMemory,
    currentDetail,
    title,
    signal,
  )
  if ((action !== 'jump' && action !== 'jump-next') || signal?.aborted) {
    return {
      action: 'continue' as const,
      lastPlayedInstruction,
    }
  }
  const jumpInstruction: JumpInstruction =
    action === 'jump-next' && canJumpNext ? nextInstruction : lastPlayedInstruction

  const jumpSucceeded = jumpToInstruction(jumpInstruction)
  return {
    action,
    lastPlayedInstruction,
    jumpSucceeded,
  }
}
