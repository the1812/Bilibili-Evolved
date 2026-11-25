export enum Preset {
  Standard = '标准',
  Minimal = '极简',
  Data = '数据',
  Markdown = 'Markdown',
  Link = '纯链接',
  Json = 'JSON',
  Custom = '自定义',
}

export enum DateFormat {
  Iso = 'YYYY-MM-DD',
  Chinese = 'YYYY年M月D日',
  Relative = '相对时间',
}

export enum DurationFormat {
  Clock = '18:42',
  Text = '18分42秒',
}

export enum CountFormat {
  Short = '缩写',
  Raw = '原值',
}

export const presetTemplates: Record<Preset, string> = {
  [Preset.Standard]: '【{up}】{title}\n⏱ {duration} · ▶ {views} · 👍 {likes}\n{short_url}',
  [Preset.Minimal]: '{title} {short_url}',
  [Preset.Data]:
    '{title}\n时长 {duration} · 播放 {views} · 点赞 {likes} · 投币 {coins}\n{short_url}',
  [Preset.Markdown]: '[{title}]({url}) — {up} · {duration}',
  [Preset.Link]: '{short_url}',
  [Preset.Json]:
    '{"title":"{title}","up":"{up}","bvid":"{bv}","duration":"{duration}","views":"{views}","likes":"{likes}","url":"{url}"}',
  [Preset.Custom]: '',
}

export const defaultTemplate = presetTemplates[Preset.Standard]

export const knownVariables = [
  'title',
  'up',
  'uid',
  'up_url',
  'bv',
  'av',
  'aid',
  'url',
  'short_url',
  'date',
  'duration',
  'views',
  'danmaku',
  'likes',
  'coins',
  'favorites',
  'replies',
  'shares',
  'tname',
  'part',
  'p',
  'page_count',
  'desc',
  'cover',
  'cover_image',
]

const variablePattern = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g

export const findUnknownVariables = (template: string) => {
  const known = new Set(knownVariables)
  const unknown = new Set<string>()
  template.replace(variablePattern, (raw, name: string) => {
    if (!known.has(name)) {
      unknown.add(name)
    }
    return raw
  })
  return [...unknown]
}
