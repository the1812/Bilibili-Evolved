import { EpisodeInfo } from '@/components/video/video-info'
import { TimeFormat } from './options'
import { Tag, ViewPoint } from './types'

export function escape(x: any) {
  return lodash.toString(x).replace(/[=;#\\\n]/g, r => `\\${r}`)
}

export function tagWithId(tags: Tag[]) {
  return tags.map(x => `${x.tag_name}(${x.tag_id})`)
}

export function fixBgmTag(bgmTags: Tag[]) {
  return bgmTags.map(
    x => `${x.tag_name.match(/^发现《([^》]+)》/)?.[1] ?? x.tag_name}(${x.music_id})`,
  )
}

export function bangumiSkipToViewPoints(skip: EpisodeInfo['skip'], duration: number) {
  const p: ViewPoint[] = []

  const { op, ed } = skip
  const hasOp = op.start >= 0 && op.end > 0
  const hasEd = ed.start > op.end && ed.end <= duration

  if (hasOp && op.start > 0) {
    // OP前的部分
    p.push({ from: 0, to: op.start, content: '' })
  }

  if (hasOp) {
    p.push({ from: op.start, to: op.end, content: 'Opening Theme' })
  }

  // 正片
  if (hasOp && hasEd) {
    // OP+ED
    p.push({ from: op.end, to: ed.start, content: '' })
  } else if (hasOp && !hasEd) {
    // 仅OP
    p.push({ from: op.end, to: duration, content: '' })
  } else if (!hasOp && hasEd) {
    // 仅ED
    p.push({ from: 0, to: ed.start, content: '' })
  } else {
    // 没有OP和ED，不分段
    // viewPotins.push({ from: 0, to: duration, content: '' })
  }

  if (hasEd) {
    p.push({ from: ed.start, to: ed.end, content: 'Ending Theme' })
  }

  if (hasEd && ed.end < duration) {
    // ED后的部分
    p.push({ from: ed.end, to: duration, content: '' })
  }

  return p
}

export function formatTime(date: Date, format: TimeFormat) {
  switch (format) {
    case TimeFormat.Timestmp:
      return date.getTime()
    case TimeFormat.Local:
      return date.toLocaleString()
    case TimeFormat.ISO:
      return date.toISOString()
    default:
      break
  }
  return 0
}
